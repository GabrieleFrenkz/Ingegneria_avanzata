module Api
  class CartsController < ApplicationController
    before_action :require_authentication!
    before_action :ensure_cart, only: [:show, :clear]

    # GET /api/cart
    # Returns current user's cart with all items
    def show
      render json: @cart
    end

    # POST /api/cart/items
    # Add product to cart or update quantity if already exists
    def add_item
      product = Product.find(params[:product_id])

      # Find or create cart for current user
      @cart = current_user.cart || current_user.create_cart

      # Check if product already in cart
      cart_item = @cart.cart_items.find_by(product_id: product.id)

      if cart_item
        # Update quantity
        new_quantity = cart_item.quantity + (params[:quantity]&.to_i || 1)
        cart_item.update!(quantity: new_quantity)
      else
        # Create new cart item with current price
        cart_item = @cart.cart_items.create!(
          product_id: product.id,
          quantity: params[:quantity] || 1,
          unit_price: product.price
        )
      end

      render json: {
        message: 'Product added to cart',
        cart: @cart.as_json,
        item: cart_item.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Product not found' }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        error: 'Failed to add item to cart',
        details: e.record.errors.full_messages
      }, status: :unprocessable_entity
    end

    # PATCH /api/cart/items/:id
    # Update quantity of cart item
    def update_item
      cart_item = current_user.cart.cart_items.find(params[:id])

      if cart_item.update(quantity: params[:quantity])
        render json: {
          message: 'Cart item updated',
          cart: current_user.cart.as_json,
          item: cart_item.as_json
        }, status: :ok
      else
        render json: {
          error: 'Failed to update cart item',
          details: cart_item.errors.full_messages
        }, status: :unprocessable_entity
      end

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Cart item not found' }, status: :not_found
    end

    # DELETE /api/cart/items/:id
    # Remove item from cart
    def remove_item
      cart_item = current_user.cart.cart_items.find(params[:id])
      cart_item.destroy!

      render json: {
        message: 'Item removed from cart',
        cart: current_user.cart.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Cart item not found' }, status: :not_found
    end

    # DELETE /api/cart
    # Clear all items from cart
    def clear
      @cart.clear_items

      render json: {
        message: 'Cart cleared',
        cart: @cart.as_json
      }, status: :ok
    end

    private

    def ensure_cart
      @cart = current_user.cart

      unless @cart
        # Auto-create empty cart if doesn't exist
        @cart = current_user.create_cart
      end
    end
  end
end
