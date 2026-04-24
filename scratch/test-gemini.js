require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("--- Testando Chave Gemini ---");
  
  if (!apiKey) {
    console.error("ERRO: GEMINI_API_KEY não encontrada no arquivo .env");
    return;
  }

  console.log("Chave encontrada. Tentando conexão...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const result = await model.generateContent("Diga 'Olá, Arkos!' se você estiver funcionando.");
    const response = await result.response;
    const text = response.text();
    
    console.log("RESPOSTA DA IA:", text);
    console.log("✅ SUCESSO: Sua API Key está funcionando perfeitamente!");
  } catch (error) {
    console.error("❌ FALHA NA API:", error.message);
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("DICA: Sua chave de API parece ser inválida. Verifique no Google AI Studio.");
    }
  }
}

testGemini();
