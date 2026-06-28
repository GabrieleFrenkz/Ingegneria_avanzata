require "test_helper"

module Api
  class OrdersControllerTest < ActionDispatch::IntegrationTest
    def setup
      # Crea un utente di test
      @user = User.create!(
        email: "test@example.com",
        password: "password123",
        first_name: "Test",
        last_name: "User",
        role: "user"
      )

      # Genera token JWT per autenticazione
      @token = JWT.encode({ user_id: @user.id }, Rails.application.secret_key_base, 'HS256')
      @headers = { 'Authorization' => "Bearer #{@token}" }

      # Crea prodotti di test (con ID stringa)
      @product1 = Product.create!(
        id: "test-product-1",
        title: "Product 1",
        description: "Description 1",
        price: 50.0,
        original_price: 50.0,
        quantity: 10,
        sale: false,
        thumbnail: "product1.jpg",
        tags: ["electronics"]
      )

      @product2 = Product.create!(
        id: "test-product-2",
        title: "Product 2",
        description: "Description 2",
        price: 30.0,
        original_price: 30.0,
        quantity: 5,
        sale: false,
        thumbnail: "product2.jpg",
        tags: ["books"]
      )
    end

    # Test 1: Creazione ordine con successo (utente autenticato)
    test "should create order successfully" do
      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 130.0,
          items: [
            {
              id: @product1.id,
              title: @product1.title,
              price: @product1.price,
              quantity: 2
            },
            {
              id: @product2.id,
              title: @product2.title,
              price: @product2.price,
              quantity: 1
            }
          ]
        }
      }

      assert_difference "Order.count", 1 do
        assert_difference "OrderItem.count", 2 do
          post "/api/orders", params: order_params, headers: @headers, as: :json
        end
      end

      assert_response :created
      json_response = JSON.parse(response.body)

      assert_equal "Mario", json_response["customer"]["firstName"]
      assert_equal "Rossi", json_response["customer"]["lastName"]
      assert_equal "Via Roma 1", json_response["address"]["street"]
      assert_equal 130.0, json_response["total"]
      assert_equal @user.id, Order.last.user_id
    end

    # Test 2: Verifica riduzione quantità prodotti dopo ordine
    test "should decrease product quantities after order creation" do
      initial_quantity_product1 = @product1.quantity
      initial_quantity_product2 = @product2.quantity

      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 130.0,
          items: [
            { id: @product1.id, title: @product1.title, price: @product1.price, quantity: 2 },
            { id: @product2.id, title: @product2.title, price: @product2.price, quantity: 1 }
          ]
        }
      }

      post "/api/orders", params: order_params, headers: @headers, as: :json

      @product1.reload
      @product2.reload

      assert_equal initial_quantity_product1 - 2, @product1.quantity
      assert_equal initial_quantity_product2 - 1, @product2.quantity
    end

    # Test 3: Errore se stock insufficiente
    test "should return error if insufficient stock" do
      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 1500.0,
          items: [
            {
              id: @product1.id,
              title: @product1.title,
              price: @product1.price,
              quantity: 100  # Quantità maggiore dello stock disponibile (10)
            }
          ]
        }
      }

      assert_no_difference "Order.count" do
        post "/api/orders", params: order_params, headers: @headers, as: :json
      end

      assert_response :unprocessable_entity
      json_response = JSON.parse(response.body)
      assert_includes json_response["error"], "insufficient stock"
    end

    # Test 4: Errore se prodotto non esiste
    test "should return error if product not found" do
      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 50.0,
          items: [
            {
              id: 99999,  # ID inesistente
              title: "Non esistente",
              price: 50.0,
              quantity: 1
            }
          ]
        }
      }

      assert_no_difference "Order.count" do
        post "/api/orders", params: order_params, headers: @headers, as: :json
      end

      assert_response :unprocessable_entity
      json_response = JSON.parse(response.body)
      assert_includes json_response["error"], "not found"
    end

    # Test 5: Errore se manca customer
    test "should return error if customer is missing" do
      order_params = {
        order: {
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 50.0,
          items: [
            { id: @product1.id, title: @product1.title, price: @product1.price, quantity: 1 }
          ]
        }
      }

      assert_no_difference "Order.count" do
        post "/api/orders", params: order_params, headers: @headers, as: :json
      end

      assert_response :unprocessable_entity
    end

    # Test 6: Errore se manca address
    test "should return error if address is missing" do
      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          total: 50.0,
          items: [
            { id: @product1.id, title: @product1.title, price: @product1.price, quantity: 1 }
          ]
        }
      }

      assert_no_difference "Order.count" do
        post "/api/orders", params: order_params, headers: @headers, as: :json
      end

      assert_response :unprocessable_entity
    end

    # Test 7: Errore se total è zero o negativo
    test "should return error if total is zero" do
      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario@example.com"
          },
          address: {
            street: "Via Roma 1",
            city: "Milano",
            zip: "20100"
          },
          total: 0,
          items: [
            { id: @product1.id, title: @product1.title, price: @product1.price, quantity: 1 }
          ]
        }
      }

      assert_no_difference "Order.count" do
        post "/api/orders", params: order_params, headers: @headers, as: :json
      end

      assert_response :unprocessable_entity
    end

    # Test 9: GET /api/orders - utente autenticato vede solo i propri ordini
    test "authenticated user should see only their orders" do
      # Crea ordini per l'utente corrente
      order1 = Order.create!(
        total: 100.0,
        customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
        address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
        user: @user
      )

      # Crea un altro utente e un ordine per lui
      other_user = User.create!(
        email: "other@example.com",
        password: "password123",
        first_name: "Other",
        last_name: "User",
        role: "user"
      )

      order2 = Order.create!(
        total: 200.0,
        customer: { firstName: "Luigi", lastName: "Verdi", email: "luigi@example.com" },
        address: { street: "Via Milano 2", city: "Roma", zip: "00100" },
        user: other_user
      )

      get "/api/orders", headers: @headers

      assert_response :success
      json_response = JSON.parse(response.body)

      # L'utente dovrebbe vedere solo il proprio ordine
      assert_equal 1, json_response.length
      assert_equal order1.id, json_response[0]["id"]
    end
  end
end
