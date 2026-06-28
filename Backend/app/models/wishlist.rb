class Wishlist < ApplicationRecord
  belongs_to :user
  has_many :wishlist_items, dependent: :destroy
  has_many :products, through: :wishlist_items

  validates :user_id, presence: true, uniqueness: true

  # Count total number of items
  def item_count
    wishlist_items.count
  end

  # Check if wishlist is empty
  def empty?
    wishlist_items.empty?
  end

  # Check if product is in wishlist
  def includes_product?(product_id)
    wishlist_items.exists?(product_id: product_id)
  end

  # Clear all items from wishlist
  def clear_items
    wishlist_items.destroy_all
  end

  # JSON serialization
  def as_json(options = {})
    {
      id: id,
      userId: user_id,
      items: wishlist_items.includes(:product).map(&:as_json),
      itemCount: item_count,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601
    }
  end
end
