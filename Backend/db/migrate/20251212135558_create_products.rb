class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products, id: false do |t|
      t.string :id, primary_key: true, null: false
      t.string :title, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.decimal :original_price, precision: 10, scale: 2, null: false
      t.boolean :sale, default: false
      t.string :thumbnail
      t.json :tags

      t.timestamps
    end
  end
end
