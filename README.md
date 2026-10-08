# 👑 Aarrudh Fashion – Women's Boutique (MERN Stack)

A production-ready, full-stack e-commerce application designed specifically for **Aarrudh Fashion**, a luxury women's ethnic boutique specializing in festive **kurta sets (kurta + pant + dupatta)** with royal pearl embroidery, antique zari, lustrous tissue silk, and stone work.

---

## 🌸 Brand Identity & Palette
- **Brand Name**: Aarrudh Fashion
- **Tagline**: Women's Boutique
- **Logo**: A woman in an elegant magenta saree with golden borders beside a royal crown and golden "A" (`client/src/assets/logo.png` & `logo.svg`).
- **Color Theme**:
  - Gold: `#B8860B` / `#D4A62A`
  - Magenta: `#C2185B`
  - Cream Background: `#FFF9EC`
  - Dark Typography: `#2B2B2B`
  - Warm Borders: `#EADDC6`
- **Typography**: Playfair Display (Serif headings) & Montserrat (Clean body).
- **Currency**: INR (₹). Market: India.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit (Auth, Cart, Wishlist)
- **Styling**: Tailwind CSS with custom boutique design tokens
- **HTTP Client**: Axios with httpOnly cookie credentials & Bearer fallback
- **Icons & Polish**: Lucide React, react-hot-toast, canvas-confetti

### Backend
- **Runtime**: Node.js & Express
- **Database & ODM**: MongoDB & Mongoose
- **Security**: JWT sessions, bcryptjs, Helmet, CORS whitelist, express-rate-limit, express-validator
- **File Uploads**: Multer with Cloudinary integration & local static serving fallback
- **Payments**: Razorpay SDK (Cards & UPI support, signature verification, webhook processing, sandbox fallback)
- **SMS Notifications**: Swappable SMS service (Twilio, MSG91, or console logger) with database persistence (`Notification` collection)
- **Email Service**: Nodemailer transporter with template formatting

---

## 👥 User Roles & Flow

1. **Guest**:
   - Access to **Landing Page (`/`) ONLY**.
   - Showcases hero lookbook banner and curated collections with descriptions.
   - **No prices, no product grids, and no shopping cart** for unauthenticated guests.
   - Clicking "Explore" prompts login or registration.

2. **Customer**:
   - Register with full name, email, and **10-digit Indian mobile number** (for SMS dispatch).
   - Log in using email or mobile number + password.
   - Access **AJIO-style Shop Page (`/shop`)** with dynamic left filter sidebar, color swatches, size picker, price slider, fabric, neck style, and sorting.
   - Product Details (`/product/:id`) with image zoom gallery, size chart modal, "What's in the set" (Kurta, Pant, Dupatta), and pincode delivery checker.
   - Wishlist (`/wishlist`) and Bag (`/cart`).
   - **Mandatory Address step** before payment: Name, mobile, 6-digit pincode, house, area, city, state. Payment is strictly blocked until a valid address is selected.
   - Online Payment via **Razorpay (Cards & UPI)**.
   - Order tracking (`/orders`, `/orders/:id`) with live status timeline and printable tax invoice.

3. **Admin** (`/admin`):
   - **Dashboard**: Total revenue, orders today, pending shipments, low-stock watchlist, 7-day sales chart.
   - **Landing Page Editor**: Edit hero banner (title, subtitle, image, CTA), boutique studio details, phone, email, and social links with immediate reflection on `/`.
   - **Product & Inventory Management**: Add/edit/delete kurta sets, per-size stock (S–XXL), multi-image upload, fabric, necklines, tags, active status.
   - **Collections & Categories**: Create lookbooks, manage sort order, toggle landing visibility.
   - **Orders & Shipment (SMS)**: Filter by status, update states, and **assign courier & agent details** which automatically triggers an SMS notification to the customer's phone.
   - **Customer Directory**: View customer profiles, order counts, and lifetime boutique spend.
   - **Audit Log & SMS Activity**: Full audit trail of admin modifications and every customer SMS attempt.

---

## 📦 Project Structure

```
ArudhFasions/
├── package.json                 # Root script runner (dev, install, seed)
├── README.md                    # Documentation
├── .env.example                 # Root environment reference
├── server/
│   ├── .env                     # Server environment file
│   ├── .env.example
│   ├── server.js                # Server entry point
│   ├── app.js                   # Express application setup
│   ├── config/                  # DB connection and business constants
│   ├── models/                  # Mongoose models (User, Product, Order, etc.)
│   ├── controllers/             # REST API business logic
│   ├── routes/                  # Express route definitions
│   ├── middleware/              # Auth, upload, rate limit, error handlers
│   ├── services/                # Razorpay, SMS, Email, Upload services
│   ├── utils/                   # Audit logger, express-validators
│   ├── seed/                    # Database seeder (Admin, Diwali lookbook, 20 products)
│   └── uploads/                 # Local uploads fallback directory
└── client/
    ├── package.json
    ├── vite.config.js           # Vite dev server with /api proxy
    ├── tailwind.config.js       # Boutique colors & typography
    ├── index.html
    └── src/
        ├── assets/              # Boutique logo (PNG & SVG)
        ├── api/                 # Axios client with interceptors
        ├── store/               # Redux Toolkit store (auth, cart, wishlist)
        ├── components/          # Common UI, Modals, Navbars, Footers
        ├── pages/               # Landing, Shop, Product, Checkout, Orders
        │   └── admin/           # Dashboard, LandingEditor, Products, Orders, etc.
        └── routes/              # Protected & Admin route guards
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended, v23 verified)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

### 2. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or run `npm install` inside root, `server/`, and `client/` directories).*

### 3. Setup Environment Variables
Both `server/.env` and `server/.env.example` are pre-configured for local testing:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/aarrudh_fashion
JWT_SECRET=aarrudh_fashion_super_secret_jwt_key_2026_boutique
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@aarrudhfashion.com
ADMIN_PASSWORD=Admin@12345
SMS_PROVIDER=console
```

### 4. Seed the Database
Populates the admin account, sample customer, "Diwali Collection – New Launch", and the **20 sample kurta set designs**:
```bash
npm run seed
```

### 5. Launch Development Servers
Start both the Express backend and Vite React frontend concurrently:
```bash
npm run dev
```
- **Storefront Client**: [http://127.0.0.1:5173](http://127.0.0.1:5173) (or `http://localhost:5173`)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Default Credentials

| Role | Email / Identifier | Password | Access |
|---|---|---|---|
| **Admin** | `admin@aarrudhfashion.com` | `Admin@12345` | Landing Editor, Products, Collections, Orders & SMS, Dashboard |
| **Customer** | `customer@aarrudhfashion.com` | `Customer@123` | Shop, Wishlist, Bag, Checkout, Order Tracking |

---

## 📱 SMS Shipment Notification Workflow

1. A customer places an order via **Card or UPI**. Payment is marked `PAID` / `PROCESSING`.
2. Admin opens **Admin Panel &rarr; Orders & Shipments &rarr; Assign SMS**.
3. Admin selects the Courier (e.g., *Blue Dart Express*), enters Courier Agent Name, Agent Phone, and Tracking Waybill ID.
4. When saved:
   - Order status automatically updates to `SHIPPED`.
   - Backend formats and dispatches the exact required notification message:
     ```
     Aarrudh Fashion: Your order #AF1023 is shipped via Blue Dart Express. Agent: Ramesh Kumar (9876543210). Tracking ID: BD48291048. Expected delivery: 12 Oct 2026. Track: https://www.bluedart.com/tracking?id=BD48291048
     ```
   - Attempt is persisted to the `Notification` collection with status, timestamp, and provider response.
   - Can be monitored in **Admin Panel &rarr; Audit Log & SMS Activity**.
#   a a r r u d h F a s i o n  
 