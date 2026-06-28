class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product, foreign_key: 'product_id', primary_key: 'id'

  validates :quantity, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :unit_price, presence: true, numericality: { greater_than: 0 }

  def as_json(options = {})
    {
      id: id,
      orderId: order_id,
      productId: product_id,
      quantity: quantity,
      unitPrice: unit_price.to_f,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601,
      product: product&.as_json
    }
  end
end
