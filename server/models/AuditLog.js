const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String, // 'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'UPDATE_LANDING', 'ASSIGN_SHIPMENT', etc.
    required: true,
  },
  entity: {
    type: String, // 'Product', 'Collection', 'LandingContent', 'Order', etc.
    required: true,
  },
  entityId: {
    type: String,
    default: '',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
