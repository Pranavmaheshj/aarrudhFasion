const express = require('express');
const {
	getDashboardStats,
	getAllOrders,
	updateOrderStatus,
	assignShipment,
	getCustomers,
	getNotifications,
	getAuditLogs,
	uploadImages,
} = require('../controllers/adminController');
const { updateLandingContent } = require('../controllers/landingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/shipment', assignShipment);
router.get('/customers', getCustomers);
router.get('/notifications', getNotifications);
router.get('/audit-logs', getAuditLogs);
router.post('/upload', upload.any(), uploadImages);
router.put('/landing', updateLandingContent);

module.exports = router;
