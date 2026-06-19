import { GoogleGenAI } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompt";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generatePdfSummaryFromGemini = async (
  pdfText: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
${SUMMARY_SYSTEM_PROMPT}

Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:

${pdfText}
      `,

      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};