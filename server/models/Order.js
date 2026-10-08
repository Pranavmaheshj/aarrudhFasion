const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  size: { type: String, required: true },
  color: { type: String, default: '' },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Captured selling price at time of order
  mrp: { type: Number, required: true },
}, { _id: false });

const AddressSnapshotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  pincode: { type: String, required: true },
  house: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String, default: '' },
  addressType: { type: String, default: 'Home' },
}, { _id: false });

const ShipmentSchema = new mongoose.Schema({
  courier: { type: String, default: '' }, // e.g. BlueDart, Delhivery, DTDC
  agentName: { type: String, default: '' },
  agentPhone: { type: String, default: '' },
  trackingId: { type: String, default: '' },
  trackingUrl: { type: String, default: '' },
  expectedDelivery: { type: Date },
  shippedAt: { type: Date },
}, { _id: false });

const OrderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [OrderItemSchema],
  address: {
    type: AddressSnapshotSchema,
    required: true,
  },
  amounts: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  payment: {
    method: { type: String, default: 'RAZORPAY' }, // RAZORPAY / CARD / UPI / COD
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paidAt: { type: Date },
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING_PAYMENT,
  },
  shipment: {
    type: ShipmentSchema,
    default: () => ({}),
  },
  timeline: [OrderTimelineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
