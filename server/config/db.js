const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ [Database Warning] MONGO_URI is NOT set in environment variables!');
    console.error('👉 Add MONGO_URI in your Render Dashboard under the "Environment" tab.');
  } else {
    // If URI is missing database name before query string (e.g. .mongodb.net/?), normalize to /aarrudh_fashion
    if (uri.includes('.mongodb.net/?')) {
      uri = uri.replace('.mongodb.net/?', '.mongodb.net/aarrudh_fashion?');
    }
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
