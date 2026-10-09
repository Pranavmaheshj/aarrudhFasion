const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const landingRoutes = require('./routes/landingRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads and bundled boutique images directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Health checks and favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Aarrudh Fashion Women's Boutique API",
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      landing: '/api/landing',
      collections: '/api/collections',
      products: '/api/products',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      payments: '/api/payments',
      admin: '/api/admin',
    },
  });
});

// Apply rate limiter to general API routes
app.use('/api', generalLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend storefront whenever built
const clientDist = path.join(__dirname, '../client/dist');
const fs = require('fs');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
