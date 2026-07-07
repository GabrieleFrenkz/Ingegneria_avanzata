ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "rantly/minitest_extensions"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    def auth_headers_for(user)
      token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256")
      { "Authorization" => "Bearer #{token}" }
    end
  end
end
