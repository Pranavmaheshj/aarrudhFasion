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
const {
	getAllCollections,
	createCollection,
	updateCollection,
	deleteCollection,
} = require('../controllers/collectionController');
const {
	createProduct,
	updateProduct,
	deleteProduct,
} = require('../controllers/productController');
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

// Collections management
router.get('/collections', getAllCollections);
router.post('/collections', createCollection);
router.put('/collections/:id', updateCollection);
router.delete('/collections/:id', deleteCollection);

// Products management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
