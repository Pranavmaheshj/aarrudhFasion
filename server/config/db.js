const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ [Database Warning] MONGO_URI is NOT set in environment variables!');
    console.error('👉 Add MONGO_URI in your Render Dashboard under the "Environment" tab.');
  }

  try {
    const conn = await mongoose.connect(
      uri || 'mongodb://127.0.0.1:27017/aarrudh_fashion',
      {
        serverSelectionTimeoutMS: 10000,
      }
    );
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.log('[Database] Retrying MongoDB Atlas connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
