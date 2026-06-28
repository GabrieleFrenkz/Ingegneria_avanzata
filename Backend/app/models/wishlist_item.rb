class WishlistItem < ApplicationRecord
  belongs_to :wishlist
  belongs_to :product, foreign_key: 'product_id', primary_key: 'id'

  validates :product_id, uniqueness: { scope: :wishlist_id }

  # JSON serialization with product details
  def as_json(options = {})
    {
      id: id,
      wishlistId: wishlist_id,
      productId: product_id,
      product: product.as_json,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601
    }
  end
end
