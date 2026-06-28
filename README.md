# 🛒 E-Commerce Full-Stack Application

**Applicazione e-commerce completa** con backend Rails API e frontend Angular, che implementa funzionalità di catalogo prodotti, carrello della spesa, wishlist, sistema di checkout e pannello amministrativo.

[![Ruby](https://img.shields.io/badge/Ruby-3.4.7-red.svg)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-8.1.1-red.svg)](https://rubyonrails.org/)
[![Angular](https://img.shields.io/badge/Angular-21.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

---

## 📑 Indice

- [Caratteristiche Principali](#-caratteristiche-principali)
- [Stack Tecnologico](#-stack-tecnologico)
- [Architettura del Progetto](#-architettura-del-progetto)
- [Prerequisiti](#-prerequisiti)
- [Installazione e Setup](#-installazione-e-setup)
- [Avvio dell'Applicazione](#-avvio-dellapplicazione)
- [Utenti di Test](#-utenti-di-test)
- [API Endpoints](#-api-endpoints)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Funzionalità Implementate](#-funzionalità-implementate)
- [Testing](#-testing)

---

## ✨ Caratteristiche Principali

### Per gli Utenti
- 🛍️ **Catalogo Prodotti** con ricerca e filtri avanzati (prezzo, titolo, ordinamento)
- 🛒 **Carrello della Spesa** persistente per utenti autenticati e sessioni guest
- ❤️ **Wishlist** per salvare prodotti preferiti
- 💳 **Checkout** con validazione dati e gestione ordini
- 📦 **Storico Ordini** completo con dettagli prodotti e prezzi
- 🔐 **Autenticazione sicura** con JWT e password hashing (bcrypt)

### Per gli Amministratori
- 📊 **Dashboard Amministrativa** con statistiche vendite in tempo reale
- 📝 **Gestione Prodotti** completa (CRUD: create, read, update, delete)
- 📦 **Gestione Inventario** con aggiornamento quantità e alert scorte basse
- 🧾 **Visualizzazione Ordini** di tutti gli utenti
- 📈 **Analytics** con prodotti più venduti e totale revenue

### Sicurezza e Performance
- 🔒 **JWT Authentication** con token expiration (24 ore)
- 🛡️ **Password Hashing** con bcrypt (cost factor 12)
- 🚫 **CORS Protection** configurato
- ⚡ **Lazy Loading** dei moduli Angular per performance ottimizzate
- 🔄 **State Management** reattivo con Angular Signals
- 🎯 **Error Handling centralizzato** su frontend e backend
- 🔐 **Role-based Access Control** (utenti normali vs admin)

---

## 🚀 Stack Tecnologico

### Backend
| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Ruby** | 3.4.7 | Linguaggio di programmazione |
| **Rails** | 8.1.1 | Framework web API-only |
| **SQLite3** | ≥ 2.1 | Database (dev/test) |
| **Puma** | ≥ 5.0 | Web server |
| **JWT** | Latest | Autenticazione token-based |
| **bcrypt** | ~> 3.1.7 | Password encryption |
| **Rack-CORS** | Latest | Cross-Origin Resource Sharing |
| **RSpec** | Latest | Testing framework |

### Frontend
| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Angular** | 21.0 | Framework SPA |
| **TypeScript** | 5.9.2 | Linguaggio type-safe |
| **Angular Material** | 21.0 | UI Component library |
| **RxJS** | 7.8 | Reactive programming |
| **Vitest** | 4.0.8 | Unit testing |

### Architettura
- **Pattern:** REST API con separazione frontend/backend
- **Autenticazione:** JWT (JSON Web Tokens)
- **State Management:** Angular Signals + RxJS Observables
- **Routing:** Angular Router con lazy loading e guards
- **Database:** Relational (SQLite3 in dev, PostgreSQL recommended per production)

---

## 🏗️ Architettura del Progetto

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Angular SPA)                   │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │ Components │  │  Services  │  │ Guards & Interceptors│   │
│  │            │  │            │  │                      │   │
│  │ - Products │  │ - AuthAPI  │  │ - AuthGuard          │   │
│  │ - Cart     │  │ - CartAPI  │  │ - AdminGuard         │   │
│  │ - Checkout │  │ - OrderAPI │  │ - AuthInterceptor    │   │
│  │ - Admin    │  │ - AdminAPI │  │ - ErrorInterceptor   │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST + JWT
                       │ (JSON)
┌──────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Rails API)                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │Controllers │  │   Models   │  │   Authentication    │   │
│  │            │  │            │  │                     │   │
│  │ - Products │  │ - User     │  │ - JWT Generation    │   │
│  │ - Carts    │  │ - Product  │  │ - Token Validation  │   │
│  │ - Orders   │  │ - Cart     │  │ - Password Hashing  │   │
│  │ - Wishlist │  │ - Order    │  │ - Role Checking     │   │
│  │ - Admin    │  │ - Wishlist │  │                     │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   SQLite3 DB   │
              │                │
              │ - users        │
              │ - products     │
              │ - carts        │
              │ - cart_items   │
              │ - orders       │
              │ - order_items  │
              │ - wishlists    │
              │ - wishlist_items│
              └────────────────┘
```

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

### Backend Requirements
- **Ruby** 3.4.7 o superiore
- **Rails** 8.1.1 o superiore
- **SQLite3** (incluso in macOS, su Linux: `sudo apt-get install sqlite3`)
- **Bundler** (`gem install bundler`)

### Frontend Requirements
- **Node.js** 18.x o superiore
- **npm** 10.x o superiore
- **Angular CLI** (`npm install -g @angular/cli`)

### Verifica Installazione
```bash
# Verifica Ruby e Rails
ruby -v    # Ruby 3.4.7
rails -v   # Rails 8.1.1

# Verifica Node e npm
node -v    # v18.x o superiore
npm -v     # 10.x o superiore

# Verifica Angular CLI
ng version # Angular CLI 21.0
```

---

## 🔧 Installazione e Setup

### 1️⃣ Clona il Repository

```bash
git clone <repository-url>
cd Progetto_Sistemi_Web
```

### 2️⃣ Setup Backend (Rails API)

```bash
# Naviga nella cartella Backend
cd Backend

# Installa le dipendenze Ruby
bundle install

# Setup del database
rails db:setup
# Oppure, passo per passo:
# rails db:create    # Crea il database
# rails db:migrate   # Esegue le migrazioni
# rails db:seed      # Popola con dati iniziali

# Verifica il setup
rails console
> User.count        # Dovrebbe restituire 3 (admin + 2 users)
> Product.count     # Dovrebbe restituire ~50 prodotti
> exit
```

**Note:**
- `db:setup` è equivalente a `db:create + db:migrate + db:seed`
- Il database SQLite3 viene creato in `Backend/storage/development.sqlite3`
- I dati iniziali includono utenti di test e prodotti mock

### 3️⃣ Setup Frontend (Angular)

```bash
# Naviga nella cartella Frontend (dalla root del progetto)
cd Frontend

# Installa le dipendenze npm
npm install

# Verifica installazione
ng version
```

**Note:**
- `npm install` scarica tutte le dipendenze da `package.json`
- Il download può richiedere alcuni minuti (circa 200MB di node_modules)

---

## ▶️ Avvio dell'Applicazione

### Avvia Backend (Porta 3000)

```bash
cd Backend

# Avvia il server Rails
rbin/dev

### Avvia Frontend (Porta 4200)

```bash
# In un nuovo terminale
cd Frontend

# Avvia il server di sviluppo Angular
npm start
# oppure
ng serve


**Accedi all'applicazione:**
- Apri il browser: **http://localhost:4200**
- L'applicazione si ricaricherà automaticamente ad ogni modifica del codice

### 🎯 Verifica Completa

1. **Backend attivo:** http://localhost:3000/api/products → JSON prodotti
2. **Frontend attivo:** http://localhost:4200 → Homepage catalogo
3. **CORS configurato:** Nessun errore nella console browser
4. **Login funzionante:** Prova con `admin@example.com` / `password123`

---

## 👥 Utenti di Test

Dopo aver eseguito `rails db:seed`, sono disponibili i seguenti utenti:

### 🔑 Amministratore
```
Email:    admin@example.com
Password: password123
Ruolo:    admin

Accesso a:
  ✅ Tutte le funzionalità utente
  ✅ Dashboard amministrativa (/admin)
  ✅ Gestione prodotti (CRUD completo)
  ✅ Visualizzazione tutti gli ordini
  ✅ Statistiche e analytics
```

### 👤 Utente Normale #1
```
Email:    user@example.com
Password: password123
Ruolo:    user

Accesso a:
  ✅ Catalogo prodotti
  ✅ Carrello e wishlist
  ✅ Checkout e ordini
  ✅ Storico ordini personale
  ❌ Dashboard admin
```

### 👤 Utente Normale #2
```
Email:    user2@example.com
Password: password123
Ruolo:    user

(Stesse funzionalità dell'Utente #1)
```

```
### 🆕 Registrazione Nuovo Utente
- Vai su **http://localhost:4200/register**
- Compila il form di registrazione
- I nuovi utenti hanno ruolo `user` (non `admin`)

---

## 📡 API Endpoints

### Autenticazione
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| POST | `/api/register` | ❌ | Registrazione nuovo utente |
| POST | `/api/login` | ❌ | Login e generazione JWT |
| GET | `/api/me` | ✅ | Ottieni utente corrente |


### Prodotti (Pubblico)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | Lista prodotti con filtri |
| GET | `/api/products/:id` | ❌ | Dettaglio singolo prodotto |


**Query Parameters per `/api/products`:**
- `title` - Ricerca per titolo (case-insensitive)
- `min_price` - Prezzo minimo
- `max_price` - Prezzo massimo
- `sort` - Ordinamento: `price_asc`, `price_desc`, `date_asc`, `date_desc`


### Carrello (Autenticato)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✅ | Visualizza carrello corrente |
| POST | `/api/cart/items` | ✅ | Aggiungi prodotto al carrello |
| PATCH | `/api/cart/items/:id` | ✅ | Aggiorna quantità item |
| DELETE | `/api/cart/items/:id` | ✅ | Rimuovi item dal carrello |
| DELETE | `/api/cart` | ✅ | Svuota completamente il carrello |


### Wishlist (Autenticato)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | ✅ | Visualizza wishlist |
| POST | `/api/wishlist/items` | ✅ | Aggiungi prodotto alla wishlist |
| DELETE | `/api/wishlist/items/:id` | ✅ | Rimuovi item (per ID) |
| DELETE | `/api/wishlist/items/product/:product_id` | ✅ | Rimuovi item (per product_id) |
| DELETE | `/api/wishlist` | ✅ | Svuota wishlist |

### Ordini (Autenticato)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| GET | `/api/orders` | ✅ | Lista ordini utente |
| POST | `/api/orders` | ✅ | Crea nuovo ordine dal carrello |


### Admin - Prodotti (Solo Admin)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| POST | `/api/admin/products` | 🔐 Admin | Crea nuovo prodotto |
| PATCH | `/api/admin/products/:id` | 🔐 Admin | Modifica prodotto |
| DELETE | `/api/admin/products/:id` | 🔐 Admin | Elimina prodotto |
| PATCH | `/api/admin/products/:id/adjust_quantity` | 🔐 Admin | Modifica quantità inventario |


### Admin - Ordini (Solo Admin)
| Method | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| GET | `/api/admin/orders` | 🔐 Admin | Lista TUTTI gli ordini |
| GET | `/api/admin/orders/:id` | 🔐 Admin | Dettaglio ordine specifico |
| DELETE | `/api/admin/orders/:id` | 🔐 Admin | Elimina ordine (ripristina stock) |
| GET | `/api/admin/stats` | 🔐 Admin | Statistiche dashboard |


---

## 📁 Struttura del Progetto
```
Progetto_Sistemi_Web/
│
├── Backend/                    # Rails API
│   ├── app/
│   │   ├── controllers/        # API Controllers
│   │   │   ├── application_controller.rb     # Base controller (auth, error handling)
│   │   │   └── api/
│   │   │       ├── authentication_controller.rb  # Login, register
│   │   │       ├── products_controller.rb        # Prodotti (pubblico)
│   │   │       ├── carts_controller.rb           # Carrello
│   │   │       ├── wishlists_controller.rb       # Wishlist
│   │   │       ├── orders_controller.rb          # Ordini
│   │   │       └── admin/
│   │   │           ├── products_controller.rb    # Gestione prodotti (admin)
│   │   │           └── orders_controller.rb      # Gestione ordini e stats (admin)
│   │   │
│   │   ├── models/             # ActiveRecord Models
│   │   │   ├── user.rb         # Utente (has_secure_password, JWT)
│   │   │   ├── product.rb      # Prodotto
│   │   │   ├── cart.rb         # Carrello (user + guest)
│   │   │   ├── cart_item.rb    # Item nel carrello
│   │   │   ├── order.rb        # Ordine
│   │   │   ├── order_item.rb   # Item nell'ordine
│   │   │   ├── wishlist.rb     # Wishlist
│   │   │   └── wishlist_item.rb # Item nella wishlist
│   │   │
│   │   └── ...
│   │
│   ├── config/
│   │   ├── routes.rb           # Routing API
│   │   ├── database.yml        # Configurazione database
│   │   └── initializers/
│   │       └── cors.rb         # CORS configuration
│   │
│   ├── db/
│   │   ├── migrate/            # Database migrations
│   │   ├── schema.rb           # Schema database corrente
│   │   └── seeds.rb            # Dati iniziali (prodotti, utenti)
│   │
│   ├── spec/                   # RSpec tests
│   ├── Gemfile                 # Dipendenze Ruby
│   └── ...
│
├── Frontend/                   # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors, models
│   │   │   │   ├── guard/
│   │   │   │   │   ├── auth.guard.ts          # Protegge route autenticate
│   │   │   │   │   ├── admin.guard.ts         # Protegge route admin
│   │   │   │   │   └── checkout-guard.ts      # Verifica carrello non vuoto
│   │   │   │   │
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── auth.interceptor.ts    # Aggiunge JWT alle richieste
│   │   │   │   │   └── error.interceptor.ts   # Gestione errori HTTP centralizzata
│   │   │   │   │
│   │   │   │   ├── models/                    # TypeScript interfaces
│   │   │   │   │   ├── user.ts
│   │   │   │   │   ├── product.ts
│   │   │   │   │   ├── cart.ts
│   │   │   │   │   ├── order.ts
│   │   │   │   │   └── wishlist.ts
│   │   │   │   │
│   │   │   │   └── services/                  # API Services
│   │   │   │       ├── auth-service.ts        # Autenticazione
│   │   │   │       ├── product-api.ts         # Prodotti API
│   │   │   │       ├── cart.service.ts        # Carrello API + state
│   │   │   │       ├── wishlist.service.ts    # Wishlist API + state
│   │   │   │       ├── order-service.ts       # Ordini API
│   │   │   │       ├── admin.service.ts       # Admin API
│   │   │   │       └── notification.service.ts # Snackbar notifications
│   │   │   │
│   │   │   ├── features/       # Feature modules (lazy-loaded)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login-page/
│   │   │   │   │   └── register-page/
│   │   │   │   │
│   │   │   │   ├── products/
│   │   │   │   │   ├── product-page/          # Lista prodotti
│   │   │   │   │   ├── product-detail-page/   # Dettaglio prodotto
│   │   │   │   │   └── product-card/          # Card prodotto riutilizzabile
│   │   │   │   │
│   │   │   │   ├── cart/
│   │   │   │   │   └── cart-page/             # Visualizza carrello
│   │   │   │   │
│   │   │   │   ├── wishlist/
│   │   │   │   │   └── wishlist-page/         # Visualizza wishlist
│   │   │   │   │
│   │   │   │   ├── checkout/
│   │   │   │   │   └── checkout-page/         # Form checkout
│   │   │   │   │
│   │   │   │   ├── orders/
│   │   │   │   │   └── order-history/         # Storico ordini
│   │   │   │   │
│   │   │   │   └── admin/
│   │   │   │       └── admin-dashboard/       # Dashboard admin
│   │   │   │
│   │   │   ├── shared/         # Componenti condivisi
│   │   │   │   └── header/     # Navigation header
│   │   │   │
│   │   │   ├── app.routes.ts   # Configurazione routing
│   │   │   ├── app.config.ts   # Provider configuration
│   │   │   ├── app.ts          # Root component
│   │   │   └── app.scss        # Global styles
│   │   │
│   │   ├── index.html          # HTML entry point
│   │   └── main.ts             # Bootstrap Angular
│   │
│   ├── angular.json            # Angular CLI configuration
│   ├── package.json            # Dipendenze npm
│   ├── tsconfig.json           # TypeScript configuration
│   └── ...
│
├── README.md                   # Questo file
├── ARCHITETTURA.md             # Documentazione architettura dettagliata
└── GUIDA_STUDIO.md             # Guida di studio completa
```
```
### Diagramma delle Entità

┌─────────────┐
│    User     │
│─────────────│
│ id          │
│ email       │◄────────┐
│ password    │         │
│ first_name  │         │
│ last_name   │         │ 1
│ address     │         │
│ role        │         │
└─────────────┘         │
      │                 │
      │ 1               │
      │                 │
      │ *               │
┌─────▼─────┐    ┌──────┴──────┐
│   Order   │    │    Cart     │
│───────────│    │─────────────│
│ id        │    │ id          │
│ user_id   │    │ user_id     │
│ customer  │    │ expires_at  │
│ address   │    └──────┬──────┘
│ total     │           │
└─────┬─────┘           │ 1
      │                 │
      │ 1               │
      │                 │
      │ *               │ *
┌─────▼─────┐    ┌──────▼──────┐
│ OrderItem │    │  CartItem   │
│───────────│    │─────────────│
│ id        │    │ id          │
│ order_id  │    │ cart_id     │
│ product_id│◄───┤ product_id  │
│ quantity  │    │ quantity    │
│ unit_price│    │ unit_price  │
└─────┬─────┘    └──────┬──────┘
      │                 │
      │                 │
      │        ┌────────┘
      │        │
      │ *      │ *
┌─────▼────────▼──┐
│    Product      │
│─────────────────│
│ id (string)     │
│ title           │
│ description     │
│ price           │
│ original_price  │
│ quantity        │
│ sale            │
│ thumbnail       │
│ tags (JSON)     │
└─────────────────┘
      ▲
      │ *
      │
      │ 1
┌─────┴─────┐         ┌─────────────┐
│ Wishlist  │◄────────│    User     │
│   Item    │    1    │             │
│───────────│         │ (riferito)  │
│ id        │         └─────────────┘
│ wishlist  │
│ product_id│
└───────────┘
```

### Descrizione delle Entità

#### User (Utente)

Rappresenta un utente del sistema, che può essere un cliente o un amministratore.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `email`: Email univoca per l'autenticazione (String)
- `password_digest`: Hash bcrypt della password (String)
- `first_name`: Nome dell'utente (String)
- `last_name`: Cognome dell'utente (String)
- `address`: Indirizzo di spedizione predefinito (Text)
- `role`: Ruolo dell'utente ('user' o 'admin') (String)

**Relazioni:**
- `has_many :orders` - Un utente può avere molti ordini
- `has_one :cart` - Un utente ha un carrello
- `has_one :wishlist` - Un utente ha una wishlist

**Validazioni:**
- Email: formato valido e univocità
- Password: lunghezza minima di 6 caratteri
- Role: deve essere 'user' o 'admin'

#### Product (Prodotto)

Rappresenta un prodotto disponibile nel catalogo.

**Attributi:**
- `id`: Identificatore univoco (String, ereditato dal sistema di mock)
- `title`: Nome del prodotto (String)
- `description`: Descrizione dettagliata (Text)
- `price`: Prezzo corrente (Decimal 10,2)
- `original_price`: Prezzo originale prima dello sconto (Decimal 10,2)
- `quantity`: Quantità disponibile in magazzino (Integer)
- `sale`: Flag per indicare se il prodotto è in offerta (Boolean)
- `thumbnail`: URL dell'immagine (String)
- `tags`: Array di tag per categorizzazione (JSON Array)
- `created_at`: Data di creazione (DateTime)
- `updated_at`: Data di ultimo aggiornamento (DateTime)

**Relazioni:**
- `has_many :cart_items` - Presente in molti carrelli
- `has_many :order_items` - Presente in molti ordini
- `has_many :wishlist_items` - Presente in molte wishlist

**Metodi:**
- `in_stock?`: Verifica se il prodotto è disponibile
- `out_of_stock?`: Verifica se il prodotto è esaurito

#### Cart (Carrello)

Rappresenta il carrello della spesa di un utente o di un guest.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `user_id`: ID dell'utente proprietario (Integer, nullable per guest)
- `session_token`: Token per carrelli guest (String, nullable)
- `expires_at`: Data di scadenza del carrello (DateTime)
- `created_at`: Data di creazione (DateTime)
- `updated_at`: Data di ultimo aggiornamento (DateTime)

**Relazioni:**
- `belongs_to :user` (opzionale)
- `has_many :cart_items`
- `has_many :products, through: :cart_items`

**Metodi:**
- `total()`: Calcola il totale del carrello
- `item_count()`: Conta il numero di item nel carrello
- `empty?()`: Verifica se il carrello è vuoto
- `clear_items()`: Svuota il carrello

**Funzionalità:**
- Supporto per utenti autenticati e guest
- Scadenza automatica dei carrelli guest dopo un periodo

#### CartItem (Elemento del Carrello)

Rappresenta un prodotto specifico all'interno di un carrello.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `cart_id`: ID del carrello (Integer)
- `product_id`: ID del prodotto (String)
- `quantity`: Quantità del prodotto (Integer)
- `unit_price`: Prezzo unitario al momento dell'aggiunta (Decimal 10,2)

**Relazioni:**
- `belongs_to :cart`
- `belongs_to :product`

**Validazioni:**
- Quantità: deve essere positiva
- Disponibilità: verifica stock prima dell'aggiunta
- Unicità: un prodotto può apparire una sola volta per carrello (composite unique index)

#### Order (Ordine)

Rappresenta un ordine completato da un utente.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `user_id`: ID dell'utente (Integer, opzionale per ordini guest)
- `customer`: Dati del cliente in formato JSON (JSON)
  - `first_name`, `last_name`, `email`, `phone`
- `address`: Indirizzo di spedizione in formato JSON (JSON)
  - `street`, `city`, `postal_code`, `country`
- `total`: Totale dell'ordine (Decimal 10,2)
- `created_at`: Data di creazione/ordine (DateTime)
- `updated_at`: Data di ultimo aggiornamento (DateTime)

**Relazioni:**
- `belongs_to :user` (opzionale)
- `has_many :order_items`
- `has_many :products, through: :order_items`

**Callbacks:**
- `before_destroy`: Ripristina le quantità dei prodotti in magazzino

#### OrderItem (Elemento dell'Ordine)

Rappresenta un prodotto specifico all'interno di un ordine.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `order_id`: ID dell'ordine (Integer)
- `product_id`: ID del prodotto (String)
- `quantity`: Quantità ordinata (Integer)
- `unit_price`: Prezzo unitario al momento dell'ordine (Decimal 10,2)

**Relazioni:**
- `belongs_to :order`
- `belongs_to :product`

**Validazioni:**
- Unicità: un prodotto può apparire una sola volta per ordine (composite unique index)

#### Wishlist (Lista dei Desideri)

Rappresenta la lista dei prodotti desiderati da un utente.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `user_id`: ID dell'utente (Integer, unique)
- `created_at`: Data di creazione (DateTime)
- `updated_at`: Data di ultimo aggiornamento (DateTime)

**Relazioni:**
- `belongs_to :user`
- `has_many :wishlist_items`
- `has_many :products, through: :wishlist_items`

**Metodi:**
- `item_count()`: Conta il numero di prodotti nella wishlist
- `empty?()`: Verifica se la wishlist è vuota
- `includes_product?(product_id)`: Verifica se un prodotto è nella wishlist
- `clear_items()`: Svuota la wishlist

#### WishlistItem (Elemento della Wishlist)

Rappresenta un prodotto nella wishlist di un utente.

**Attributi:**
- `id`: Identificatore univoco (Integer)
- `wishlist_id`: ID della wishlist (Integer)
- `product_id`: ID del prodotto (String)
- `created_at`: Data di aggiunta (DateTime)
- `updated_at`: Data di ultimo aggiornamento (DateTime)

**Relazioni:**
- `belongs_to :wishlist`
- `belongs_to :product`

**Validazioni:**
- Unicità: un prodotto può apparire una sola volta per wishlist (composite unique index)


---
## 🎯 Funzionalità Avanzate Implementate

- ✅ Storico ordini avanzato con filtri
- ✅ Wishlist
- ✅ Admin Dashboard


## 🎯 Funzionalità Implementate

### 🛒 Gestione Carrello Avanzata

**Carrello Guest:**
- Gli utenti non autenticati possono aggiungere prodotti
- Carrello salvato in sessione tramite `X-Session-Token` UUID
- Persistenza locale con scadenza configurabile

**Carrello Autenticato:**
- Carrello persistente nel database
- Un carrello per utente (relazione one-to-one)
- **Merge automatico:** Al login, il carrello guest viene unito con quello dell'utente

**Funzionalità Carrello:**
- ➕ Aggiungi prodotto con quantità
- ➖ Rimuovi prodotto
- 🔢 Modifica quantità (con controllo disponibilità)
- 🧹 Svuota carrello
- 💰 Calcolo totale automatico
- ⚠️ Validazione stock in tempo reale

### ❤️ Wishlist

- Lista prodotti desiderati
- One-to-one per utente
- Aggiungi/rimuovi prodotto
- Badge "In Wishlist" sui prodotti
- Sposta direttamente al carrello
- Solo per utenti autenticati

### 📦 Gestione Ordini

**Creazione Ordine:**
- Form checkout con validazione (dati cliente + indirizzo)
- Verifica disponibilità prodotti prima di confermare
- **Transazione atomica:**
  - Crea Order e OrderItems
  - Decrementa quantità prodotti
  - Svuota carrello
  - Tutto o niente (rollback automatico su errore)

**Storico Ordini:**
- Visualizza ordini passati con dettagli
- Include prodotti, quantità, prezzi al momento dell'ordine
- Ordinamento per data (più recenti prima)

**Ripristino Inventario:**
- Se un admin elimina un ordine, lo stock viene ripristinato automaticamente
- Callback `before_destroy` sul model Order

### 🔐 Autenticazione e Autorizzazione

**Sistema JWT:**
- Token generato al login/registrazione
- Payload: `{ user_id, role, exp }`
- Algoritmo: HS256
- Scadenza: 24 ore
- Secret: `Rails.application.secret_key_base`

**Password Security:**
- Hashing bcrypt con cost factor 12 (2^12 = 4096 iterazioni)
- Salt automatico per ogni password
- Validazione: minimo 6 caratteri
- Mai salvata in chiaro (solo `password_digest`)

**Role-Based Access:**
- Ruoli: `user` (default) e `admin`
- Guard frontend: `authGuard`, `adminGuard`
- Backend: `require_authentication!`, `require_admin!`
- Route protette a livello di routing

### 🔍 Ricerca e Filtri Prodotti

**Filtri Implementati:**
- 📝 **Ricerca Testuale:** LIKE query su title e description
- 💵 **Range Prezzo:** min_price e max_price
- 📊 **Ordinamento:**
  - Prezzo crescente/decrescente
  - Data aggiunta crescente/decrescente

**Frontend:**
- Debouncing 300ms per ridurre chiamate API
- Reactive form con RxJS
- Paginazione lato client
- Badge per prodotti "In Offerta" e "Esaurito"

### 🛡️ Gestione Errori

**Backend (Centralizzata in ApplicationController):**
```ruby
rescue_from ActionController::ParameterMissing → 400 Bad Request
rescue_from ActiveRecord::RecordNotFound → 404 Not Found
rescue_from ActiveRecord::RecordInvalid → 422 Unprocessable Entity
rescue_from StandardError → 500 Internal Server Error
```

**Frontend (ErrorInterceptor):**
- **401 Unauthorized:** Logout automatico + redirect login
- **403 Forbidden:** Notifica "Accesso negato"
- **404 Not Found:** Notifica "Risorsa non trovata"
- **422 Validation:** Mostra errori specifici
- **500 Server Error:** Notifica "Errore server"

### 📊 Dashboard Amministrativa

**Statistiche in Tempo Reale:**
- 💰 Totale revenue (somma ordini)
- 📦 Numero totale ordini
- 👥 Numero utenti registrati
- 🏷️ Numero prodotti catalogo
- ⚠️ Prodotti con scorte basse (qty < 10)

**Gestione Prodotti:**
- ➕ Crea prodotto (form validato)
- ✏️ Modifica prodotto (prezzo, descrizione, quantità, ecc.)
- 🗑️ Elimina prodotto (con conferma)
- 📦 Adjust quantity: +N o -N unità

**Gestione Ordini:**
- Visualizza tutti gli ordini di tutti gli utenti
- Dettaglio ordine completo
- Elimina ordine (ripristina stock automaticamente)

### ⚡ Performance e UX

**Lazy Loading:**
- Moduli Angular caricati on-demand
- Riduce bundle size iniziale
- Caricamento più veloce

**State Management Reattivo:**
- Angular Signals per stato type-safe
- Computed signals per valori derivati
- RxJS per operazioni asincrone
- Auto-update della UI

**UI/UX:**
- Angular Material components
- Design responsive (mobile-first)
- Loading spinners per operazioni async
- Snackbar notifications per feedback utente
- Conferme per azioni distruttive

---

## 🧪 Testing

### Backend Testing (RSpec)

```bash
cd Backend

# Esegui tutti i test
bundle exec rspec

# Esegui test specifici
bundle exec rspec spec/models/user_spec.rb
bundle exec rspec spec/controllers/api/products_controller_spec.rb

# Con coverage
bundle exec rspec --format documentation
```

### Frontend Testing (Vitest)

```bash
cd Frontend

# Esegui test una volta
npm test

# Watch mode (riesegue ad ogni modifica)
npm run test:watch

# Con coverage
npm run test:coverage
```

**Test Implementati:**
- Unit test per services (auth, cart, product)
- Component tests per guard
- Integration test per interceptors