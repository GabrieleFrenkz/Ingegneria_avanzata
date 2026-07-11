require "test_helper"

module Api
  class ProductsControllerTest < ActionDispatch::IntegrationTest
    def setup
      @product1 = Product.create!(
        id: "prod-1",
        title: "Maglietta blu",
        description: "Maglietta in cotone blu",
        price: 20.0,
        original_price: 25.0,
        quantity: 10,
        sale: true,
        thumbnail: "tshirt.jpg",
        tags: [ "abbigliamento" ],
        created_at: 3.days.ago
      )

      @product2 = Product.create!(
        id: "prod-2",
        title: "Scarpe da corsa",
        description: "Scarpe sportive leggere",
        price: 80.0,
        original_price: 80.0,
        quantity: 0,
        sale: false,
        thumbnail: "shoes.jpg",
        tags: [ "sport" ],
        created_at: 2.days.ago
      )

      @product3 = Product.create!(
        id: "prod-3",
        title: "Zaino blu",
        description: "Zaino da trekking",
        price: 50.0,
        original_price: 60.0,
        quantity: 5,
        sale: true,
        thumbnail: "backpack.jpg",
        tags: [ "outdoor" ],
        created_at: 1.day.ago
      )
    end

    # ─── GET /api/products ─────────────────────────────────────────────────────

    test "index restituisce tutti i prodotti" do
      get "/api/products"

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal 3, json.length
    end

    test "index restituisce i prodotti in formato camelCase" do
      get "/api/products"

      assert_response :ok
      json = JSON.parse(response.body)
      product = json.find { |p| p["id"] == "prod-1" }

      assert_equal "Maglietta blu", product["title"]
      assert_equal 25.0, product["originalPrice"]
      assert_equal true, product["inStock"]
      assert product.key?("createdAt")
    end

    test "index filtra per title nel titolo del prodotto" do
      get "/api/products", params: { title: "Maglietta" }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-1" ], json.map { |p| p["id"] }
    end

    test "index filtra per title nella descrizione del prodotto" do
      get "/api/products", params: { title: "trekking" }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-3" ], json.map { |p| p["id"] }
    end

    test "index filtra per min_price" do
      get "/api/products", params: { min_price: 50 }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-2", "prod-3" ].sort, json.map { |p| p["id"] }.sort
    end

    test "index filtra per max_price" do
      get "/api/products", params: { max_price: 20 }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-1" ], json.map { |p| p["id"] }
    end

    test "index filtra per range min_price e max_price" do
      get "/api/products", params: { min_price: 30, max_price: 60 }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-3" ], json.map { |p| p["id"] }
    end

    test "index ordina per price_asc" do
      get "/api/products", params: { sort: "price_asc" }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-1", "prod-3", "prod-2" ], json.map { |p| p["id"] }
    end

    test "index ordina per price_desc" do
      get "/api/products", params: { sort: "price_desc" }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-2", "prod-3", "prod-1" ], json.map { |p| p["id"] }
    end

    test "index ordina per date_asc" do
      get "/api/products", params: { sort: "date_asc" }

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-1", "prod-2", "prod-3" ], json.map { |p| p["id"] }
    end

    test "index ordina per date_desc di default quando sort non è specificato" do
      get "/api/products"

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal [ "prod-3", "prod-2", "prod-1" ], json.map { |p| p["id"] }
    end

    test "PBT: qualunque range min_price/max_price, tutti i prodotti restituiti hanno il prezzo nel range" do
      property_of {
        a = range(0, 100)
        b = range(0, 100)
        a <= b ? [ a, b ] : [ b, a ]
      }.check(50) do |bounds|
        min_price, max_price = bounds

        get "/api/products", params: { min_price: min_price, max_price: max_price }

        assert_response :ok
        json = JSON.parse(response.body)

        json.each do |product|
          assert product["price"] >= min_price,
            "prodotto #{product['id']} con prezzo #{product['price']} sotto il min_price #{min_price}"
          assert product["price"] <= max_price,
            "prodotto #{product['id']} con prezzo #{product['price']} sopra il max_price #{max_price}"
        end
      end
    end

    # ─── GET /api/products/:id ──────────────────────────────────────────────────

    test "show restituisce il prodotto richiesto" do
      get "/api/products/#{@product1.id}"

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal "prod-1", json["id"]
      assert_equal "Maglietta blu", json["title"]
    end

    test "show con prodotto inesistente restituisce 404" do
      get "/api/products/id-inesistente"

      assert_response :not_found
      json = JSON.parse(response.body)

      assert_equal "Product not found", json["error"]
    end
  end
end
