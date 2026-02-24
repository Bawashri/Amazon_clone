# Amazon-like eCommerce Web App

Production-ready full-stack project using Node.js, Express, MySQL2, JWT, React, and Axios.

## Tech Stack
- Backend: Node.js, Express.js, MySQL2, JWT
- Frontend: React.js (Vite), Axios, React Router
- Database: MySQL (relational, foreign keys)

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    utils/
    app.js
    server.js
  sql/
    schema.sql
    seed.sql
  .env
  .env.example

frontend/
  src/
    api/
    components/
    context/
    pages/
    routes/
    App.jsx
    main.jsx
    styles.css
  .env.example
```

## Features Implemented

### Authentication & Authorization
- JWT signup/login/logout
- Role-based route protection (`ADMIN`, `USER`)
- Subscription type support (`NORMAL`, `PREMIUM`)
- Protected backend routes + protected React routes
- User profile view and update

### User Features
- Signup/Login/Logout
- Profile view/update
- Browse products by category
- Search products by name
- Price filtering (`below500`, `500-1000`, `above1000`)
- Cart management
- Wishlist management
- Buy now flow
- Order history + rejected history + order tracking
- Feedback submission and listing

### Admin Features
- View pending orders
- Approve/Reject pending orders (transaction-safe)
- Update order status (`SHIPPED`, `DELIVERED`)
- Add/Delete products (Edit endpoint is available in backend)

### Business Logic
- `NORMAL` buy -> `orders` row with `PENDING`
- `PREMIUM` buy -> auto-approved (`orders` + `approved_orders`)
- Delivery ETA dynamic:
  - NORMAL: 5-7 days
  - PREMIUM: 1-2 days
- Console notification stubs:
  - Admin notified on new pending order
  - User notified on status updates

## Setup Instructions

## 1. MySQL Setup
1. Create or start MySQL server.
2. Run SQL files in order:
   - `backend/sql/schema.sql`
   - `backend/sql/seed.sql`

## 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env values
npm run dev
```
Backend runs at `http://localhost:5000`.

## 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`.

## API Overview
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`
- User: `/api/users/profile`
- Categories: `/api/categories`
- Products: `/api/products`
- Cart: `/api/cart`
- Wishlist: `/api/wishlist`
- Orders: `/api/orders/buy`, `/api/orders/my`, `/api/orders/rejected`, `/api/orders/:id`
- Admin: `/api/admin/orders/pending`, `/api/admin/orders/:orderId/approve`, `/api/admin/orders/:orderId/reject`, `/api/admin/orders/:orderId/status`
- Feedback: `/api/feedback`, `/api/feedback/product/:productId`

## Notes
- Use bcrypt-hashed passwords (signup API does this automatically).
- To create an admin user, insert a user with role `ADMIN` or promote an existing user directly in MySQL.
- `server.js` is the backend entry point.
- `.env` is used directly with `dotenv` (no `env.js` config file).
