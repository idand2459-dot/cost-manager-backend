const express = require('express');
const router = express.Router();
const costController = require('../controllers/cost.controller');

router.post('/add', costController.addCost);
router.get('/report', costController.getReport);

module.exports = router;
