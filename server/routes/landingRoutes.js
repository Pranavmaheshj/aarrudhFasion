const express = require('express');
const router = express.Router();
const { getLandingContent } = require('../controllers/landingController');

// Public route to fetch landing page content
router.get('/', getLandingContent);

module.exports = router;
