# Couple-Co — Full Stack E-Commerce App

A full-stack couple-themed e-commerce application for T-shirts. Built with **React + Vite** on the frontend and **Express.js + MongoDB** on the backend, with **Razorpay** payment gateway integration.

---

## Overview

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router v7 |
| Backend | Node.js, Express.js v5, MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens via HTTP-only cookies) |
| Payments | Razorpay |
| Validation | Zod |
| File Uploads | Multer |
| Rate Limiting | express-rate-limit |
| Logging | Winston |
| Containerization | Docker |

---

## Monorepo Structure

```
couple-co/
├── shop/          # React frontend (Vite)
└── Backend/       # Express.js API server
```

---

## Frontend — `shop/`

### Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **shadcn/ui** components
- **React Router v7** for client-side routing
- **Axios** for API calls (with `withCredentials: true` for cookie-based auth)
- **Lucide React** for icons
- **Geist** variable font

### Folder Structure

```
shop/
├── index.html
├── vite.config.js
├── components.json               # shadcn/ui config
│
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Router + route definitions
    ├── index.css / App.css       # Global styles
    │
    ├── lib/
    │   ├── api.js                # Axios instance (baseURL + credentials)
    │   └── utils.js              # cn() utility (clsx + tailwind-merge)
    │
    ├── context/
    │   └── AuthContext.jsx       # Global auth state, cart count, wishlist count
    │
    ├── components/
    │   ├── Navbar.jsx            # Sticky nav with cart/wishlist badges
    │   ├── Login.jsx             # Login form
    │   ├── Register.jsx          # Registration form
    │   ├── TshirtCard.jsx        # Product card component
    │   └── ui/                   # shadcn/ui primitives
    │       ├── badge.jsx
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       └── navigation-menu.jsx
    │
    └── pages/
        ├── AllTshirts.jsx        # Product listing (home page)
        ├── Productdetails.jsx    # Single product detail + add to cart
        ├── Cards.jsx             # Cart page
        ├── WishlistPage.jsx      # Wishlist page
        ├── ProfilePage.jsx       # User profile + address
        └── AdminPage.jsx         # Admin dashboard
```

### Pages & Routes

| Path | Component | Description |
|---|---|---|
| `/` | `AllTshirts` | Product listing (home) |
| `/allsheets` | `AllTshirts` | Same listing (alternate path) |
| `/product/:id` | `Productdetails` | Product detail + add to cart |
| `/cart` | `CartPage` | Cart with quantity controls |
| `/wishlist` | `WishlistPage` | Saved products |
| `/profile` | `ProfilePage` | User profile + shipping address |
| `/admin` | `AdminPage` | Admin dashboard (admin role only) |
| `/login` | `Login` | Login form |
| `/register` | `Register` | Register form |

### Auth Context

`AuthContext` provides global state across the app:

```js
const { user, loading, login, register, logout, cartCount, refreshCartCount, wishlistCount, refreshWishlistCount } = useAuth();
```

- Checks auth status on mount via `GET /api/user/get-profile`
- `cartCount` and `wishlistCount` shown as badges in the Navbar
- Automatically refreshes counts on login

### Environment Variables (Frontend)

Create `shop/.env`:

```env
VITE_API_URL=http://localhost:4505/api
```

### Run Frontend

```bash
cd shop
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

---

## Backend — `Backend/`

### Tech Stack

- **Node.js** (ESM modules — `"type": "module"`)
- **Express.js v5**
- **MongoDB** via **Mongoose**
- **JWT** (access token + refresh token in HTTP-only cookies)
- **bcrypt** for password hashing
- **Zod** for request validation
- **Multer** for file uploads
- **Razorpay** for payments
- **Winston** for logging
- **node-cron** for scheduled tasks
- **express-rate-limit** — 10,000 req / 15 min per IP

### Folder Structure

```
Backend/
├── server.js                        # Entry — starts server, DB, seeds
├── index.js                         # Express app, middleware, route mounts
├── Dockerfile
├── .env
├── package.json
│
├── public/
│   ├── images/                      # Static assets
│   └── temp/                        # Temp upload storage
│
└── src/
    ├── config/
    │   ├── mongoos.config.js        # MongoDB connection
    │   ├── seed.admin.js            # Seeds default admin on startup
    │   └── seed.products.js         # Seeds default products on startup
    │
    ├── middlewares/
    │   ├── jwt.auth.js              # JWT verification
    │   ├── access.control.js        # Role-based access (admin/user)
    │   ├── multer.js                # File upload config
    │   └── zod.validation.js        # Body validation middleware
    │
    ├── Users/
    │   ├── users.schema.js          # User model
    │   ├── user.profile.schema.js   # Profile/address model
    │   ├── users.repo.js
    │   ├── users.controller.js
    │   └── users.routs.js
    │
    ├── products/
    │   ├── product.schema.js
    │   ├── product.repo.js
    │   ├── product.controller.js
    │   └── product.routs.js
    │
    ├── Orders/
    │   ├── card.schema.js           # Cart item model
    │   ├── order.schema.js          # Order model
    │   ├── payment.schema.js        # Payment model (Razorpay fields)
    │   ├── wishlist.schema.js
    │   ├── orders.repo.js           # Cart + Order DB logic
    │   ├── order.controller.js      # Cart + Order controllers
    │   ├── order.payment.js         # Razorpay payment controller
    │   ├── order.routs.js           # Cart + Order routes
    │   ├── payment.routs.js         # Payment routes
    │   ├── wishlist.repo.js
    │   ├── wishlist.controller.js
    │   └── wishlist.routs.js
    │
    ├── User_Admin_Management/
    │   ├── management.repo.js
    │   ├── management.controller.js
    │   └── management.routs.js
    │
    └── util/
        ├── api.response.js          # Standard success wrapper
        ├── api.error.js             # Standard error wrapper
        ├── accesstoken.create.js
        └── refreshtoken.create.js
```

### Environment Variables (Backend)

Create `Backend/.env`:

```env
# Server
PORT=4505

# MongoDB
MONGODB_CONNECTION_STRING="mongodb+srv://<user>:<password>@cluster.mongodb.net/couple-co"

# JWT
ACCESSTOKEN_KEY="your_access_token_secret"
REFRESHTOKEN_KEY="your_refresh_token_secret"

# Frontend (CORS)
FRONTEND_URL="http://localhost:5173"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

> Get Razorpay keys from **Dashboard → Settings → API Keys**.  
> Get the webhook secret from **Dashboard → Webhooks** when you register the endpoint.

### Run Backend

```bash
cd Backend
npm install
npm install razorpay        # if not already installed
npm run dev                 # nodemon server.js — http://localhost:4505
```

### Docker

```bash
cd Backend
docker build -t couple-co-backend .
docker run -p 4505:4505 --env-file .env couple-co-backend
```

---

## Running Both Together

```bash
# Terminal 1 — Backend
cd Backend && npm run dev

# Terminal 2 — Frontend
cd shop && npm run dev
```

Frontend runs at `http://localhost:5173`, proxies API calls to `http://localhost:4505/api`.

---

## API Reference

> Base URL: `http://localhost:4505/api`  
> Auth: JWT in HTTP-only cookie. All frontend requests use `withCredentials: true`.

---

### Auth — `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ✗ | Register new user |
| POST | `/login` | ✗ | Login — sets JWT cookies |
| DELETE | `/logout` | ✓ | Logout — clears cookies |
| POST | `/creatprofile` | ✓ | Create shipping profile |
| PUT | `/profile-update` | ✓ | Update profile |
| GET | `/get-profile` | ✓ | Get current user profile |
| POST | `/refresh-Token` | ✓ | Refresh access + refresh tokens |

**Register / Login body:**
```json
{ "name": "Rohan", "email": "rohan@example.com", "password": "pass123" }
```

---

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/get-all` | ✗ | All products |
| GET | `/:id` | ✗ | Product by ID |
| POST | `/create` | ✓ Admin | Create product |
| PUT | `/update/:id` | ✓ Admin | Update product |
| DELETE | `/delete/:id` | ✓ Admin | Delete product |

---

### Management — `/api/management`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | ✗ | All products (management view) |
| GET | `/products/search?q=` | ✗ | Search products |
| GET | `/details/:name` | ✗ | Product by name |
| GET | `/products/category/:category` | ✗ | Filter by category |
| GET | `/products/filter/price?min=&max=` | ✗ | Filter by price range |
| GET | `/products/total/:category` | ✗ | Product count by category |
| DELETE | `/admin/user/:userid` | ✓ | Remove user |
| DELETE | `/admin/:adminid` | ✓ | Remove admin |
| GET | `/admin/totalrevenue` | ✓ Admin | Total revenue |

---

### Cart — `/api/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create` | ✓ | Add item to cart |
| GET | `/getall` | ✓ | Get cart items |
| PUT | `/update?id=&quantity=` | ✓ | Update item quantity |
| DELETE | `/delete/:id` | ✓ | Remove one cart item |
| DELETE | `/deleteall` | ✓ | Clear entire cart |

**Add to cart body:**
```json
{ "product": "<productId>", "quantity": 1, "size": "M", "price": 499 }
```

---

### Orders — `/api/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/createorder` | ✓ | Place order from cart |
| GET | `/admin/all-orders` | ✓ Admin | All orders |

> `POST /createorder` validates stock, deducts inventory, creates order documents, cleans up orphaned cart items, and clears the cart.

---

### Payment — `/api/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | ✓ | Create Razorpay order (step 1) |
| POST | `/verify` | ✓ | Verify payment signature (step 2) |
| GET | `/my-payments` | ✓ | User's payment history |
| GET | `/admin/all` | ✓ Admin | All payments |
| POST | `/webhook` | ✗ | Razorpay server webhook |

**Create order body:**
```json
{ "amount": 1499, "currency": "INR", "orderIds": ["<orderId>"] }
```

**Verify body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx",
  "paymentId": "<db_payment_id>",
  "paymentMethod": "UPI"
}
```

---

### Wishlist — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get wishlist |
| GET | `/check/:productId` | ✓ | Check if product is wishlisted |
| POST | `/add/:productId` | ✓ | Add to wishlist |
| DELETE | `/remove/:productId` | ✓ | Remove from wishlist |
| DELETE | `/clear` | ✓ | Clear wishlist |

---

## Payment Flow (Razorpay)

### Register route in `index.js`

```js
import paymentRouter from "./src/Orders/payment.routs.js";
server.use("/api/payment", paymentRouter);
```

### Frontend Integration

```js
// Step 1 — Create Razorpay order
const { data } = await api.post("/payment/create-order", {
  amount: totalAmount,          // in rupees
  currency: "INR",
  orderIds: ["<orderId>"]
});

// Step 2 — Open Razorpay Checkout
// Add to index.html: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
const options = {
  key: data.key,
  amount: data.amount,
  currency: data.currency,
  order_id: data.razorpayOrderId,
  name: "Couple Chaos",
  handler: async (response) => {
    // Step 3 — Verify
    await api.post("/payment/verify", {
      ...response,
      paymentId: data.paymentId,
      paymentMethod: "UPI"
    });
  },
  theme: { color: "#302b63" }
};
new window.Razorpay(options).open();
```

### Webhook (Production)

Register `https://yourdomain.com/api/payment/webhook` in Razorpay Dashboard → Webhooks.  
Subscribe to: `payment.captured`, `payment.failed`, `refund.created`.

---

## Data Models

### User
```
name, email, password (bcrypt), role (user | admin), refreshToken
```

### Profile
```
user (ref), fullName, phone, addressLine1, addressLine2,
city, state, postalCode, country, landmark, addressType
```

### Product
```
name, description, price, stock, category, images[], size[]
```

### Cart (card)
```
user (ref), product (ref), quantity, size, price, total
```

### Order
```
userId (ref), productId (ref), shippingAddress (embedded),
quantity, price, totalAmount,
status: Pending | Shipped | Delivered | Cancelled
```

### Payment
```
userId (ref), orders[] (ref), amount, currency (INR),
paymentMethod: UPI | CARD | NET_BANKING | WALLET | COD,
status: PENDING | SUCCESS | FAILED | REFUNDED,
razorpayOrderId, razorpayPaymentId, razorpaySignature,
paidAt, refundedAt
```

### Wishlist
```
user (ref), products[] (ref)
```

---

## Standard Response Format

**Success**
```json
{ "statusCode": 200, "message": "Operation successful", "data": {} }
```

**Error**
```json
{ "statusCode": 400, "message": "Something went wrong", "error": "Details" }
```

---

## Notes

- On first startup `seed.admin.js` and `seed.products.js` auto-run to populate default data.
- Deleted products are automatically cleaned from cart during order placement.
- Use `rzp_test_*` keys for development, `rzp_live_*` for production.
- CORS is configured to allow only `FRONTEND_URL` with credentials.
