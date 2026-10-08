const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const { addressRules, validate } = require('../utils/validators');

router.use(protect);

router.get('/', getAddresses);
router.post('/', addressRules, validate, addAddress);
router.put('/:id', addressRules, validate, updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

module.exports = router;
