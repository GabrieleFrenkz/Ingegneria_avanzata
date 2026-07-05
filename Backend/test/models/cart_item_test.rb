require "test_helper"

class CartItemTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(
      email: "mario@example.com",
      password: "password123",
      first_name: "Mario",
      last_name: "Rossi"
    )
    @cart = @user.create_cart

    @product = Product.create!(
      id: "prod-item-1",
      title: "Prodotto Test",
      price: 20.0,
      original_price: 25.0,
      quantity: 5
    )
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valido con carrello, prodotto, quantità e unit_price validi" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: 2, unit_price: 20.0)
    assert cart_item.valid?
  end

  test "non valido senza quantity" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: nil, unit_price: 20.0)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:quantity], "can't be blank"
  end

  test "non valido con quantity zero o negativa" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: 0, unit_price: 20.0)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:quantity], "must be greater than 0"
  end

  test "non valido senza unit_price" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: 1, unit_price: nil)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:unit_price], "can't be blank"
  end

  test "non valido con unit_price zero o negativo" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: 1, unit_price: 0)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:unit_price], "must be greater than 0"
  end

  test "non valido se lo stesso prodotto è già presente nel carrello" do
    CartItem.create!(cart: @cart, product_id: @product.id, quantity: 1, unit_price: 20.0)
    duplicate = CartItem.new(cart: @cart, product_id: @product.id, quantity: 1, unit_price: 20.0)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:product_id], "has already been taken"
  end

  test "non valido se il prodotto non è in stock alla creazione" do
    out_of_stock_product = Product.create!(id: "prod-item-2", title: "Esaurito", price: 10.0, original_price: 10.0, quantity: 0)
    cart_item = CartItem.new(cart: @cart, product_id: out_of_stock_product.id, quantity: 1, unit_price: 10.0)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:product], "is out of stock"
  end

  test "non valido se la quantità richiesta supera lo stock disponibile" do
    cart_item = CartItem.new(cart: @cart, product_id: @product.id, quantity: 10, unit_price: 20.0)

    assert_not cart_item.valid?
    assert_includes cart_item.errors[:quantity], "exceeds available stock (5 available)"
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi con subtotale e prodotto annidato" do
    cart_item = CartItem.create!(cart: @cart, product_id: @product.id, quantity: 2, unit_price: 20.0)
    json = cart_item.as_json

    assert_equal @cart.id, json[:cartId]
    assert_equal @product.id, json[:productId]
    assert_equal 2, json[:quantity]
    assert_equal 20.0, json[:unitPrice]
    assert_equal 40.0, json[:subtotal]
    assert_equal @product.id, json[:product][:id]
  end
end
