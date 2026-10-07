const aiService = require('../services/aiService');
const { isGeminiActive, modelName } = require('../config/ai');

/**
 * Get AI Engine Status
 * GET /api/ai/status
 */
async function getStatus(req, res) {
  const active = isGeminiActive();
  return res.status(200).json({
    success: true,
    mode: active ? 'gemini' : 'fallback',
    model: active ? modelName : 'Intelligent Rule-Based & Knowledge Base Engine',
    description: active
      ? `Online: Google Gemini API (${modelName}) connected and active.`
      : 'Active: Intelligent Fallback Mode is operational. Fully functional without external API key.'
  });
}

/**
 * Safety Guidance Chatbot endpoint
 * POST /api/ai/chat
 */
async function chat(req, res, next) {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question or emergency scenario.'
      });
    }

    const response = await aiService.answerSafetyChat(message.trim(), conversationHistory);

    return res.status(200).json({
      success: true,
      reply: response.reply,
      source: response.source
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Test AI Analysis on any incident text (Viva / Interactive Test)
 * POST /api/ai/analyze
 */
async function analyzeText(req, res, next) {
  try {
    const { description, location = '', disasterType = '' } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an incident description to analyze.'
      });
    }

    const result = await aiService.analyzeEmergencyReport({
      description: description.trim(),
      location: location.trim(),
      userDisasterType: disasterType
    });

    return res.status(200).json({
      success: true,
      analysis: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStatus,
  chat,
  analyzeText
};
