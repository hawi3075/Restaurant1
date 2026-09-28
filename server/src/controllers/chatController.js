const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleAiSupportChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('AI Chat Error: GEMINI_API_KEY is not set');
      return res.status(500).json({
        error: 'Failed to generate AI response.',
        details: 'AI service is not configured.',
      });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are Ma'ad Support, an intelligent, friendly customer service AI assistant for "Ma'ad", a restaurant and food delivery platform based in Adama, Ethiopia. 
      You help customers with:
      - Traditional Ethiopian food items (like Doro Wot, Kitfo, Tibs, Shiro Wot, and coffee ceremonies) and prices in ETB.
      - Order tracking, delivery times, and delivery fees (50 ETB).
      - Payment issues including Chapa checkout integration.
      Keep your answers concise, helpful, and polite. Respond in a friendly, conversational tone.`,
    });

    // Generate content
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    console.error('AI Chat Error details:', error);
    res.status(500).json({
      error: 'Failed to generate AI response.',
      details: error.message,
    });
  }
};

module.exports = { handleAiSupportChat };