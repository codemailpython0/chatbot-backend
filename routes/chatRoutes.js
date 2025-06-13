const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to protect routes if needed
// router.use(authMiddleware);

router.route('/')
  .get(chatController.getChatMessages)
  .post(chatController.postChatMessage);

module.exports = router;