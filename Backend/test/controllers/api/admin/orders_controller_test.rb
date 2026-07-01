require "test_helper"

module Api
  module Admin
    class OrdersControllerTest < ActionDispatch::IntegrationTest
      def setup
        @admin = User.create!(
          email: "admin@example.com",
          password: "password123",
          first_name: "Admin",
          last_name: "User",
          role: "admin"
        )
        @admin_headers = auth_headers_for(@admin)

        @user = User.create!(
          email: "mario@example.com",
          password: "password123",
          first_name: "Mario",
          last_name: "Rossi",
          role: "user"
        )
        @user_headers = auth_headers_for(@user)

        @product = Product.create!(
          id: "prod-admin-1",
          title: "Prodotto Test",
          description: "Descrizione prodotto",
          price: 25.0,
          original_price: 30.0,
          quantity: 10,
          sale: false,
          thumbnail: "test.jpg",
          tags: [ "test" ]
        )

        @order = Order.create!(
          total: 50.0,
          customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
          address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
          user: @user
        )
        @order.order_items.create!(product_id: @product.id, quantity: 2, unit_price: @product.price)

        @guest_order = Order.create!(
          total: 25.0,
          customer: { firstName: "Luigi", lastName: "Verdi", email: "luigi@example.com" },
          address: { street: "Via Milano 2", city: "Roma", zip: "00100" }
        )
        @guest_order.order_items.create!(product_id: @product.id, quantity: 1, unit_price: @product.price)
      end

      # ─── GET /api/admin/orders ──────────────────────────────────────────────────

      test "index con utente admin restituisce tutti gli ordini con le statistiche" do
        get "/api/admin/orders", headers: @admin_headers

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal 2, json["orders"].length
        assert_equal 2, json["stats"]["total_orders"]
        assert_equal 75.0, json["stats"]["total_revenue"]
        assert_equal 1, json["stats"]["orders_by_status"]["with_user"]
        assert_equal 1, json["stats"]["orders_by_status"]["guest"]
      end

      test "index filtra per user_id mantenendo le statistiche globali" do
        get "/api/admin/orders", params: { user_id: @user.id }, headers: @admin_headers

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal 1, json["orders"].length
        assert_equal @order.id, json["orders"].first["id"]
        assert_equal 2, json["stats"]["total_orders"]
      end

      test "index senza autenticazione restituisce 403" do
        get "/api/admin/orders"

        assert_response :forbidden
      end

      test "index con utente non admin restituisce 403" do
        get "/api/admin/orders", headers: @user_headers

        assert_response :forbidden
        json = JSON.parse(response.body)
        assert_equal "Access denied. Admin only.", json["error"]
      end

      # ─── GET /api/admin/orders/:id ──────────────────────────────────────────────

      test "show con utente admin restituisce l'ordine richiesto" do
        get "/api/admin/orders/#{@order.id}", headers: @admin_headers

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal @order.id, json["id"]
        assert_equal 1, json["orderItems"].length
      end

      test "show con ordine inesistente restituisce 404" do
        get "/api/admin/orders/999999", headers: @admin_headers

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Order not found", json["error"]
      end

      test "show con utente non admin restituisce 403" do
        get "/api/admin/orders/#{@order.id}", headers: @user_headers

        assert_response :forbidden
      end

      # ─── DELETE /api/admin/orders/:id ───────────────────────────────────────────

      test "destroy con utente admin elimina l'ordine" do
        assert_difference "Order.count", -1 do
          delete "/api/admin/orders/#{@order.id}", headers: @admin_headers
        end

        assert_response :ok
        json = JSON.parse(response.body)
        assert_equal "Order deleted successfully", json["message"]
      end

      test "destroy con ordine inesistente restituisce 404" do
        delete "/api/admin/orders/999999", headers: @admin_headers

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Order not found", json["error"]
      end

      test "destroy con utente non admin restituisce 403" do
        assert_no_difference "Order.count" do
          delete "/api/admin/orders/#{@order.id}", headers: @user_headers
        end

        assert_response :forbidden
      end

      # ─── GET /api/admin/stats ───────────────────────────────────────────────────

      test "stats con utente admin restituisce le statistiche generali" do
        get "/api/admin/stats", headers: @admin_headers

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal 2, json["total_orders"]
        assert_equal 75.0, json["total_revenue"]
        assert_equal 1, json["total_users"]
        assert_equal 1, json["total_products"]
        assert json.key?("recent_orders")
      end

      test "stats con utente non admin restituisce 403" do
        get "/api/admin/stats", headers: @user_headers

        assert_response :forbidden
      end
    end
  end
end
