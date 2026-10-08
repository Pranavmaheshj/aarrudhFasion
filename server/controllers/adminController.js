const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');
const { sendShipmentSMS, sendDeliveredSMS } = require('../services/smsService');
const { sendShipmentEmail } = require('../services/emailService');
const { uploadImage } = require('../services/uploadService');
const { logAdminAction } = require('../utils/auditLogger');

// @desc    Admin Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      ordersToday,
      totalCustomers,
      paidOrders,
      pendingShipments,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'customer' }),
      Order.find({ 'payment.status': PAYMENT_STATUS.COMPLETED }),
      Order.countDocuments({ status: { $in: [ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING] } }),
      Product.find({ 'sizes.stock': { $lte: 3 }, isActive: true }).select('name sizes images price'),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email mobile'),
    ]);

    const totalSales = paidOrders.reduce((sum, o) => sum + (o.amounts.total || 0), 0);
    const todaySales = paidOrders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + (o.amounts.total || 0), 0);

    // Group last 7 days sales for chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayOrders = paidOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= d && orderDate < nextD;
      });

      const dayTotal = dayOrders.reduce((s, o) => s + (o.amounts.total || 0), 0);
      last7Days.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: dayTotal,
        orders: dayOrders.length,
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders,
        ordersToday,
        totalCustomers,
        pendingShipments,
      },
      lowStockProducts,
      salesChart: last7Days,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders with filtering and search
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { 'address.name': regex },
        { 'address.mobile': regex },
        { 'address.city': regex },
        { 'shipment.trackingId': regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const order = await Order.findById(id).populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.status;
    order.status = status;
    order.timeline.push({
      status,
      comment: comment || `Order status updated to ${status} by admin.`,
    });

    if (status === ORDER_STATUS.DELIVERED) {
      try {
        await sendDeliveredSMS({ user: order.user, order });
      } catch (smsErr) {
        console.error('[Delivered SMS Error]', smsErr.message);
      }
    }

    await order.save();

    await logAdminAction({
      adminUser: req.user,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: order._id,
      details: { previousStatus, newStatus: status, comment },
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Assign courier & agent details (Triggers Shipment SMS + Email)
// @route   PUT /api/admin/orders/:id/shipment
// @access  Private/Admin
const assignShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courier, agentName, agentPhone, trackingId, trackingUrl, expectedDelivery } = req.body;

    if (!courier || !trackingId) {
      return res.status(400).json({
        success: false,
        message: 'Courier partner name and Tracking ID are mandatory for shipment assignment.',
      });
    }

    const order = await Order.findById(id).populate('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Set shipment details
    order.shipment = {
      courier,
      agentName: agentName || 'Assigned Courier Agent',
      agentPhone: agentPhone || '',
      trackingId,
      trackingUrl: trackingUrl || '',
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
      shippedAt: new Date(),
    };

    // Update status to SHIPPED
    order.status = ORDER_STATUS.SHIPPED;
    order.timeline.push({
      status: ORDER_STATUS.SHIPPED,
      comment: `Dispatched via ${courier} (Tracking: ${trackingId}). Agent: ${agentName || 'N/A'}.`,
    });

    await order.save();

    // Trigger SMS to customer mobile
    let smsResult = null;
    try {
      smsResult = await sendShipmentSMS({
        user: order.user,
        order,
        shipment: order.shipment,
      });
    } catch (smsError) {
      console.error('[Shipment SMS Error]', smsError.message);
    }

    // Send shipment email copy
    try {
      await sendShipmentEmail({
        user: order.user,
        order,
        shipment: order.shipment,
      });
    } catch (emailError) {
      console.error('[Shipment Email Error]', emailError.message);
    }

    await logAdminAction({
      adminUser: req.user,
      action: 'ASSIGN_SHIPMENT',
      entity: 'Order',
      entityId: order._id,
      details: {
        orderNumber: order.orderNumber,
        shipment: order.shipment,
        smsResult,
      },
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Shipment assigned and SMS notification dispatched to ${order.address.mobile}.`,
      order,
      smsDispatched: Boolean(smsResult?.success),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all customers with spending summary
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email mobile createdAt addresses')
      .sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({ user: c._id });
        const totalSpent = orders
          .filter((o) => o.payment.status === PAYMENT_STATUS.COMPLETED)
          .reduce((sum, o) => sum + (o.amounts.total || 0), 0);

        return {
          ...c.toObject(),
          orderCount: orders.length,
          totalSpent,
        };
      })
    );

    return res.status(200).json({
      success: true,
      customers: customersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get Notifications & SMS delivery audit
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('user', 'name mobile email')
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Upload product / collection image
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      if (req.file) {
        // Single file
        const url = await uploadImage(req.file.path);
        return res.status(200).json({
          success: true,
          url,
          urls: [url],
        });
      }
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
    }

    const urls = await Promise.all(req.files.map((file) => uploadImage(file.path)));

    return res.status(200).json({
      success: true,
      urls,
      url: urls[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  assignShipment,
  getCustomers,
  getNotifications,
  getAuditLogs,
  uploadImages,
};
