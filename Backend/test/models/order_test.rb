require "test_helper"

class OrderTest < ActiveSupport::TestCase
  # Test 1: Order valido con tutti i campi obbligatori
  test "valido con total, customer e address" do
    order = Order.new(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert order.valid?, "Order dovrebbe essere valido con tutti i campi obbligatori"
  end

  # Test 2: Order non valido senza total
  test "non valido senza total" do
    order = Order.new(
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert_not order.valid?, "Order non dovrebbe essere valido senza total"
    assert_includes order.errors[:total], "can't be blank"
  end

  # Test 3: Order non valido con total negativo o zero
  test "non valido con total zero" do
    order = Order.new(
      total: 0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert_not order.valid?, "Order non dovrebbe essere valido con total = 0"
    assert_includes order.errors[:total], "must be greater than 0"
  end

  test "non valido con total negativo" do
    order = Order.new(
      total: -50,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert_not order.valid?, "Order non dovrebbe essere valido con total negativo"
    assert_includes order.errors[:total], "must be greater than 0"
  end

  # Property-Based Testing
  test "PBT: qualunque total minore o uguale a zero rende l'ordine non valido" do
    property_of {
      range(-1_000, 0)
    }.check(50) do |bad_total|
      order = Order.new(
        total: bad_total,
        customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
        address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
      )

      assert_not order.valid?
      assert_includes order.errors[:total], "must be greater than 0"
    end
  end

  # Test 4: Order non valido senza customer
  test "non valido senza customer" do
    order = Order.new(
      total: 100.0,
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert_not order.valid?, "Order non dovrebbe essere valido senza customer"
    assert_includes order.errors[:customer], "can't be blank"
  end

  # Test 5: Order non valido senza address
  test "non valido senza address" do
    order = Order.new(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" }
    )
    assert_not order.valid?, "Order non dovrebbe essere valido senza address"
    assert_includes order.errors[:address], "can't be blank"
  end

  # Test 6: Associazione con User (opzionale)
  test "può essere associato a un utente" do
    user = User.create!(
      email: "test@example.com",
      password: "password123",
      first_name: "Test",
      last_name: "User",
      role: "user"
    )

    order = Order.new(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
      user: user
    )

    assert order.valid?, "Order dovrebbe essere valido con un utente associato"
    assert_equal user, order.user, "L'utente associato dovrebbe corrispondere"
  end

  # Test 7: Order può esistere senza user (guest checkout)
  test "può esistere senza user (guest)" do
    order = Order.new(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )
    assert order.valid?, "Order dovrebbe essere valido anche senza utente (guest checkout)"
    assert_nil order.user, "User dovrebbe essere nil per ordini guest"
  end

  # Test 8: Associazione has_many con order_items
  test "ha molti order_items" do
    order = Order.create!(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )

    product = Product.create!(
      id: "test-product-order-1",
      title: "Test Product",
      description: "Test description",
      price: 50.0,
      original_price: 50.0,
      quantity: 10,
      sale: false,
      thumbnail: "test.jpg",
      tags: ["test"]
    )

    order_item = order.order_items.create!(
      product: product,
      quantity: 2,
      unit_price: 50.0
    )

    assert_includes order.order_items, order_item
    assert_equal 1, order.order_items.count
  end

  # Test 9: Cancellare order cancella anche order_items (dependent: :destroy)
  test "cancellare order cancella anche order_items" do
    order = Order.create!(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )

    product = Product.create!(
      id: "test-product-order-2",
      title: "Test Product",
      description: "Test description",
      price: 50.0,
      original_price: 50.0,
      quantity: 10,
      sale: false,
      thumbnail: "test.jpg",
      tags: ["test"]
    )

    order.order_items.create!(
      product: product,
      quantity: 2,
      unit_price: 50.0
    )

    assert_difference "OrderItem.count", -1 do
      order.destroy
    end
  end

  # Test 10: Metodo restore_product_quantities ripristina quantità prodotti
  test "cancellare order ripristina quantità prodotti" do
    product = Product.create!(
      id: "test-product-order-3",
      title: "Test Product",
      description: "Test description",
      price: 50.0,
      original_price: 50.0,
      quantity: 10,
      sale: false,
      thumbnail: "test.jpg",
      tags: ["test"]
    )

    order = Order.create!(
      total: 100.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" }
    )

    order.order_items.create!(
      product: product,
      quantity: 3,
      unit_price: 50.0
    )

    # Simula la riduzione della quantità del prodotto (come fa il controller)
    product.update!(quantity: 7)

    # Distruggi l'ordine e verifica che la quantità del prodotto venga ripristinata
    order.destroy

    product.reload
    assert_equal 10, product.quantity, "La quantità del prodotto dovrebbe essere ripristinata dopo la cancellazione dell'ordine"
  end
end
