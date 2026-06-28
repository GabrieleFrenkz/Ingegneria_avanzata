class CartItem < ApplicationRecord
  belongs_to :cart
  belongs_to :product, foreign_key: 'product_id', primary_key: 'id'

  validates :quantity, presence: true, numericality: {
    greater_than: 0,
    only_integer: true
  }
  validates :unit_price, presence: true, numericality: { greater_than: 0 }
  validates :product_id, uniqueness: { scope: :cart_id }

  # Validate stock availability before save
  validate :product_in_stock, on: :create
  validate :quantity_available

  # JSON serialization with product details
  def as_json(options = {})
    {
      id: id,
      cartId: cart_id,
      productId: product_id,
      quantity: quantity,
      unitPrice: unit_price.to_f,
      subtotal: (quantity * unit_price).to_f,
      product: product.as_json,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601
    }
  end

  private

  def product_in_stock
    unless product&.in_stock?
      errors.add(:product, 'is out of stock')
    end
  end

  def quantity_available
    if product && quantity > product.quantity
      errors.add(:quantity, "exceeds available stock (#{product.quantity} available)")
    end
  end
end
