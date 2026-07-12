Rails.application.routes.draw do
  # E-commerce API endpoints
  namespace :api do
    # Public routes
    resources :products, only: [ :index, :show ]
    resources :orders, only: [ :index, :create ]

    # Authentication routes
    post "register", to: "authentication#register"
    post "login", to: "authentication#login"
    get "me", to: "authentication#me"

    # Shopping cart routes
    get "cart", to: "carts#show"
    post "cart/items", to: "carts#add_item"
    patch "cart/items/:id", to: "carts#update_item"
    delete "cart/items/:id", to: "carts#remove_item"
    delete "cart", to: "carts#clear"

    # Wishlist routes
    get "wishlist", to: "wishlists#show"
    post "wishlist/items", to: "wishlists#add_item"
    delete "wishlist/items/:id", to: "wishlists#remove_item"
    delete "wishlist/items/product/:product_id", to: "wishlists#remove_item_by_product"
    delete "wishlist", to: "wishlists#clear"

    # Admin routes
    namespace :admin do
      # Product management
      resources :products, only: [ :create, :update, :destroy ] do
        member do
          patch :adjust_quantity
        end
      end

      # Order management and dashboard
      resources :orders, only: [ :index, :show, :destroy ]
      get "stats", to: "orders#stats"
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
