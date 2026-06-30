require "test_helper"

module Api
  class AuthenticationControllerTest < ActionDispatch::IntegrationTest
    def setup
      @valid_user_params = {
        user: {
          email: "mario@example.com",
          password: "password123",
          password_confirmation: "password123",
          first_name: "Mario",
          last_name: "Rossi",
          address: "Via Roma 1, Milano"
        }
      }
    end

    # ─── POST /api/register ───────────────────────────────────────────────────

    test "register con dati validi restituisce 201 con token e dati utente" do
      assert_difference "User.count", 1 do
        post "/api/register", params: @valid_user_params, as: :json
      end

      assert_response :created
      json = JSON.parse(response.body)

      assert_equal "Registration successful", json["message"]
      assert json["token"].present?, "La risposta deve includere un token JWT"
      assert_equal "mario@example.com", json["user"]["email"]
      assert_equal "Mario", json["user"]["firstName"]
      assert_equal "Rossi", json["user"]["lastName"]
    end

    test "register imposta sempre il ruolo a user indipendentemente dall'input" do
      post "/api/register", params: @valid_user_params, as: :json

      assert_response :created
      assert_equal "user", User.last.role
    end

    test "register con email duplicata restituisce 422" do
      User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      assert_no_difference "User.count" do
        post "/api/register", params: @valid_user_params, as: :json
      end

      assert_response :unprocessable_entity
    end

    test "register senza email restituisce 422" do
      params = @valid_user_params.deep_dup
      params[:user].delete(:email)

      assert_no_difference "User.count" do
        post "/api/register", params: params, as: :json
      end

      assert_response :unprocessable_entity
    end

    test "register senza first_name restituisce 422" do
      params = @valid_user_params.deep_dup
      params[:user].delete(:first_name)

      assert_no_difference "User.count" do
        post "/api/register", params: params, as: :json
      end

      assert_response :unprocessable_entity
    end

    test "register con password troppo corta restituisce 422" do
      params = @valid_user_params.deep_dup
      params[:user][:password] = "abc"
      params[:user][:password_confirmation] = "abc"

      assert_no_difference "User.count" do
        post "/api/register", params: params, as: :json
      end

      assert_response :unprocessable_entity
    end

    # ─── POST /api/login ──────────────────────────────────────────────────────

    test "login con credenziali valide restituisce 200 con token e dati utente" do
      user = User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      post "/api/login", params: { user: { email: "mario@example.com", password: "password123" } }, as: :json

      assert_response :ok
      json = JSON.parse(response.body)

      assert_equal "Login successful", json["message"]
      assert json["token"].present?, "La risposta deve includere un token JWT"
      assert_equal user.id, json["user"]["id"]
      assert_equal "mario@example.com", json["user"]["email"]
    end

    test "login con password errata restituisce 401" do
      User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      post "/api/login", params: { user: { email: "mario@example.com", password: "sbagliata" } }, as: :json

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Invalid email or password", json["error"]
    end

    test "login con email inesistente restituisce 401" do
      post "/api/login", params: { user: { email: "nonexiste@example.com", password: "password123" } }, as: :json

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Invalid email or password", json["error"]
    end

    test "login restituisce un token JWT valido con user_id corretto" do
      user = User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      post "/api/login", params: { user: { email: "mario@example.com", password: "password123" } }, as: :json

      assert_response :ok
      token = JSON.parse(response.body)["token"]
      decoded = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: "HS256" })
      assert_equal user.id, decoded[0]["user_id"]
    end

    # ─── GET /api/me ──────────────────────────────────────────────────────────

    test "me con token valido restituisce i dati dell'utente corrente" do
      user = User.create!(
        email: "mario@example.com",
        password: "password123",
        first_name: "Mario",
        last_name: "Rossi",
        role: "user"
      )

      token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256")
      get "/api/me", headers: { "Authorization" => "Bearer #{token}" }

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal user.id, json["id"]
      assert_equal "mario@example.com", json["email"]
    end

    test "me senza token restituisce 401" do
      get "/api/me"

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Not authenticated", json["error"]
    end

    test "me con token non valido restituisce 401" do
      get "/api/me", headers: { "Authorization" => "Bearer token_invalido" }

      assert_response :unauthorized
      json = JSON.parse(response.body)
      assert_equal "Not authenticated", json["error"]
    end
  end
end
