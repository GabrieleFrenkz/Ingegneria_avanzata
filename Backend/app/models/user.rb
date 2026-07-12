class User < ApplicationRecord
  has_secure_password

  has_many :orders, dependent: :nullify
  has_one :cart, dependent: :destroy
  has_one :wishlist, dependent: :destroy

  # Validazioni
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :password, length: { minimum: 6 }, if: :password_digest_changed?
  validates :role, presence: true, inclusion: { in: %w[user admin] }

  # Metodi helper
  def admin?
    role == 'admin'
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  # Serializzazione JSON
  def as_json(options = {})
    {
      id: id,
      email: email,
      firstName: first_name,
      lastName: last_name,
      address: address,
      role: role,
      createdAt: created_at.iso8601
    }
  end
end
