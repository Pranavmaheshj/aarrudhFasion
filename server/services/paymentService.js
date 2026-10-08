const Razorpay = require('razorpay');
const crypto = require('crypto');

const isRazorpayConfigured = () => {
  return (
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET) &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key'
  );
};

let razorpayInstance = null;
if (isRazorpayConfigured()) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create order on Razorpay (in Paise)
 */
const createRazorpayOrder = async ({ amountInRupees, receipt, notes = {} }) => {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isRazorpayConfigured() && razorpayInstance) {
    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.toString(),
        notes,
      };
      const rzpOrder = await razorpayInstance.orders.create(options);
      return {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        isMock: false,
      };
    } catch (err) {
      console.error('[Razorpay Order Error]', err);
      throw new Error(`Razorpay order creation failed: ${err.message}`);
    }
  }

  // Graceful test mock order when real Razorpay keys are not yet configured in .env
  const mockId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  return {
    id: mockId,
    amount: amountInPaise,
    currency: 'INR',
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    isMock: true,
  };
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!isRazorpayConfigured()) {
    // If running in development/mock mode, allow mock verification
    if (razorpayOrderId.startsWith('order_mock_') || razorpaySignature === 'mock_signature') {
      return true;
    }
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

/**
 * Verify Webhook signature
 */
const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(typeof webhookBody === 'string' ? webhookBody : JSON.stringify(webhookBody))
    .digest('hex');

  return expectedSignature === webhookSignature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  isRazorpayConfigured,
};
