class ApplicationController < ActionController::API
  attr_reader :current_user

  # Gestione centralizzata degli errori
  rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
  rescue_from StandardError, with: :handle_standard_error

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header

    begin
      decoded = JWT.decode(header, Rails.application.secret_key_base, true, { algorithm: 'HS256' })
      @current_user = User.find(decoded[0]['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      @current_user = nil
    end
  end

  def require_authentication!
    authenticate_request
    render json: { error: 'Not authenticated' }, status: :unauthorized unless current_user
  end

  def require_admin!
    authenticate_request
    render json: { error: 'Access denied. Admin only.' }, status: :forbidden unless current_user&.admin?
  end

  # Gestione session token per carrelli guest
  def session_token
    @session_token ||= request.headers['X-Session-Token']
  end

  def generate_session_token
    SecureRandom.uuid
  end

  # Trova o crea il carrello corrente (autenticato o guest)
  def find_or_create_cart
    authenticate_request

    if current_user
      # Utente autenticato: cerca per user_id
      cart = current_user.cart || current_user.create_cart

      # Se esiste un carrello guest, uniscilo con quello dell'utente
      if session_token.present?
        guest_cart = Cart.find_by(session_token: session_token)
        if guest_cart && guest_cart.id != cart.id
          cart.merge_with!(guest_cart)
        end
      end

      cart
    elsif session_token.present?
      # Guest con session token esistente
      Cart.find_by(session_token: session_token) || Cart.create!(session_token: session_token)
    else
      # Nuovo guest: genera session token
      new_token = generate_session_token
      response.set_header('X-Session-Token', new_token)
      Cart.create!(session_token: new_token)
    end
  end

  # Trova il carrello corrente senza crearlo
  def find_cart
    authenticate_request

    if current_user
      current_user.cart
    elsif session_token.present?
      Cart.find_by(session_token: session_token)
    end
  end

  # Error handlers centralizzati

  # 400 Bad Request - Parametri mancanti o invalidi
  def handle_parameter_missing(exception)
    render json: {
      error: 'Bad Request',
      message: exception.message,
      details: "Required parameter missing: #{exception.param}"
    }, status: :bad_request
  end

  # 404 Not Found - Risorsa non trovata
  def handle_record_not_found(exception)
    render json: {
      error: 'Not Found',
      message: 'The requested resource was not found',
      details: exception.message
    }, status: :not_found
  end

  # 422 Unprocessable Entity - Validazione fallita
  def handle_record_invalid(exception)
    render json: {
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      details: exception.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  # 500 Internal Server Error - Errori generici non gestiti
  def handle_standard_error(exception)
    # Log dell'errore per debugging (in produzione)
    Rails.logger.error "Internal Server Error: #{exception.class} - #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")

    # In development mostra dettagli, in production nascondi dettagli sensibili
    if Rails.env.development?
      render json: {
        error: 'Internal Server Error',
        message: exception.message,
        details: exception.class.to_s,
        backtrace: exception.backtrace.first(5)
      }, status: :internal_server_error
    else
      render json: {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.'
      }, status: :internal_server_error
    end
  end
end
