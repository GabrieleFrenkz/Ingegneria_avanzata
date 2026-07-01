require "test_helper"

module Api
  class WishlistsControllerTest < ActionDispatch::IntegrationTest
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
        id: "prod-wish-1",
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

    # ─── GET /api/wishlist ──────────────────────────────────────────────────────

    test "show restituisce la wishlist dell'utente autenticato" do
      get "/api/wishlist", headers: @headers

      assert_response :ok
      json = JSON.parse(response.body)

      assert json.key?("id")
      assert json.key?("items")
      assert json.key?("itemCount")
      assert_equal @user.id, json["userId"]
    end

    test "show crea automaticamente la wishlist se non esiste" do
      assert_nil @user.wishlist

      assert_difference "Wishlist.count", 1 do
        get "/api/wishlist", headers: @headers
      end

      assert_response :ok
    end

    test "show senza autenticazione restituisce 401" do
      get "/api/wishlist"

      assert_response :unauthorized
    end

    # ─── POST /api/wishlist/items ───────────────────────────────────────────────

    test "add_item aggiunge un prodotto alla wishlist" do
      post "/api/wishlist/items",
        params: { product_id: @product.id },
        headers: @headers,
        as: :json

      assert_response :created
      json = JSON.parse(response.body)

      assert_equal "Product added to wishlist", json["message"]
      assert_equal 1, json["wishlist"]["items"].length
      assert_equal @product.id, json["item"]["productId"]
    end

    test "add_item su un prodotto già in wishlist non lo duplica" do
      post "/api/wishlist/items", params: { product_id: @product.id }, headers: @headers, as: :json

      assert_no_difference "WishlistItem.count" do
        post "/api/wishlist/items", params: { product_id: @product.id }, headers: @headers, as: :json
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Product already in wishlist", json["message"]
    end

    test "add_item con prodotto inesistente restituisce 404" do
      post "/api/wishlist/items",
        params: { product_id: "id-inesistente" },
        headers: @headers,
        as: :json

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Product not found", json["error"]
    end

    test "add_item senza autenticazione restituisce 401" do
      post "/api/wishlist/items",
        params: { product_id: @product.id },
        as: :json

      assert_response :unauthorized
    end

    # ─── DELETE /api/wishlist/items/:id ─────────────────────────────────────────

    test "remove_item rimuove un item dalla wishlist" do
      wishlist = @user.create_wishlist
      wishlist_item = wishlist.wishlist_items.create!(product_id: @product.id)

      assert_difference "WishlistItem.count", -1 do
        delete "/api/wishlist/items/#{wishlist_item.id}", headers: @headers
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Item removed from wishlist", json["message"]
    end

    test "remove_item con item inesistente restituisce 404" do
      @user.create_wishlist

      delete "/api/wishlist/items/99999", headers: @headers

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Wishlist item not found", json["error"]
    end

    test "remove_item senza autenticazione restituisce 401" do
      delete "/api/wishlist/items/1"

      assert_response :unauthorized
    end

    # ─── DELETE /api/wishlist/items/product/:product_id ────────────────────────

    test "remove_item_by_product rimuove un item dalla wishlist tramite product_id" do
      wishlist = @user.create_wishlist
      wishlist.wishlist_items.create!(product_id: @product.id)

      assert_difference "WishlistItem.count", -1 do
        delete "/api/wishlist/items/product/#{@product.id}", headers: @headers
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Item removed from wishlist", json["message"]
    end

    test "remove_item_by_product con prodotto non in wishlist restituisce 404" do
      @user.create_wishlist

      delete "/api/wishlist/items/product/#{@product.id}", headers: @headers

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Product not in wishlist", json["error"]
    end

    test "remove_item_by_product senza autenticazione restituisce 401" do
      delete "/api/wishlist/items/product/#{@product.id}"

      assert_response :unauthorized
    end

    # ─── DELETE /api/wishlist ────────────────────────────────────────────────────

    test "clear svuota tutti gli item dalla wishlist" do
      wishlist = @user.create_wishlist
      wishlist.wishlist_items.create!(product_id: @product.id)

      product2 = Product.create!(
        id: "prod-wish-2",
        title: "Secondo Prodotto",
        description: "Desc",
        price: 10.0,
        original_price: 12.0,
        quantity: 5,
        sale: false,
        thumbnail: "test2.jpg",
        tags: [ "test" ]
      )
      wishlist.wishlist_items.create!(product_id: product2.id)

      assert_difference "WishlistItem.count", -2 do
        delete "/api/wishlist", headers: @headers
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Wishlist cleared", json["message"]
      assert_equal 0, json["wishlist"]["itemCount"]
    end

    test "clear senza autenticazione restituisce 401" do
      delete "/api/wishlist"

      assert_response :unauthorized
    end
  end
end
