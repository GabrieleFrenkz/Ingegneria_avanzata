module Api
  module Admin
    class ProductsController < ApplicationController
      before_action :require_admin!

      # POST /api/admin/products
      def create
        product = Product.new(product_params)

        if product.save
          render json: {
            message: 'Product created successfully',
            product: product.as_json
          }, status: :created
        else
          render json: {
            error: 'Failed to create product',
            errors: product.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/admin/products/:id
      def update
        product = Product.find(params[:id])

        if product.update(product_params)
          render json: {
            message: 'Product updated successfully',
            product: product.as_json
          }, status: :ok
        else
          render json: {
            error: 'Failed to update product',
            errors: product.errors.full_messages
          }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Product not found' }, status: :not_found
      end

      # DELETE /api/admin/products/:id
      def destroy
        product = Product.find(params[:id])
        product.destroy

        render json: {
          message: 'Product deleted successfully'
        }, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Product not found' }, status: :not_found
      end

      # PATCH /api/admin/products/:id/adjust_quantity
      def adjust_quantity
        product = Product.find(params[:id])
        adjustment = params[:adjustment].to_i

        new_quantity = product.quantity + adjustment

        if new_quantity < 0
          render json: { error: 'Quantity cannot be negative' }, status: :unprocessable_entity
          return
        end

        product.update!(quantity: new_quantity)

        render json: {
          message: 'Quantity adjusted successfully',
          product: product.as_json
        }, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Product not found' }, status: :not_found
      end

      private

      def product_params
        params.require(:product).permit(
          :id,
          :title,
          :description,
          :price,
          :original_price,
          :sale,
          :thumbnail,
          :quantity,
          tags: []
        )
      end
    end
  end
end
