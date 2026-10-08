const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Customer protected routes (guests can only see the landing page)
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

module.exports = router;
