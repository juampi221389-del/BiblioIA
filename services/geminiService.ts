import { GoogleGenAI, Type } from "@google/genai";
import { Book, BookAnalysis } from "../types";

// Initialize Gemini
// NOTE: In a real production app, ensure strict backend proxying or secure env handling.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = "gemini-3-flash-preview";
const CHAT_MODEL = "gemini-3-flash-preview";

export const analyzeBook = async (title: string, author: string): Promise<BookAnalysis & { genre: string }> => {
  try {
    const prompt = `Analiza el libro "${title}" de ${author}. Proporciona un resumen conciso, temas principales, personajes clave, estilo literario y un género principal.`;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Un resumen de 2-3 frases que capte la esencia." },
            themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 temas centrales." },
            mainCharacters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Nombres de 3-4 personajes principales." },
            literaryStyle: { type: Type.STRING, description: "Descripción breve del estilo de escritura (ej. Gótico, Minimalista)." },
            moodColor: { type: Type.STRING, description: "Un código hexadecimal de color que represente la 'atmósfera' del libro." },
            genre: { type: Type.STRING, description: "El género literario principal." }
          },
          required: ["summary", "themes", "mainCharacters", "literaryStyle", "moodColor", "genre"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No se recibió respuesta de la IA.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing book:", error);
    // Return fallback data on error to prevent app crash
    return {
      summary: "No se pudo generar el análisis en este momento.",
      themes: ["Desconocido"],
      mainCharacters: [],
      literaryStyle: "N/A",
      moodColor: "#cbd5e0",
      genre: "General"
    };
  }
};

export const getBookRecommendations = async (books: Book[]): Promise<string[]> => {
  if (books.length === 0) return [];

  const bookList = books.map(b => `"${b.title}" (${b.status})`).join(", ");
  const prompt = `Basado en esta lista de libros de un usuario: ${bookList}. Recomienda 3 libros nuevos que le podrían gustar. Solo devuelve los títulos y autores en formato JSON.`;

  try {
    const response = await ai.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recommendations: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    const data = JSON.parse(response.text || "{}");
    return data.recommendations || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const chatWithBook = async (book: Book, history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
        const chat = ai.chats.create({
            model: CHAT_MODEL,
            history: history,
            config: {
                systemInstruction: `Eres un experto literario con un conocimiento enciclopédico sobre el libro "${book.title}" de ${book.author}". 
                Responde a las preguntas del usuario sobre la trama, el significado, el simbolismo o los personajes. 
                Sé perspicaz, pero evita spoilers mayores a menos que se te pregunte explícitamente. 
                Mantén un tono útil y académico pero accesible.`
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat error", error);
        return "Lo siento, tuve problemas para conectar con el conocimiento del libro.";
    }
}