require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.error("Sem chave no .env");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Nota: A biblioteca v0.21.0 pode ter mudado a forma de listar, 
    // mas vamos tentar pelo fetch direto para ser infalível.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Modelos que você pode usar:");
      data.models.forEach(m => console.log("- " + m.name.replace('models/', '')));
    } else {
      console.log("Resposta da Google:", data);
    }
  } catch (e) {
    console.error("Erro ao listar:", e.message);
  }
}

listModels();
