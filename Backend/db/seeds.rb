# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'json'

puts "Seeding database..."

# Pulisci dati esistenti
puts "Cleaning existing data..."
Product.destroy_all
User.destroy_all

# Crea utente admin
puts "Creating admin user..."
admin = User.create!(
  email: 'admin@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Admin',
  last_name: 'User',
  address: 'Admin Address',
  role: 'admin'
)
puts "Admin user created: #{admin.email}"

# Crea un utente normale per test
puts "Creating test user..."
test_user1 = User.create!(
  email: 'user@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Test',
  last_name: 'User',
  address: '123 Test Street, Test City, 12345',
  role: 'user'
)

test_user2 = User.create!(
  email: 'user2@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Test2',
  last_name: 'User2',
  address: '456 Test Avenue, Test City, 67890',
  role: 'user'
)

puts "Test user created: #{test_user1.email}"
puts "Test user created: #{test_user2.email}"

# Leggi i dati dal mock API
mock_data_path = '../Frontend/shop-mock-api/db.json'

unless File.exist?(mock_data_path)
  puts "Warning: Mock data file not found at #{mock_data_path}"
  puts "Skipping product import..."
else
  mock_data = JSON.parse(File.read(mock_data_path))

  # Importa i prodotti
  puts "Importing products from mock API..."
  mock_data['products'].each do |product|
    Product.create!(
      id: product['id'],
      title: product['title'],
      description: product['description'],
      price: product['price'],
      original_price: product['originalPrice'],
      sale: product['sale'],
      thumbnail: product['thumbnail'],
      tags: product['tags'],
      quantity: rand(10..100), # Quantità random tra 10 e 100
      created_at: product['createdAt'],
      updated_at: product['createdAt']
    )
  end

  puts "Successfully imported #{Product.count} products"
end

puts "Seeding completed!"
puts ""
puts "=== Admin Credentials ==="
puts "Email: admin@example.com"
puts "Password: password123"
puts ""
puts "=== Test User Credentials ==="
puts "Email: user@example.com"
puts "Password: password123"
