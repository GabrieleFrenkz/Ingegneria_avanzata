# SimpleCov deve partire prima che venga caricato qualunque codice applicativo,
# quindi precede anche il require dell'ambiente Rails.
require "simplecov"
SimpleCov.start "rails" do
  # SimpleCov rileverebbe "RSpec" come nome di default (per via della gem
  # rspec-rails), ma qui la suite gira su Minitest.
  command_name "Minitest"
  add_filter "/test/"
  enable_coverage :branch
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "rantly/minitest_extensions"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # I worker paralleli scrivono risultati di coverage separati che vanno
    # etichettati e poi fusi, altrimenti si sovrascrivono a vicenda.
    parallelize_setup do |worker|
      SimpleCov.command_name "#{SimpleCov.command_name}-#{worker}"
    end

    parallelize_teardown do |worker|
      SimpleCov.result
    end

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    def auth_headers_for(user)
      token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256")
      { "Authorization" => "Bearer #{token}" }
    end
  end
end
