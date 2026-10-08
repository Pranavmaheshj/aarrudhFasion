const dotenv = require('dotenv');
// Load environment variables before initializing DB & App
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
