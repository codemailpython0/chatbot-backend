const fetch = require('node-fetch');

const COHERE_API_KEY = process.env.COHERE_API_KEY;

async function getAIResponse(prompt) {
  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r-plus",
        message: prompt,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.text) {
      return data.text;
    } else {
      console.error("Cohere response error:", data);
      throw new Error("AI response failed");
    }
  } catch (error) {
    console.error("Cohere API Error:", error);
    throw new Error("AI response failed");
  }
}

module.exports = { getAIResponse };
