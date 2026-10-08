const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { ORDER_STATUS, PAYMENT_STATUS, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } = require('../config/constants');
const { createRazorpayOrder } = require('../services/paymentService');

// Generate unique sequential boutique order number
const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const dateStr = new Date().toISOString().slice(2, 4); // '26'
  return `AF${dateStr}${1000 + count + 1}`;
};

// @desc    Create new order (status: PENDING_PAYMENT)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { addressId, items: requestItems, buyNowItem } = req.body;

    // 1. Mandatory address verification
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'A valid delivery address is mandatory before proceeding to payment.',
      });
    }

    const user = await User.findById(req.user._id);
    const selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
      return res.status(400).json({
        success: false,
        message: 'Selected delivery address not found in your profile.',
      });
    }

    // 2. Determine items (either Buy Now single item or Cart items)
    let rawItems = [];
    if (buyNowItem && buyNowItem.productId) {
      rawItems = [
        {
          productId: buyNowItem.productId,
          size: buyNowItem.size,
          color: buyNowItem.color,
          qty: buyNowItem.qty || 1,
        },
      ];
    } else {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your boutique bag is empty. Please add items before placing an order.',
        });
      }
      rawItems = cart.items.map((item) => ({
        productId: item.product,
        size: item.size,
        color: item.color,
        qty: item.qty,
      }));
    }

    // 3. Recompute prices from DB products & verify stock
    const orderItems = [];
    let subtotal = 0;
    let totalMrp = 0;

    for (const item of rawItems) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `One of the products (${product?.name || 'Item'}) is no longer available.`,
        });
      }

      const sizeConfig = product.sizes.find((s) => s.size === item.size);
      if (!sizeConfig || sizeConfig.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}" in size ${item.size}. Only ${sizeConfig ? sizeConfig.stock : 0} available.`,
        });
      }

      const itemPrice = product.price;
      const itemMrp = product.mrp || product.price;

      subtotal += itemPrice * item.qty;
      totalMrp += itemMrp * item.qty;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: (product.images && product.images[0]) || '',
        size: item.size,
        color: item.color || (product.colors && product.colors[0]) || '',
        qty: item.qty,
        price: itemPrice,
        mrp: itemMrp,
      });
    }

    const discount = Math.max(0, totalMrp - subtotal);
    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;

    const orderNumber = await generateOrderNumber();

    // 4. Create Razorpay order
    const rzpOrder = await createRazorpayOrder({
      amountInRupees: total,
      receipt: orderNumber,
      notes: { orderNumber, userId: req.user._id.toString() },
    });

    // 5. Persist Order in DB
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      address: {
        name: selectedAddress.name,
        mobile: selectedAddress.mobile,
        pincode: selectedAddress.pincode,
        house: selectedAddress.house,
        area: selectedAddress.area,
        city: selectedAddress.city,
        state: selectedAddress.state,
        landmark: selectedAddress.landmark,
        addressType: selectedAddress.addressType,
      },
      amounts: {
        subtotal,
        discount,
        delivery,
        total,
      },
      payment: {
        method: 'RAZORPAY',
        razorpayOrderId: rzpOrder.id,
        status: PAYMENT_STATUS.PENDING,
      },
      status: ORDER_STATUS.PENDING_PAYMENT,
      timeline: [
        {
          status: ORDER_STATUS.PENDING_PAYMENT,
          comment: 'Order placed, awaiting online payment confirmation.',
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Order initiated.',
      order,
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

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('user', 'name email mobile');
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('user', 'name email mobile');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Ensure customer can only view their own order unless admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if ([ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been shipped and cannot be cancelled.',
      });
    }

    // Restore stock if it was previously paid
    if (order.status === ORDER_STATUS.PAID || order.status === ORDER_STATUS.PROCESSING) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock': item.qty } }
        );
      }
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.timeline.push({
      status: ORDER_STATUS.CANCELLED,
      comment: `Order cancelled by ${req.user.role === 'admin' ? 'Boutique Admin' : 'Customer'}.`,
    });
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order has been cancelled.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
