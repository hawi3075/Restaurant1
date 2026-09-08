const express = require('express');
const { handleAiSupportChat } = require('../controllers/chatController');

const router = express.Router();

router.post('/ai-chat', handleAiSupportChat);

module.exports = router;