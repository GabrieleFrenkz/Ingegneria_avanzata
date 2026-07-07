require "test_helper"

class UserTest < ActiveSupport::TestCase
  def valid_attributes
    {
      email: "mario@example.com",
      password: "password123",
      first_name: "Mario",
      last_name: "Rossi"
    }
  end

  # ─── Validazioni ─────────────────────────────────────────────────────────────

  test "valido con tutti i campi obbligatori" do
    user = User.new(valid_attributes)
    assert user.valid?, "User dovrebbe essere valido con tutti i campi obbligatori"
  end

  test "non valido senza email" do
    user = User.new(valid_attributes.merge(email: nil))
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "non valido con email duplicata" do
    User.create!(valid_attributes)
    user = User.new(valid_attributes.merge(first_name: "Luigi"))

    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "non valido con formato email non valido" do
    user = User.new(valid_attributes.merge(email: "non-una-email"))

    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "non valido senza first_name" do
    user = User.new(valid_attributes.merge(first_name: nil))

    assert_not user.valid?
    assert_includes user.errors[:first_name], "can't be blank"
  end

  test "non valido senza last_name" do
    user = User.new(valid_attributes.merge(last_name: nil))

    assert_not user.valid?
    assert_includes user.errors[:last_name], "can't be blank"
  end

  test "non valido senza password in creazione" do
    user = User.new(valid_attributes.merge(password: nil))

    assert_not user.valid?
  end

  test "non valido con password più corta di 6 caratteri" do
    user = User.new(valid_attributes.merge(password: "abc12"))

    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 6 characters)"
  end

  test "valido con password di esattamente 6 caratteri" do
    user = User.new(valid_attributes.merge(password: "abc123"))
    assert user.valid?
  end

  test "il ruolo di default è user" do
    user = User.new(valid_attributes)
    assert_equal "user", user.role
  end

  test "valido con ruolo admin" do
    user = User.new(valid_attributes.merge(role: "admin"))
    assert user.valid?
  end

  test "non valido con ruolo non ammesso" do
    user = User.new(valid_attributes.merge(role: "superadmin"))

    assert_not user.valid?
    assert_includes user.errors[:role], "is not included in the list"
  end

  test "non valido con ruolo nil" do
    user = User.new(valid_attributes.merge(role: nil))

    assert_not user.valid?
    assert_includes user.errors[:role], "can't be blank"
  end

  # ─── Metodi helper ───────────────────────────────────────────────────────────

  test "admin? restituisce true se il ruolo è admin" do
    user = User.new(valid_attributes.merge(role: "admin"))
    assert user.admin?
  end

  test "admin? restituisce false se il ruolo è user" do
    user = User.new(valid_attributes)
    assert_not user.admin?
  end

  test "full_name concatena first_name e last_name" do
    user = User.new(valid_attributes)
    assert_equal "Mario Rossi", user.full_name
  end

  # ─── Autenticazione (has_secure_password) ──────────────────────────────────────

  test "authenticate restituisce l'utente con la password corretta" do
    user = User.create!(valid_attributes)
    assert user.authenticate("password123")
  end

  test "authenticate restituisce false con la password sbagliata" do
    user = User.create!(valid_attributes)
    assert_not user.authenticate("password_sbagliata")
  end

  # ─── Property-Based Testing ─────────────────────────────────────────────────

  test "PBT: qualunque password generata autentica se stessa ma fallisce se modificata" do
    property_of {
      sized(10) { string(:alnum) }
    }.check(20) do |raw_password|
      user = User.create!(valid_attributes.merge(email: "user-#{SecureRandom.hex(6)}@example.com", password: raw_password))

      assert user.authenticate(raw_password)
      assert_not user.authenticate(raw_password.reverse + "x")
    end
  end

  # ─── Associazioni ────────────────────────────────────────────────────────────

  test "distruggere l'utente imposta a nil lo user_id degli ordini (dependent nullify)" do
    user = User.create!(valid_attributes)
    order = Order.create!(
      total: 50.0,
      customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
      address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
      user: user
    )

    user.destroy

    assert_nil order.reload.user_id
  end

  test "distruggere l'utente distrugge il carrello associato (dependent destroy)" do
    user = User.create!(valid_attributes)
    cart = user.create_cart

    user.destroy

    assert_nil Cart.find_by(id: cart.id)
  end

  test "distruggere l'utente distrugge la wishlist associata (dependent destroy)" do
    user = User.create!(valid_attributes)
    wishlist = user.create_wishlist

    user.destroy

    assert_nil Wishlist.find_by(id: wishlist.id)
  end

  # ─── Serializzazione JSON ────────────────────────────────────────────────────

  test "as_json restituisce i campi attesi in camelCase" do
    user = User.create!(valid_attributes.merge(address: "Via Roma 1"))
    json = user.as_json

    assert_equal user.id, json[:id]
    assert_equal "mario@example.com", json[:email]
    assert_equal "Mario", json[:firstName]
    assert_equal "Rossi", json[:lastName]
    assert_equal "Via Roma 1", json[:address]
    assert_equal "user", json[:role]
    assert json.key?(:createdAt)
  end

  test "as_json non espone il password_digest" do
    user = User.create!(valid_attributes)
    json = user.as_json

    assert_not json.key?(:password_digest)
    assert_not json.key?(:password)
  end
end
