require "test_helper"

class ProductTest < ActiveSupport::TestCase
  def valid_attributes
    {
      id: "prod-1",
      title: "Maglietta blu",
      description: "Maglietta in cotone blu",
      price: 20.0,
      original_price: 25.0,
      quantity: 10,
      sale: true,
      thumbnail: "tshirt.jpg",
      tags: [ "abbigliamento" ]
    }
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valido con tutti i campi obbligatori" do
    product = Product.new(valid_attributes)
    assert product.valid?, "Product dovrebbe essere valido con tutti i campi obbligatori"
  end

  test "non valido senza title" do
    product = Product.new(valid_attributes.merge(title: nil))

    assert_not product.valid?
    assert_includes product.errors[:title], "can't be blank"
  end

  test "non valido senza price" do
    product = Product.new(valid_attributes.merge(price: nil))

    assert_not product.valid?
    assert_includes product.errors[:price], "can't be blank"
  end

  test "non valido con price zero o negativo" do
    zero_product = Product.new(valid_attributes.merge(price: 0))
    negative_product = Product.new(valid_attributes.merge(id: "prod-2", price: -10))

    assert_not zero_product.valid?
    assert_includes zero_product.errors[:price], "must be greater than 0"

    assert_not negative_product.valid?
    assert_includes negative_product.errors[:price], "must be greater than 0"
  end

  test "non valido senza original_price" do
    product = Product.new(valid_attributes.merge(original_price: nil))

    assert_not product.valid?
    assert_includes product.errors[:original_price], "can't be blank"
  end

  test "non valido con original_price zero o negativo" do
    product = Product.new(valid_attributes.merge(original_price: 0))

    assert_not product.valid?
    assert_includes product.errors[:original_price], "must be greater than 0"
  end

  test "non valido senza quantity" do
    product = Product.new(valid_attributes.merge(quantity: nil))

    assert_not product.valid?
    assert_includes product.errors[:quantity], "can't be blank"
  end

  test "non valido con quantity negativa" do
    product = Product.new(valid_attributes.merge(quantity: -1))

    assert_not product.valid?
    assert_includes product.errors[:quantity], "must be greater than or equal to 0"
  end

  test "non valido con quantity non intera" do
    product = Product.new(valid_attributes.merge(quantity: 1.5))

    assert_not product.valid?
    assert_includes product.errors[:quantity], "must be an integer"
  end

  test "valido con quantity zero" do
    product = Product.new(valid_attributes.merge(quantity: 0))
    assert product.valid?
  end

  # ─── Metodi helper ───────────────────────────────────────────────────────────

  test "in_stock? restituisce true se la quantità è maggiore di zero" do
    product = Product.new(valid_attributes.merge(quantity: 1))
    assert product.in_stock?
  end

  test "in_stock? restituisce false se la quantità è zero" do
    product = Product.new(valid_attributes.merge(quantity: 0))
    assert_not product.in_stock?
  end

  test "out_of_stock? restituisce true se la quantità è zero" do
    product = Product.new(valid_attributes.merge(quantity: 0))
    assert product.out_of_stock?
  end

  test "out_of_stock? restituisce false se la quantità è maggiore di zero" do
    product = Product.new(valid_attributes.merge(quantity: 1))
    assert_not product.out_of_stock?
  end

  # ─── Associazioni ────────────────────────────────────────────────────────────

  test "distruggere il prodotto distrugge gli order_items associati" do
    product = Product.create!(valid_attributes)
    order = Order.create!(
      total: 20.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    order_item = order.order_items.create!(product_id: product.id, quantity: 1, unit_price: product.price)

    product.destroy

    assert_nil OrderItem.find_by(id: order_item.id)
  end

  test "distruggere il prodotto distrugge i cart_items associati" do
    product = Product.create!(valid_attributes)
    user = User.create!(email: "mario@example.com", password: "password123", first_name: "Mario", last_name: "Rossi")
    cart = user.create_cart
    cart_item = cart.cart_items.create!(product_id: product.id, quantity: 1, unit_price: product.price)

    product.destroy

    assert_nil CartItem.find_by(id: cart_item.id)
  end

  test "distruggere il prodotto distrugge i wishlist_items associati" do
    product = Product.create!(valid_attributes)
    user = User.create!(email: "mario@example.com", password: "password123", first_name: "Mario", last_name: "Rossi")
    wishlist = user.create_wishlist
    wishlist_item = wishlist.wishlist_items.create!(product_id: product.id)

    product.destroy

    assert_nil WishlistItem.find_by(id: wishlist_item.id)
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi in camelCase" do
    product = Product.create!(valid_attributes)
    json = product.as_json

    assert_equal "prod-1", json[:id]
    assert_equal "Maglietta blu", json[:title]
    assert_equal 20.0, json[:price]
    assert_equal 25.0, json[:originalPrice]
    assert_equal true, json[:sale]
    assert_equal [ "abbigliamento" ], json[:tags]
    assert json.key?(:createdAt)
  end

  test "as_json riflette inStock in base alla quantità corrente" do
    in_stock_product = Product.create!(valid_attributes)
    out_of_stock_product = Product.create!(valid_attributes.merge(id: "prod-2", quantity: 0))

    assert_equal true, in_stock_product.as_json[:inStock]
    assert_equal false, out_of_stock_product.as_json[:inStock]
  end
end
