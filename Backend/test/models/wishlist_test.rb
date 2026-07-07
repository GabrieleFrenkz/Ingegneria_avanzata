require "test_helper"

class WishlistTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(
      email: "mario@example.com",
      password: "password123",
      first_name: "Mario",
      last_name: "Rossi"
    )

    @product = Product.create!(
      id: "prod-wish-1",
      title: "Prodotto Test",
      price: 20.0,
      original_price: 25.0,
      quantity: 10
    )
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valida con uno user associato" do
    wishlist = Wishlist.new(user: @user)
    assert wishlist.valid?
  end

  test "non valida senza user" do
    wishlist = Wishlist.new(user: nil)

    assert_not wishlist.valid?
    assert_includes wishlist.errors[:user], "must exist"
  end

  test "non valida se lo user ha già una wishlist" do
    Wishlist.create!(user: @user)
    duplicate = Wishlist.new(user: @user)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "has already been taken"
  end

  # ─── Metodi helper ───────────────────────────────────────────────────────────

  test "item_count conta il numero di item nella wishlist" do
    wishlist = Wishlist.create!(user: @user)
    wishlist.wishlist_items.create!(product_id: @product.id)

    assert_equal 1, wishlist.item_count
  end

  test "empty? restituisce true se la wishlist non ha item" do
    wishlist = Wishlist.create!(user: @user)
    assert wishlist.empty?
  end

  test "empty? restituisce false se la wishlist ha almeno un item" do
    wishlist = Wishlist.create!(user: @user)
    wishlist.wishlist_items.create!(product_id: @product.id)

    assert_not wishlist.empty?
  end

  test "includes_product? restituisce true se il prodotto è nella wishlist" do
    wishlist = Wishlist.create!(user: @user)
    wishlist.wishlist_items.create!(product_id: @product.id)

    assert wishlist.includes_product?(@product.id)
  end

  test "includes_product? restituisce false se il prodotto non è nella wishlist" do
    wishlist = Wishlist.create!(user: @user)
    assert_not wishlist.includes_product?(@product.id)
  end

  test "clear_items rimuove tutti gli item dalla wishlist" do
    wishlist = Wishlist.create!(user: @user)
    wishlist.wishlist_items.create!(product_id: @product.id)

    wishlist.clear_items

    assert_equal 0, wishlist.wishlist_items.count
  end

  # ─── Associazioni ────────────────────────────────────────────────────────────

  test "distruggere la wishlist distrugge i wishlist_items associati" do
    wishlist = Wishlist.create!(user: @user)
    wishlist_item = wishlist.wishlist_items.create!(product_id: @product.id)

    wishlist.destroy

    assert_nil WishlistItem.find_by(id: wishlist_item.id)
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi in camelCase" do
    wishlist = Wishlist.create!(user: @user)
    wishlist.wishlist_items.create!(product_id: @product.id)

    json = wishlist.as_json

    assert_equal wishlist.id, json[:id]
    assert_equal @user.id, json[:userId]
    assert_equal 1, json[:items].length
    assert_equal 1, json[:itemCount]
    assert json.key?(:createdAt)
  end
end
