import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(); // Automatically uses process.env.GEMINI_API_KEY

export const handleAiSupportChat = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction: `You are Ma'ad Support, an intelligent, friendly customer service AI assistant for "Ma'ad", a restaurant and food delivery platform based in Adama, Ethiopia. 
        You help customers with:
        - Traditional Ethiopian food items (like Doro Wot, Kitfo, Tibs, Shiro Wot, and coffee ceremonies) and prices in ETB.
        - Order tracking, delivery times, and delivery fees (50 ETB).
        - Payment issues including Chapa checkout integration.
        Keep your answers concise, helpful, and polite.`,
        temperature: 0.7,
      },
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
};