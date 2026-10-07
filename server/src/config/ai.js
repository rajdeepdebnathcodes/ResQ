const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./env');

let genAI = null;
let generativeModel = null;
let isGeminiActive = false;

if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim() !== '' && config.GEMINI_API_KEY !== 'your_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY.trim());
    generativeModel = genAI.getGenerativeModel({ model: config.GEMINI_MODEL });
    isGeminiActive = true;
    console.log(`[AI Engine] Google Gemini API initialized with model "${config.GEMINI_MODEL}"`);
  } catch (err) {
    console.warn(`[AI Engine Warning] Failed to initialize Google Gemini client: ${err.message}. Using Intelligent Fallback Mode.`);
    isGeminiActive = false;
  }
} else {
  console.log(`[AI Engine] No GEMINI_API_KEY detected in environment. Intelligent Fallback AI Mode is ACTIVE.`);
}

module.exports = {
  genAI,
  generativeModel,
  isGeminiActive: () => isGeminiActive,
  modelName: config.GEMINI_MODEL
};
