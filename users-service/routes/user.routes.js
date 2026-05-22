// users-service/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Route for adding a new user into the system
router.post('/add', userController.createUser);

// Route for fetching the global list of registered users
router.get('/users', userController.getAllUsers);

// Route for obtaining specific user details combined with total costs
router.get('/users/:id', userController.getUserById);

module.exports = router;