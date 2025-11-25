import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in your environment

const ai = new GoogleGenAI({ apiKey });

export const generateAnnouncement = async (
  topic: string,
  tone: string,
  details: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an AI assistant for a club executive using the "TitiMe" finance app.
      Please write a club announcement/message.
      
      Topic: ${topic}
      Tone: ${tone}
      Details: ${details}
      
      Keep it professional yet engaging. Format it for a group chat or email.
      Do not include placeholders like [Your Name], just sign off as "The Executive Team".
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I couldn't generate the message. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to the AI service right now. Please ensure your API key is valid.";
  }
};

export const analyzeFinancialHealth = async (
  revenue: number,
  pending: number,
  memberCount: number
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a financial advisor for a small society.
      Analyze the following data and give 3 brief bullet points of advice.
      
      Total Revenue: GHS ${revenue}
      Pending Dues: GHS ${pending}
      Total Members: ${memberCount}
      
      Focus on cash flow and member retention.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to perform analysis at this time.";
  }
};