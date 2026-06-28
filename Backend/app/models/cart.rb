class Cart < ApplicationRecord
  belongs_to :user
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items

  validates :user_id, presence: true, uniqueness: true

  # Calculate total price of all items in cart
  def total
    cart_items.sum { |item| item.quantity * item.unit_price }
  end

  # Count total number of items (sum of all quantities)
  def item_count
    cart_items.sum(:quantity)
  end

  # Check if cart is empty
  def empty?
    cart_items.empty?
  end

  # Clear all items from cart
  def clear_items
    cart_items.destroy_all
  end

  # JSON serialization
  def as_json(options = {})
    {
      id: id,
      userId: user_id,
      items: cart_items.map(&:as_json),
      total: total.to_f,
      itemCount: item_count,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601
    }
  end
end
