const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env, then fallback to root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
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
