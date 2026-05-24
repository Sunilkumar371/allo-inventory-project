# Allo Engineering – Inventory Reservation System

A full-stack inventory reservation system built with Next.js App Router, Prisma, PostgreSQL, React Query, and Tailwind CSS.

This project solves the core e-commerce concurrency problem where multiple users attempt to reserve the same inventory simultaneously during checkout.

---

# Live Demo

```txt
https://allo-inventory-project.vercel.app/
```

---

# GitHub Repository

```txt
https://github.com/Sunilkumar371/allo-inventory-project
```

---

# Tech Stack

## Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Sonner

## Backend

* Next.js Route Handlers
* Prisma ORM
* PostgreSQL (Neon / Supabase compatible)
* Zod Validation

## Deployment

* Vercel
* Neon PostgreSQL

---

# Features

## Inventory Management

* Products
* Warehouses
* Inventory tracking per warehouse
* Available stock calculation
* Reserved stock tracking

## Reservation System

* Temporary inventory reservations
* Reservation expiry handling
* Reservation confirmation
* Reservation cancellation/release
* Automatic stock restoration

## Concurrency Safety

The reservation system is designed to be race-condition-safe under concurrent requests.

Implemented using:

* PostgreSQL transactions
* Row-level locking (`FOR UPDATE`)
* Serializable transaction isolation

This guarantees that when two users attempt to reserve the last available unit simultaneously, exactly one request succeeds.

---

# System Design

## Inventory Model

Inventory is stored per:

```txt
Product + Warehouse
```

Available stock is derived dynamically:

```txt
availableQuantity = totalQuantity - reservedQuantity
```

`availableQuantity` is intentionally not stored in the database to avoid stale derived state.

---

# Reservation Lifecycle

```txt
PENDING
   ↓
CONFIRMED
```

or

```txt
PENDING
   ↓
RELEASED
```

or

```txt
PENDING
   ↓
EXPIRED
```

---

# API Endpoints

## Products

### GET /api/products

Returns products with inventory grouped by warehouse.

### POST /api/products

Creates a product.

---

## Warehouses

### GET /api/warehouses

Returns all warehouses.

### POST /api/warehouses

Creates a warehouse.

### GET /api/warehouses/:id

Returns warehouse details.

### PATCH /api/warehouses/:id

Updates warehouse details.

### DELETE /api/warehouses/:id

Deletes a warehouse.

---

## Inventory

### GET /api/inventory

Returns inventory with product and warehouse information.

### POST /api/inventory

Creates inventory for a product in a warehouse.

### GET /api/inventory/:id

Returns single inventory details.

### PATCH /api/inventory/:id

Updates inventory quantity.

### DELETE /api/inventory/:id

Deletes inventory.

---

## Reservations

### POST /api/reservations

Creates a temporary reservation.

Returns:

* `201` on success
* `409` if stock is unavailable

### GET /api/reservations/:id

Returns reservation details.

### POST /api/reservations/:id/confirm

Confirms reservation and permanently decrements stock.

Returns:

* `410` if reservation expired

### POST /api/reservations/:id/release

Releases reservation and restores stock.

---

# Concurrency Strategy

The most critical requirement of this assignment is ensuring reservation correctness under concurrent requests.

This project handles concurrency using:

## PostgreSQL Transactions

All reservation operations occur inside database transactions.

## Row-Level Locking

Inventory rows are locked using:

```sql
SELECT * FROM "Inventory"
WHERE id = ?
FOR UPDATE
```

This ensures:

* only one transaction can modify inventory at a time
* overselling cannot occur
* concurrent reservation requests are serialized safely

## Serializable Isolation

Transactions use:

```txt
Serializable
```

isolation level to maximize consistency.

---

# Reservation Expiry

Reservations expire automatically after 10 minutes.

## Expiry Strategy

Reservation Expiry

Reservations expire automatically after 10 minutes.

Expiry Strategy

This project uses a lazy cleanup strategy instead of scheduled cron jobs.

Whenever inventory or reservations are accessed, the backend checks for expired pending reservations and automatically releases their reserved stock inside database transactions.

This approach was chosen because:

Vercel Hobby plans limit cron execution frequency
lazy cleanup keeps the system consistent without dedicated background infrastructure
it simplifies deployment while preserving correctness

Expired reservations are handled by:

detecting expired PENDING reservations
releasing reserved inventory
marking reservations as EXPIRED

All cleanup operations run inside PostgreSQL transactions with row-level locking to maintain concurrency safety.

---

# Frontend Architecture

## React Query

Used for:

* API state management
* caching
* query invalidation
* automatic UI updates

After reservation confirmation/cancellation:

```txt
queryClient.invalidateQueries(["products"])
```

ensures the homepage inventory updates instantly without manual refresh.

---

# Validation

All API inputs are validated using Zod.

Examples:

* product creation
* warehouse creation
* inventory updates
* reservation requests

This provides:

* runtime validation
* type inference
* safer APIs

---

# Database Schema

Core models:

* Product
* Warehouse
* Inventory
* Reservation

Relationships:

```txt
Product
  ↕
Inventory
  ↕
Warehouse
```

Reservations belong to inventory records.

---

# Running Locally

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd allo-inventory-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create:

```txt
.env
```

Add:

```env
DATABASE_URL="your_postgres_connection_url"
```

---

## 4. Run Prisma Migrations

```bash
npx prisma migrate dev
```

---

## 5. Generate Prisma Client

```bash
npx prisma generate
```

---

## 6. Seed Database

```bash
npx tsx prisma/seed.ts
```

---

## 7. Start Development Server

```bash
npm run dev
```

---

# Production Deployment

## Environment Variables

Set on Vercel:

```env
DATABASE_URL
```

---

## Build Command

```bash
npx prisma generate && npx prisma migrate deploy && next build
```

---

# Trade-offs & Improvements

## What I Prioritized

* concurrency correctness
* transactional consistency
* clean API structure
* end-to-end functionality
* frontend UX flow

---

## Possible Future Improvements

### Idempotency Keys

The assignment bonus feature was not implemented.

In production, I would add:

* Redis-backed idempotency keys
* request deduplication for confirm/release flows

This would protect against:

* payment provider retries
* accidental duplicate requests

---

### Background Workers

Currently reservation expiry uses Vercel Cron.

At larger scale I would likely move expiry handling to:

* queue workers
* event-driven processing
* dedicated background jobs

---

### Authentication & Authorization

Currently omitted to focus on reservation correctness.

Production systems would include:

* admin authentication
* RBAC
* audit logs

---

### Soft Deletes

Currently records are deleted directly.

Production systems would typically use:

```txt
soft delete
```

for auditability.

---

### Optimistic UI

The frontend currently uses cache invalidation.

With more time I would implement:

* optimistic inventory updates
* smoother transitions
* websocket-based real-time updates

---

# Final Notes

The main goal of this project was correctness under concurrency.

The reservation system guarantees that inventory cannot be oversold even under simultaneous requests.

The project intentionally prioritizes transactional integrity and clean system design over unnecessary complexity.
