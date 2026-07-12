class CreateOrderItems < ActiveRecord::Migration[8.1]
  def change
    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.string :product_id, null: false
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_foreign_key :order_items, :products, column: :product_id, primary_key: :id
    add_index :order_items, [:order_id, :product_id], unique: true
  end
end
