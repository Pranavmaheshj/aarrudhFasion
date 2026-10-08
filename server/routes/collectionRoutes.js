const express = require('express');
const router = express.Router();
const { getPublicCollections } = require('../controllers/collectionController');

// Public route to fetch collections
router.get('/', getPublicCollections);

module.exports = router;
