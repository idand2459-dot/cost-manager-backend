const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');

router.get('/logs', logController.getAllLogs);

module.exports = router;
