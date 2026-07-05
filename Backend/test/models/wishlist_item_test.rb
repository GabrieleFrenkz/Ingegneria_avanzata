require "test_helper"

class WishlistItemTest < ActiveSupport::TestCase
  def setup
    @user = User.create!(
      email: "mario@example.com",
      password: "password123",
      first_name: "Mario",
      last_name: "Rossi"
    )
    @wishlist = @user.create_wishlist

    @product = Product.create!(
      id: "prod-wishitem-1",
      title: "Prodotto Test",
      price: 20.0,
      original_price: 25.0,
      quantity: 10
    )
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valido con wishlist e prodotto validi" do
    wishlist_item = WishlistItem.new(wishlist: @wishlist, product_id: @product.id)
    assert wishlist_item.valid?
  end

  test "non valido se lo stesso prodotto è già nella wishlist" do
    WishlistItem.create!(wishlist: @wishlist, product_id: @product.id)
    duplicate = WishlistItem.new(wishlist: @wishlist, product_id: @product.id)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:product_id], "has already been taken"
  end

  test "lo stesso prodotto può stare in wishlist diverse" do
    other_user = User.create!(email: "luigi@example.com", password: "password123", first_name: "Luigi", last_name: "Verdi")
    other_wishlist = other_user.create_wishlist

    WishlistItem.create!(wishlist: @wishlist, product_id: @product.id)
    item_in_other_wishlist = WishlistItem.new(wishlist: other_wishlist, product_id: @product.id)

    assert item_in_other_wishlist.valid?
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi con prodotto annidato" do
    wishlist_item = WishlistItem.create!(wishlist: @wishlist, product_id: @product.id)
    json = wishlist_item.as_json

    assert_equal @wishlist.id, json[:wishlistId]
    assert_equal @product.id, json[:productId]
    assert_equal @product.id, json[:product][:id]
    assert json.key?(:createdAt)
  end
end
