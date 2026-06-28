class CreateWishlistItems < ActiveRecord::Migration[8.1]
  def change
    create_table :wishlist_items do |t|
      t.references :wishlist, null: false, foreign_key: true
      t.string :product_id, null: false

      t.timestamps
    end

    add_index :wishlist_items, [:wishlist_id, :product_id], unique: true
    add_foreign_key :wishlist_items, :products, column: :product_id, primary_key: :id
  end
end
