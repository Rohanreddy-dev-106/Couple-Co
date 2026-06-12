# Couple-Co 🛍️

A full-stack e-commerce platform for a couple-themed clothing store. Built with a **React + Vite** frontend and a **Node.js / Express** REST API backend, backed by **MongoDB**. The project is production-ready with JWT authentication, role-based access control, cart, wishlist, order management, rate limiting, and Docker support.

> ⚠️ **Payment gateway integration is intentionally excluded** and will be added in a future release.

---

## 📁 Project Structure

```
couple-co/
├── Backend/          # Express REST API (Node.js)
└── shop/             # React frontend (Vite)
```

---

## ✨ Features

### 🛒 Customer-Facing
- User registration & login with secure JWT authentication (HTTP-only cookies)
- Access token + refresh token flow
- Create and update user profile
- Browse all products, filter by category, filter by price range, search by name
- Product detail pages
- Add to cart / update quantities / remove items / clear cart
- Wishlist — add, remove, check, and clear
- Place orders

### 🔐 Admin
- Admin-seeded on server start (no manual setup)
- Create, update, and delete products
- View all orders and delete individual orders
- Remove users and other admins
- View total user count

### ⚙️ Backend Infrastructure
- Express 5 with modular route architecture
- Zod schema validation on all inputs
- Winston structured logging
- Express Rate Limiter (1000 req / 15 min per IP)
- CORS configured for frontend origin
- Multer for image/file uploads
- MongoDB with Mongoose ODM
- Auto-seed admin and products on first boot
- Custom `ApiError` and `ApiResponse` utility classes
- Custom 404 HTML page with API docs link
- Dockerized with a multi-stage-ready `Dockerfile`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router v7, Axios |
| UI | Tailwind CSS v4, shadcn/ui, Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt, HTTP-only cookies |
| Validation | Zod |
| Logging | Winston |
| Rate Limiting | express-rate-limit |
| File Uploads | Multer |
| Scheduling | node-cron |
| Dev Tools | Nodemon, Autocannon |
| Containerization | Docker |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- npm

---

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file (use `.env.example` as reference):

```env
PORT=4505
MONGODB_CONNECTION_STRING="your_mongodb_connection_string"
ACCESSTOKEN_KEY="your_access_token_secret"
REFRESHTOKEN_KEY="your_refresh_token_secret"
FRONTEND_URL="http://localhost:5173"
```

Start the server:

```bash
npm run dev
```

The server will start on `http://localhost:4505`. On first run it will automatically seed the admin account and product catalogue.

---

### Frontend Setup

```bash
cd shop
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

### Docker (Backend)

```bash
cd Backend
docker build -t couple-co-backend .
docker run -p 4505:4505 --env-file .env couple-co-backend
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Rate limiting applies globally to all `/api` routes.

### Auth & Users — `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT cookies |
| POST | `/refresh-Token` | Public | Refresh access token |
| POST | `/creatprofile` | 🔒 User | Create user profile |
| PUT | `/profile-update` | 🔒 User | Update user profile |
| GET | `/get-profile` | 🔒 User | Get current user's profile |
| DELETE | `/logout` | 🔒 User | Logout and clear cookies |

---

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/get-all` | Public | Get all products |
| GET | `/:id` | Public | Get product by ID |
| POST | `/create` | 🔒 Admin | Create a product |
| PUT | `/update/:id` | 🔒 Admin | Update a product |
| DELETE | `/delete/:id` | 🔒 Admin | Delete a product |

---

### Management & Search — `/api/management`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | Get all products (management view) |
| GET | `/products/search` | Public | Search products by name |
| GET | `/details/:name` | Public | Get product details by name |
| GET | `/products/category/:category` | Public | Filter products by category |
| GET | `/products/filter/price` | Public | Filter products by price range |
| GET | `/products/total/:category` | Public | Get total products in a category |
| GET | `/admin/totalusers` | 🔒 Admin | Get total registered users |
| DELETE | `/admin/user/:userid` | 🔒 Admin | Remove a user |
| DELETE | `/admin/:adminid` | 🔒 Admin | Remove an admin |

---

### Cart (Orders) — `/api/order`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create` | 🔒 User | Add item to cart |
| GET | `/getall` | 🔒 User | Get all cart items |
| PUT | `/update` | 🔒 User | Update cart item |
| DELETE | `/delete/:id` | 🔒 User | Remove a cart item |
| DELETE | `/deleteall` | 🔒 User | Clear entire cart |
| POST | `/createorder` | 🔒 User | Place an order |
| GET | `/admin/all-orders` | 🔒 Admin | View all orders |
| DELETE | `/admin/delete-order/:id` | 🔒 Admin | Delete an order |

---

### Wishlist — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 User | Get user's wishlist |
| GET | `/check/:productId` | 🔒 User | Check if product is wishlisted |
| POST | `/add/:productId` | 🔒 User | Add product to wishlist |
| DELETE | `/remove/:productId` | 🔒 User | Remove from wishlist |
| DELETE | `/clear` | 🔒 User | Clear entire wishlist |

---

## 🔐 Authentication

This project uses a **dual-token strategy**:

- **Access Token** — short-lived JWT stored in an HTTP-only cookie (`jwtToken`)
- **Refresh Token** — long-lived token used to issue a new access token via `POST /api/user/refresh-Token`

Role-based access is enforced via the `AccessControl` middleware. Roles: `user` and `admin`.

---

## 🗂️ Frontend Pages

| Page | Route | Description |
|---|---|---|
| Home / All T-shirts | `/` | Product listing |
| Product Details | `/product/:id` | Individual product view |
| Cart | `/cart` | Shopping cart |
| Wishlist | `/wishlist` | Saved items |
| Profile | `/profile` | User profile |
| Contact | `/contact` | Contact page |
| Admin Panel | `/admin` | Admin dashboard |
| Login | `/login` | Auth |
| Register | `/register` | Auth |

---

## 📦 Production Deployment Checklist

- [x] JWT authentication with HTTP-only cookies
- [x] Bcrypt password hashing
- [x] Zod input validation on all routes
- [x] Rate limiting (express-rate-limit)
- [x] CORS configured for specific frontend origin
- [x] Winston logging
- [x] Docker support
- [x] Environment variable configuration via `.env`
- [x] Admin and product seeding on startup
- [ ] Payment gateway *(coming soon)*

---

## 🗺️ Roadmap

- [ ] Razorpay / Stripe payment gateway integration
- [ ] Order status tracking
- [ ] Email confirmation on order placement
- [ ] Product image upload to cloud storage (Cloudinary / S3)
- [ ] Pagination for product listings
- [ ] Review and rating system

---

## 👨‍💻 Author

**Rohan Reddy**

---

## 📄 License

ISC