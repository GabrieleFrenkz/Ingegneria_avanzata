class CreateCartItems < ActiveRecord::Migration[8.1]
  def change
    create_table :cart_items do |t|
      t.references :cart, null: false, foreign_key: true
      t.string :product_id, null: false
      t.integer :quantity, null: false, default: 1
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.timestamps
    end
    add_foreign_key :cart_items, :products, column: :product_id, primary_key: :id
    add_index :cart_items, [:cart_id, :product_id], unique: true
  end
end
