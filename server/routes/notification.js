const express = require('express');
const {createNotification, userNotifications} = require('../controllers/notifications');

const router = express.Router()

router.post('/', createNotification);
router.get('/:id', userNotifications);

module.exports = router;