class Product < ApplicationRecord
  self.primary_key = 'id'

  validates :title, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :original_price, presence: true, numericality: { greater_than: 0 }
  validates :quantity, presence: true, numericality: { greater_than_or_equal_to: 0, only_integer: true }

  has_many :order_items, dependent: :destroy, foreign_key: 'product_id'
  has_many :orders, through: :order_items
  has_many :cart_items, dependent: :destroy, foreign_key: 'product_id'
  has_many :carts, through: :cart_items
  has_many :wishlist_items, dependent: :destroy, foreign_key: 'product_id'
  has_many :wishlists, through: :wishlist_items

  # Metodi helper per inventario
  def in_stock?
    quantity > 0
  end

  def out_of_stock?
    quantity == 0
  end

  # Override per serializzazione JSON in camelCase
  def as_json(options = {})
    {
      id: id,
      title: title,
      description: description,
      price: price.to_f,
      originalPrice: original_price.to_f,
      sale: sale,
      thumbnail: thumbnail,
      tags: tags,
      quantity: quantity,
      inStock: in_stock?,
      createdAt: created_at.iso8601
    }
  end
end

