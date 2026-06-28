class Order < ApplicationRecord
  belongs_to :user, optional: true
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :total, presence: true, numericality: { greater_than: 0 }
  validates :customer, presence: true
  validates :address, presence: true

  accepts_nested_attributes_for :order_items

  # Ripristina le quantità dei prodotti quando l'ordine viene eliminato
  before_destroy :restore_product_quantities, prepend: true

  private

  def restore_product_quantities
    # Reload per assicurarsi di avere i dati aggiornati
    order_items.reload.each do |order_item|
      product = order_item.product
      if product
        Rails.logger.info "Restoring product #{product.id} (#{product.title}): #{product.quantity} + #{order_item.quantity}"
        new_quantity = product.quantity + order_item.quantity
        product.update!(quantity: new_quantity)
        Rails.logger.info "New quantity: #{product.reload.quantity}"
      end
    end
  end

  public

  def as_json(options = {})
    base = {
      id: id,
      customer: customer,
      address: address,
      total: total.to_f,
      createdAt: created_at.iso8601,
      orderItems: order_items.map(&:as_json)
    }

    # Aggiungi info utente se presente
    base[:user] = user.as_json if user.present?

    base
  end
end
