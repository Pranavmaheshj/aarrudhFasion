const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env, then fallback to root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

// Connect to Database and ensure catalog is ready
connectDB().then(async () => {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const productCount = await Product.countDocuments();
    const customer = await User.findOne({ email: 'customer@aarrudhfashion.com' });

    if (productCount === 0 || !customer) {
      console.log('🌱 Catalog or demo users missing in connected database. Auto-seeding now...');
      const seedDatabase = require('./seed/seed');
      await seedDatabase();
      console.log('✅ Catalog auto-seed complete.');
    }
  } catch (err) {
    console.warn('[Auto-seed Note]', err.message);
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==========================================================`);
  console.log(`🌸 Aarrudh Fashion Boutique Server running on port ${PORT}`);
  console.log(`👑 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛍️  API URL: http://localhost:${PORT}/api`);
  console.log(`==========================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
  // Keep server running or gracefully shut down if fatal
});
