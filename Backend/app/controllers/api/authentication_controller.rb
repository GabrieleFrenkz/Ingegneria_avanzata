module Api
  class AuthenticationController < ApplicationController
    # POST /api/register
    def register
      user = User.new(register_params)
      user.role = 'user' # Forza il ruolo a user per la registrazione

      if user.save
        token = generate_token(user)
        render json: {
          message: 'Registration successful',
          user: user.as_json,
          token: token
        }, status: :created
      else
        render json: {
          error: 'Registration failed',
          errors: user.errors.full_messages
        }, status: :unprocessable_entity
      end
    end

    # POST /api/login
    def login
      user = User.find_by(email: login_params[:email])

      if user&.authenticate(login_params[:password])
        token = generate_token(user)
        render json: {
          message: 'Login successful',
          user: user.as_json,
          token: token
        }, status: :ok
      else
        render json: {
          error: 'Invalid email or password'
        }, status: :unauthorized
      end
    end

    # GET /api/me
    def me
      authenticate_request
      if current_user
        render json: current_user.as_json, status: :ok
      else
        render json: { error: 'Not authenticated' }, status: :unauthorized
      end
    end

    private

    def register_params
      params.require(:user).permit(
        :email,
        :password,
        :password_confirmation,
        :first_name,
        :last_name,
        :address
      )
    end

    def login_params
      params.require(:user).permit(:email, :password)
    end

    def generate_token(user)
      # Token JWT semplice con user_id e role
      # In produzione, usare gem 'jwt' per token più sicuri
      payload = {
        user_id: user.id,
        role: user.role,
        exp: 24.hours.from_now.to_i
      }

      JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
    end
  end
end
