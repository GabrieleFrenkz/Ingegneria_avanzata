require "test_helper"

class CartTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(
      email: "mario@example.com",
      password: "password123",
      first_name: "Mario",
      last_name: "Rossi"
    )

    @product = Product.create!(
      id: "prod-cart-1",
      title: "Prodotto Test",
      description: "Descrizione",
      price: 20.0,
      original_price: 25.0,
      quantity: 10,
      sale: false,
      thumbnail: "test.jpg",
      tags: [ "test" ]
    )
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valido con uno user associato" do
    cart = Cart.new(user: @user)
    assert cart.valid?
  end

  test "non valido senza user" do
    cart = Cart.new(user: nil)

    assert_not cart.valid?
    assert_includes cart.errors[:user], "must exist"
  end

  test "non valido se lo user ha già un carrello" do
    Cart.create!(user: @user)
    duplicate_cart = Cart.new(user: @user)

    assert_not duplicate_cart.valid?
    assert_includes duplicate_cart.errors[:user_id], "has already been taken"
  end

  # ─── Metodi helper ───────────────────────────────────────────────────────────

  test "total somma quantità per prezzo unitario di tutti gli item" do
    cart = Cart.create!(user: @user)
    cart.cart_items.create!(product_id: @product.id, quantity: 2, unit_price: 20.0)

    product2 = Product.create!(
      id: "prod-cart-2", title: "Secondo", price: 10.0, original_price: 10.0, quantity: 5
    )
    cart.cart_items.create!(product_id: product2.id, quantity: 3, unit_price: 10.0)

    assert_equal 70.0, cart.total
  end

  test "total è zero per un carrello vuoto" do
    cart = Cart.create!(user: @user)
    assert_equal 0, cart.total
  end

  test "item_count somma le quantità di tutti gli item" do
    cart = Cart.create!(user: @user)
    cart.cart_items.create!(product_id: @product.id, quantity: 3, unit_price: 20.0)

    assert_equal 3, cart.item_count
  end

  test "empty? restituisce true se il carrello non ha item" do
    cart = Cart.create!(user: @user)
    assert cart.empty?
  end

  test "empty? restituisce false se il carrello ha almeno un item" do
    cart = Cart.create!(user: @user)
    cart.cart_items.create!(product_id: @product.id, quantity: 1, unit_price: 20.0)

    assert_not cart.empty?
  end

  test "clear_items rimuove tutti gli item dal carrello" do
    cart = Cart.create!(user: @user)
    cart.cart_items.create!(product_id: @product.id, quantity: 1, unit_price: 20.0)

    cart.clear_items

    assert_equal 0, cart.cart_items.count
  end

  # ─── Associazioni ────────────────────────────────────────────────────────────

  test "distruggere il carrello distrugge i cart_items associati" do
    cart = Cart.create!(user: @user)
    cart_item = cart.cart_items.create!(product_id: @product.id, quantity: 1, unit_price: 20.0)

    cart.destroy

    assert_nil CartItem.find_by(id: cart_item.id)
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi in camelCase" do
    cart = Cart.create!(user: @user)
    cart.cart_items.create!(product_id: @product.id, quantity: 2, unit_price: 20.0)

    json = cart.as_json

    assert_equal cart.id, json[:id]
    assert_equal @user.id, json[:userId]
    assert_equal 1, json[:items].length
    assert_equal 40.0, json[:total]
    assert_equal 2, json[:itemCount]
    assert json.key?(:createdAt)
  end
end
