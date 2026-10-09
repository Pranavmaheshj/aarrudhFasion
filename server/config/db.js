const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aarrudh_fashion'
    );
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.log('[Database] Retrying MongoDB Atlas connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
