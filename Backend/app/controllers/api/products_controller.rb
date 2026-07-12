module Api
  class ProductsController < ApplicationController
    # GET /api/products
    def index
      @products = Product.all

      #Title filter
      if params[:title].present?
        @products = @products.where('title LIKE ? OR description LIKE ?',
                                    "%#{params[:title]}%", "%#{params[:title]}%")
      end

      #Filter for price range
      if params[:min_price].present?
        @products = @products.where('price >= ?', params[:min_price].to_f)
      end
      if params[:max_price].present?
        @products = @products.where('price <= ?', params[:max_price].to_f)
      end

      # Apply sorting (use reorder to replace any previous ordering)
      case params[:sort]
      when 'price_asc'
        @products = @products.reorder(price: :asc)
      when 'price_desc'
        @products = @products.reorder(price: :desc)
      when 'date_asc'
        @products = @products.reorder(created_at: :asc)
      when 'date_desc'
        @products = @products.reorder(created_at: :desc)
      else
        @products = @products.reorder(created_at: :desc) # default: date_desc
      end

      render json: @products
    end

    # GET /api/products/:id
    def show
      @product = Product.find(params[:id])
      render json: @product
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Product not found' }, status: :not_found
    end
  end
end
