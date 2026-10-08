const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../services/paymentService');
const { sendOrderConfirmationSMS } = require('../services/smsService');

// @desc    Initiate or recreate Razorpay payment for an order
// @route   POST /api/payments/create
// @access  Private
const initiatePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === ORDER_STATUS.PAID || order.payment.status === PAYMENT_STATUS.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    const rzpOrder = await createRazorpayOrder({
      amountInRupees: order.amounts.total,
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber, userId: order.user.toString() },
    });

    order.payment.razorpayOrderId = rzpOrder.id;
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpay: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: rzpOrder.key,
        isMock: rzpOrder.isMock,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and finalize order
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Idempotency: If already paid, return existing success state
    if (order.status === ORDER_STATUS.PAID || order.status === ORDER_STATUS.PROCESSING) {
      return res.status(200).json({
        success: true,
        message: 'Order was already verified and marked paid.',
        order,
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId: razorpayOrderId || order.payment.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      order.payment.status = PAYMENT_STATUS.FAILED;
      order.timeline.push({
        status: ORDER_STATUS.PENDING_PAYMENT,
        comment: 'Online payment verification failed: Invalid signature.',
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please try again.',
      });
    }

    // Mark Order as Paid and Processing
    order.payment.status = PAYMENT_STATUS.COMPLETED;
    order.payment.razorpayOrderId = razorpayOrderId || order.payment.razorpayOrderId;
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();
    order.status = ORDER_STATUS.PROCESSING; // Ready for admin fulfillment

    order.timeline.push(
      {
        status: ORDER_STATUS.PAID,
        comment: `Payment received successfully via Razorpay (Txn ID: ${razorpayPaymentId}).`,
      },
      {
        status: ORDER_STATUS.PROCESSING,
        comment: 'Order is being carefully packed at Aarrudh Fashion boutique.',
      }
    );

    // 1. Deduct product inventory
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'sizes.size': item.size },
        { $inc: { 'sizes.$.stock': -item.qty } }
      );
    }

    // 2. Clear customer cart
    await Cart.findOneAndUpdate({ user: order.user._id }, { items: [] });

    await order.save();

    // 3. Trigger confirmation SMS & Notification
    try {
      await sendOrderConfirmationSMS({ user: order.user, order });
    } catch (smsErr) {
      console.error('[SMS Order Confirm Error]', smsErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your order is now being processed.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.warn('[Webhook Warning] Invalid signature received on Razorpay webhook');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = body.event;
    console.log(`[Razorpay Webhook Event] ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId }).populate('user');
      if (order && order.status === ORDER_STATUS.PENDING_PAYMENT) {
        order.payment.status = PAYMENT_STATUS.COMPLETED;
        order.payment.razorpayPaymentId = razorpayPaymentId;
        order.payment.paidAt = new Date();
        order.status = ORDER_STATUS.PROCESSING;

        order.timeline.push(
          {
            status: ORDER_STATUS.PAID,
            comment: `Payment captured via webhook (Txn ID: ${razorpayPaymentId}).`,
          },
          {
            status: ORDER_STATUS.PROCESSING,
            comment: 'Order is being processed for dispatch.',
          }
        );

        // Deduct inventory
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock': -item.qty } }
          );
        }

        // Clear cart
        await Cart.findOneAndUpdate({ user: order.user._id }, { items: [] });

        await order.save();

        await sendOrderConfirmationSMS({ user: order.user, order });
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.status === ORDER_STATUS.PENDING_PAYMENT) {
        order.payment.status = PAYMENT_STATUS.FAILED;
        order.timeline.push({
          status: ORDER_STATUS.PENDING_PAYMENT,
          comment: `Payment failed: ${paymentEntity.error_description || 'Transaction declined'}`,
        });
        await order.save();
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook Error]', error);
    return res.status(500).json({ status: 'error' });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  handleWebhook,
};
