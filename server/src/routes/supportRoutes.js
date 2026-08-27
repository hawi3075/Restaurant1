const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { saveMessage, getMessages } = require('../controllers/supportController');

router.get('/', verifyToken, getMessages);
router.post('/', verifyToken, saveMessage);

module.exports = router;
