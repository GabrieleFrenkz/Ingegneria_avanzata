require "test_helper"

module Api
  module Admin
    class ProductsControllerTest < ActionDispatch::IntegrationTest
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
      end

      # ─── POST /api/admin/products ───────────────────────────────────────────────

      test "create con utente admin crea un nuovo prodotto" do
        product_params = {
          product: {
            id: "prod-new-1",
            title: "Nuovo Prodotto",
            description: "Descrizione nuovo",
            price: 40.0,
            original_price: 45.0,
            sale: false,
            thumbnail: "new.jpg",
            quantity: 20,
            tags: [ "nuovo" ]
          }
        }

        assert_difference "Product.count", 1 do
          post "/api/admin/products", params: product_params, headers: @admin_headers, as: :json
        end

        assert_response :created
        json = JSON.parse(response.body)

        assert_equal "Product created successfully", json["message"]
        assert_equal "Nuovo Prodotto", json["product"]["title"]
      end

      test "create con dati non validi restituisce errore" do
        product_params = { product: { id: "prod-invalid", title: "" } }

        assert_no_difference "Product.count" do
          post "/api/admin/products", params: product_params, headers: @admin_headers, as: :json
        end

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Failed to create product", json["error"]
      end

      test "create senza autenticazione restituisce 403" do
        product_params = { product: { id: "prod-new-2", title: "Test", price: 10.0, original_price: 10.0, quantity: 1 } }

        assert_no_difference "Product.count" do
          post "/api/admin/products", params: product_params, as: :json
        end

        assert_response :forbidden
      end

      test "create con utente non admin restituisce 403" do
        product_params = { product: { id: "prod-new-3", title: "Test", price: 10.0, original_price: 10.0, quantity: 1 } }

        assert_no_difference "Product.count" do
          post "/api/admin/products", params: product_params, headers: @user_headers, as: :json
        end

        assert_response :forbidden
        json = JSON.parse(response.body)
        assert_equal "Access denied. Admin only.", json["error"]
      end

      # ─── PATCH /api/admin/products/:id ──────────────────────────────────────────

      test "update con utente admin aggiorna il prodotto" do
        patch "/api/admin/products/#{@product.id}",
          params: { product: { title: "Titolo Aggiornato", price: 35.0 } },
          headers: @admin_headers,
          as: :json

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal "Product updated successfully", json["message"]
        assert_equal "Titolo Aggiornato", json["product"]["title"]
        assert_equal 35.0, json["product"]["price"]
      end

      test "update con prodotto inesistente restituisce 404" do
        patch "/api/admin/products/id-inesistente",
          params: { product: { title: "Test" } },
          headers: @admin_headers,
          as: :json

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Product not found", json["error"]
      end

      test "update con dati non validi restituisce errore" do
        patch "/api/admin/products/#{@product.id}",
          params: { product: { price: -5 } },
          headers: @admin_headers,
          as: :json

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Failed to update product", json["error"]
      end

      test "update con utente non admin restituisce 403" do
        patch "/api/admin/products/#{@product.id}",
          params: { product: { title: "Test" } },
          headers: @user_headers,
          as: :json

        assert_response :forbidden
      end

      # ─── DELETE /api/admin/products/:id ─────────────────────────────────────────

      test "destroy con utente admin elimina il prodotto" do
        assert_difference "Product.count", -1 do
          delete "/api/admin/products/#{@product.id}", headers: @admin_headers
        end

        assert_response :ok
        json = JSON.parse(response.body)
        assert_equal "Product deleted successfully", json["message"]
      end

      test "destroy con prodotto inesistente restituisce 404" do
        delete "/api/admin/products/id-inesistente", headers: @admin_headers

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Product not found", json["error"]
      end

      test "destroy con utente non admin restituisce 403" do
        assert_no_difference "Product.count" do
          delete "/api/admin/products/#{@product.id}", headers: @user_headers
        end

        assert_response :forbidden
      end

      # ─── PATCH /api/admin/products/:id/adjust_quantity ──────────────────────────

      test "adjust_quantity con utente admin aumenta la quantità" do
        patch "/api/admin/products/#{@product.id}/adjust_quantity",
          params: { adjustment: 5 },
          headers: @admin_headers,
          as: :json

        assert_response :ok
        json = JSON.parse(response.body)

        assert_equal "Quantity adjusted successfully", json["message"]
        assert_equal 15, json["product"]["quantity"]
      end

      test "adjust_quantity con utente admin diminuisce la quantità" do
        patch "/api/admin/products/#{@product.id}/adjust_quantity",
          params: { adjustment: -3 },
          headers: @admin_headers,
          as: :json

        assert_response :ok
        json = JSON.parse(response.body)
        assert_equal 7, json["product"]["quantity"]
      end

      test "adjust_quantity con risultato negativo restituisce errore" do
        patch "/api/admin/products/#{@product.id}/adjust_quantity",
          params: { adjustment: -100 },
          headers: @admin_headers,
          as: :json

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Quantity cannot be negative", json["error"]

        @product.reload
        assert_equal 10, @product.quantity
      end

      test "adjust_quantity con prodotto inesistente restituisce 404" do
        patch "/api/admin/products/id-inesistente/adjust_quantity",
          params: { adjustment: 1 },
          headers: @admin_headers,
          as: :json

        assert_response :not_found
        json = JSON.parse(response.body)
        assert_equal "Product not found", json["error"]
      end

      test "adjust_quantity con utente non admin restituisce 403" do
        patch "/api/admin/products/#{@product.id}/adjust_quantity",
          params: { adjustment: 1 },
          headers: @user_headers,
          as: :json

        assert_response :forbidden
      end
    end
  end
end
