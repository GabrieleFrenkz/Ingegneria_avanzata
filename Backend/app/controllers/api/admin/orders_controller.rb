module Api
  module Admin
    class OrdersController < ApplicationController
      before_action :require_admin!

      # GET /api/admin/orders
      # Dashboard con tutti gli ordini
      def index
        orders = Order.includes(:user, :order_items, :products)
                      .order(created_at: :desc)

        # Opzionalmente filtra per utente
        if params[:user_id].present?
          orders = orders.where(user_id: params[:user_id])
        end

        # Statistiche globali (sempre su TUTTI gli ordini, indipendentemente dai filtri)
        stats = {
          total_orders: Order.count,
          total_revenue: Order.sum(:total).to_f,
          orders_by_status: {
            with_user: Order.where.not(user_id: nil).count,
            guest: Order.where(user_id: nil).count
          }
        }

        render json: {
          orders: orders.map(&:as_json),
          stats: stats
        }, status: :ok
      end

      # GET /api/admin/orders/:id
      def show
        order = Order.includes(:user, order_items: :product).find(params[:id])

        render json: order.as_json, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Order not found' }, status: :not_found
      end

      def destroy
        order = Order.find(params[:id])
        order.destroy
        render json: { message: 'Order deleted successfully' }, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Order not found' }, status: :not_found
      end

      # GET /api/admin/stats
      # Statistiche generali
      def stats
        total_orders = Order.count
        total_revenue = Order.sum(:total).to_f
        total_users = User.where(role: 'user').count
        total_products = Product.count
        low_stock_products = Product.where('quantity < ?', 10).count

        recent_orders = Order.includes(:user)
                             .order(created_at: :desc)
                             .limit(10)

        render json: {
          total_orders: total_orders,
          total_revenue: total_revenue,
          total_users: total_users,
          total_products: total_products,
          low_stock_products: low_stock_products,
          recent_orders: recent_orders.map(&:as_json)
        }, status: :ok
      end
    end
  end
end
