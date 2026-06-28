
# shop-mock-api

Mock REST API per il corso Angular (catalogo prodotti + ordini), basata su **json-server**.

Pensata per essere usata dagli studenti come backend finto per:
- lista prodotti (`GET /products`)
- dettaglio prodotto (`GET /products/:id`)
- lista ordini (`GET /orders`)
- creazione ordine (`POST /orders`)

## Requisiti

- Node.js (versione LTS consigliata)
- npm

## Installazione

```bash
npm install
```

## Avvio in locale (sviluppo)

Avvia il mock server REST sulla porta `3000` con una piccola latenza simulata (300ms):

```bash
npm run dev
```

L'API sarà disponibile su: `http://localhost:3000`

Endpoint principali:

- `GET /products`
- `GET /products/:id`
- `GET /orders`
- `POST /orders`

> Nota: json-server gestisce automaticamente gli ID numerici incrementali per le risorse.

## Deploy su Render (esempio)

Se vuoi usare questo progetto come backend condiviso per tutta la classe:

1. Crea un nuovo repository Git (oppure usa quello del corso) con il contenuto di questa cartella.
2. Pusha il repo su GitHub/GitLab.
3. Su [Render](https://render.com):
   - Crea un **New → Web Service**
   - Collega il repository
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: **Free** (per mock leggeri è sufficiente)

Render imposterà automaticamente la variabile d'ambiente `PORT` che viene usata dallo script `npm start`.

L'URL finale sarà qualcosa come:

```text
https://shop-mock-api.onrender.com
```

e gli endpoint diventeranno:

```text
GET  https://shop-mock-api.onrender.com/products
GET  https://shop-mock-api.onrender.com/products/1
POST https://shop-mock-api.onrender.com/orders
```

## OpenAPI

In questo progetto è incluso anche un file `openapi.yaml` con la documentazione dell'API
in formato **OpenAPI 3.0** (schema di `Product`, `Order`, ecc.).

Puoi:

- aprirlo con editor come [Swagger Editor](https://editor.swagger.io/) per vedere la documentazione in formato HTML,
- integrarlo nelle slide del corso,
- usarlo come base per strumenti di generazione client/server (anche se qui il server è json-server).

---


## Swagger UI

Questo progetto espone la documentazione OpenAPI tramite **Swagger UI**.

Dopo aver installato le dipendenze:

```bash
npm install
```

puoi avviare il server (API + documentazione) con:

```bash
npm run dev
```

- Endpoint API principali: `http://localhost:3000/products`, `http://localhost:3000/orders`, ecc.
- Documentazione Swagger UI: `http://localhost:3000/docs`

In produzione / deploy (ad esempio su Render) viene usato lo stesso comando:

```bash
npm start
```

che lancia `node server.js`.
