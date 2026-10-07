const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Status of AI engine (Gemini vs Fallback)
router.get('/status', aiController.getStatus);

// Safety Guidance Chatbot
router.post('/chat', aiController.chat);

// Interactive text analysis (Viva / Demo testing)
router.post('/analyze', aiController.analyzeText);

module.exports = router;
