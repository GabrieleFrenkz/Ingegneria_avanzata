module Api
  class OrdersController < ApplicationController
  # GET /api/orders
  def index
    authenticate_request

    # Se l'utente è admin, mostra tutti gli ordini
    # Altrimenti mostra solo gli ordini dell'utente loggato
    if current_user&.admin?
      @orders = Order.all
    elsif current_user
      @orders = Order.where(user_id: current_user.id)
    else
      # Utenti non autenticati non possono vedere ordini
      render json: { error: 'Not authenticated' }, status: :unauthorized
      return
    end

    # Applica filtri opzionali
    @orders = apply_filters(@orders)

    # Ordina per data di creazione (più recenti prima) e include order_items con prodotti
    @orders = @orders.includes(order_items: :product).order(created_at: :desc)

    render json: @orders
  end

  # POST /api/orders
  def create
    authenticate_request

    # Il frontend invia un oggetto con customer, address, items (array di prodotti), total
    @order = Order.new(
      customer: order_params[:customer],
      address: order_params[:address],
      total: order_params[:total]
    )

    # Collega l'ordine all'utente se autenticato
    @order.user = current_user if current_user

    error_message = nil
    success = false

    # Usa una transazione per garantire atomicità
    ActiveRecord::Base.transaction do
      # Creare order items dall'array di prodotti
      if order_params[:items].present?
        order_params[:items].each do |item|
          product_id = item[:id]
          quantity = item[:quantity].to_i

          # Verifica che il prodotto esista
          product = Product.find_by(id: product_id)
          unless product
            error_message = "Product #{product_id} not found"
            raise ActiveRecord::Rollback
          end

          # Verifica disponibilità sufficiente in magazzino
          if product.quantity < quantity
            error_message = "Product '#{product.title}' has insufficient stock. Available: #{product.quantity}, requested: #{quantity}"
            raise ActiveRecord::Rollback
          end

          @order.order_items.build(
            product_id: product_id,
            quantity: quantity,
            unit_price: item[:price]
          )
        end
      end

      if @order.save
        # Riduci la quantità dei prodotti in magazzino
        @order.order_items.each do |order_item|
          product = order_item.product
          new_quantity = product.quantity - order_item.quantity
          product.update!(quantity: new_quantity)
        end

        success = true
      else
        error_message = @order.errors.full_messages.join(', ')
        raise ActiveRecord::Rollback
      end
    end

    # Render fuori dalla transazione
    if success
      render json: @order, status: :created, include: :order_items
    elsif error_message
      render json: { error: error_message }, status: :unprocessable_entity
    else
      render json: { error: 'Unknown error occurred' }, status: :unprocessable_entity
    end
  end

  private

  def apply_filters(orders)
    # Filtro per data di inizio
    if params[:start_date].present?
      begin
        start_date = Date.parse(params[:start_date])
        orders = orders.where('created_at >= ?', start_date.beginning_of_day)
      rescue ArgumentError
        # Ignora se la data non è valida
      end
    end

    # Filtro per data di fine
    if params[:end_date].present?
      begin
        end_date = Date.parse(params[:end_date])
        orders = orders.where('created_at <= ?', end_date.end_of_day)
      rescue ArgumentError
        # Ignora se la data non è valida
      end
    end

    # Filtro per totale minimo
    if params[:min_total].present?
      min_total = params[:min_total].to_f
      orders = orders.where('total >= ?', min_total)
    end

    # Filtro per totale massimo
    if params[:max_total].present?
      max_total = params[:max_total].to_f
      orders = orders.where('total <= ?', max_total)
    end

    orders
  end

  def order_params
    params.require(:order).permit(
      :total,
      :createdAt,
      customer: [:firstName, :lastName, :email],
      address: [:street, :city, :zip],
      items: [:id, :title, :price, :originalPrice, :sale, :thumbnail, :createdAt, :description, :quantity, :inStock, tags: []]
    )
  end
  end
end
