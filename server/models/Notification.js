const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  channel: {
    type: String,
    enum: ['SMS', 'EMAIL'],
    default: 'SMS',
  },
  recipient: {
    type: String, // phone number or email address
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['QUEUED', 'SENT', 'FAILED'],
    default: 'QUEUED',
  },
  provider: {
    type: String, // 'twilio', 'msg91', 'console', 'nodemailer'
    default: 'console',
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
