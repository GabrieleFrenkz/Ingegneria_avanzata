module Api
  class WishlistsController < ApplicationController
    before_action :require_authentication!
    before_action :ensure_wishlist, only: [:show, :clear]

    # GET /api/wishlist
    # Returns current user's wishlist with all items
    def show
      render json: @wishlist
    end

    # POST /api/wishlist/items
    # Add product to wishlist
    def add_item
      product = Product.find(params[:product_id])

      # Find or create wishlist for current user
      @wishlist = current_user.wishlist || current_user.create_wishlist

      # Check if product already in wishlist
      wishlist_item = @wishlist.wishlist_items.find_by(product_id: product.id)

      if wishlist_item
        render json: {
          message: 'Product already in wishlist',
          wishlist: @wishlist.as_json,
          item: wishlist_item.as_json
        }, status: :ok
      else
        # Create new wishlist item
        wishlist_item = @wishlist.wishlist_items.create!(product_id: product.id)

        render json: {
          message: 'Product added to wishlist',
          wishlist: @wishlist.as_json,
          item: wishlist_item.as_json
        }, status: :created
      end

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Product not found' }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        error: 'Failed to add item to wishlist',
        details: e.record.errors.full_messages
      }, status: :unprocessable_entity
    end

    # DELETE /api/wishlist/items/:id
    # Remove item from wishlist by wishlist_item id
    def remove_item
      wishlist_item = current_user.wishlist.wishlist_items.find(params[:id])
      wishlist_item.destroy!

      render json: {
        message: 'Item removed from wishlist',
        wishlist: current_user.wishlist.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Wishlist item not found' }, status: :not_found
    end

    # DELETE /api/wishlist/items/product/:product_id
    # Remove item from wishlist by product_id (alternative endpoint)
    def remove_item_by_product
      wishlist_item = current_user.wishlist.wishlist_items.find_by!(product_id: params[:product_id])
      wishlist_item.destroy!

      render json: {
        message: 'Item removed from wishlist',
        wishlist: current_user.wishlist.as_json
      }, status: :ok

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Product not in wishlist' }, status: :not_found
    end

    # DELETE /api/wishlist
    # Clear all items from wishlist
    def clear
      @wishlist.clear_items

      render json: {
        message: 'Wishlist cleared',
        wishlist: @wishlist.as_json
      }, status: :ok
    end

    private

    def ensure_wishlist
      @wishlist = current_user.wishlist

      unless @wishlist
        # Auto-create empty wishlist if doesn't exist
        @wishlist = current_user.create_wishlist
      end
    end
  end
end
