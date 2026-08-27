import express from 'express';
import { handleAiSupportChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/ai-chat', handleAiSupportChat);

export default router;