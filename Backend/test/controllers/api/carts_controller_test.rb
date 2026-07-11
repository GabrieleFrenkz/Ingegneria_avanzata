require "test_helper"

module Api
  class CartsControllerTest < ActionDispatch::IntegrationTest
    def setup
      @user = User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      @headers = auth_headers_for(@user)

      @product = Product.create!(
        id: "prod-cart-1",
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

    # ─── GET /api/cart ────────────────────────────────────────────────────────

    test "show restituisce il carrello dell'utente autenticato" do
      get "/api/cart", headers: @headers

      assert_response :ok
      json = JSON.parse(response.body)

      assert json.key?("id")
      assert json.key?("items")
      assert json.key?("total")
      assert json.key?("itemCount")
      assert_equal @user.id, json["userId"]
    end

    test "show crea automaticamente il carrello se non esiste" do
      assert_nil @user.cart

      assert_difference "Cart.count", 1 do
        get "/api/cart", headers: @headers
      end

      assert_response :ok
    end

    test "show senza autenticazione restituisce 401" do
      get "/api/cart"

      assert_response :unauthorized
    end

    # ─── POST /api/cart/items ─────────────────────────────────────────────────

    test "add_item aggiunge un prodotto al carrello" do
      post "/api/cart/items",
        params: { product_id: @product.id, quantity: 2 },
        headers: @headers,
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal "Product added to cart", json["message"]
      assert_equal 1, json["cart"]["items"].length
      assert_equal 2, json["item"]["quantity"]
      assert_equal 25.0, json["item"]["unitPrice"]
    end

    test "add_item sullo stesso prodotto incrementa la quantità" do
      post "/api/cart/items",
        params: { product_id: @product.id, quantity: 2 },
        headers: @headers,
        as: :json

      post "/api/cart/items",
        params: { product_id: @product.id, quantity: 3 },
        headers: @headers,
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal 1, json["cart"]["items"].length
      assert_equal 5, json["item"]["quantity"]
    end

    test "add_item con prodotto inesistente restituisce 404" do
      post "/api/cart/items",
        params: { product_id: "id-inesistente", quantity: 1 },
        headers: @headers,
        as: :json

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Product not found", json["error"]
    end

    test "add_item senza autenticazione restituisce 401" do
      post "/api/cart/items",
        params: { product_id: @product.id, quantity: 1 },
        as: :json

      assert_response :unauthorized
    end

    # ─── PATCH /api/cart/items/:id ────────────────────────────────────────────

    test "update_item aggiorna la quantità di un item nel carrello" do
      cart = @user.create_cart
      cart_item = cart.cart_items.create!(
        product_id: @product.id,
        quantity: 2,
        unit_price: @product.price
      )

      patch "/api/cart/items/#{cart_item.id}",
        params: { quantity: 5 },
        headers: @headers,
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal "Cart item updated", json["message"]
      assert_equal 5, json["item"]["quantity"]
    end

    test "update_item con item inesistente restituisce 404" do
      @user.create_cart

      patch "/api/cart/items/99999",
        params: { quantity: 5 },
        headers: @headers,
        as: :json

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Cart item not found", json["error"]
    end

    test "update_item senza autenticazione restituisce 401" do
      patch "/api/cart/items/1",
        params: { quantity: 5 },
        as: :json

      assert_response :unauthorized
    end

    # ─── DELETE /api/cart/items/:id ───────────────────────────────────────────

    test "remove_item rimuove un item dal carrello" do
      cart = @user.create_cart
      cart_item = cart.cart_items.create!(
        product_id: @product.id,
        quantity: 1,
        unit_price: @product.price
      )

      assert_difference "CartItem.count", -1 do
        delete "/api/cart/items/#{cart_item.id}", headers: @headers
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Item removed from cart", json["message"]
    end

    test "remove_item con item inesistente restituisce 404" do
      @user.create_cart

      delete "/api/cart/items/99999", headers: @headers

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Cart item not found", json["error"]
    end

    test "remove_item senza autenticazione restituisce 401" do
      delete "/api/cart/items/1"

      assert_response :unauthorized
    end

    # ─── DELETE /api/cart ─────────────────────────────────────────────────────

    test "clear svuota tutti gli item dal carrello" do
      cart = @user.create_cart
      cart.cart_items.create!(product_id: @product.id, quantity: 2, unit_price: @product.price)

      product2 = Product.create!(
        id: "prod-cart-2",
        title: "Secondo Prodotto",
        description: "Desc",
        price: 10.0,
        original_price: 12.0,
        quantity: 5,
        sale: false,
        thumbnail: "test2.jpg",
        tags: [ "test" ]
      )
      cart.cart_items.create!(product_id: product2.id, quantity: 1, unit_price: product2.price)

      assert_difference "CartItem.count", -2 do
        delete "/api/cart", headers: @headers
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Cart cleared", json["message"]
      assert_equal 0, json["cart"]["itemCount"]
    end

    test "clear senza autenticazione restituisce 401" do
      delete "/api/cart"

      assert_response :unauthorized
    end

    # ─── PBT ───────────────────────────────────────────────────────────────────

    test "PBT: aggiungere più volte lo stesso prodotto accumula correttamente la quantità" do
      # Scorta ampia: qui vogliamo isolare l'invariante sull'accumulo di quantità,
      # non il vincolo di stock (già coperto da altri test dedicati).
      product = Product.create!(
        id: "prod-cart-pbt",
        title: "Prodotto PBT",
        description: "Scorta ampia per il PBT sull'accumulo quantità",
        price: 25.0,
        original_price: 30.0,
        quantity: 1000,
        sale: false,
        thumbnail: "test.jpg",
        tags: [ "test" ]
      )

      property_of {
        array(range(1, 5)) { range(1, 10) }
      }.check(30) do |quantities|
        # Stato pulito ad ogni check, altrimenti le quantità si accumulerebbero tra un check e l'altro
        Cart.find_by(user_id: @user.id)&.cart_items&.destroy_all

        quantities.each do |qty|
          post "/api/cart/items",
            params: { product_id: product.id, quantity: qty },
            headers: @headers,
            as: :json

          assert_response :ok
        end

        json = JSON.parse(response.body)
        expected_quantity = quantities.sum

        assert_equal 1, json["cart"]["items"].length
        assert_equal expected_quantity, json["item"]["quantity"]
        assert_equal expected_quantity * product.price, json["cart"]["total"]
      end
    end
  end
end
