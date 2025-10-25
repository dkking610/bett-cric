
import { GoogleGenAI, Type } from "@google/genai";
import { Promotion } from '../types';

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable not set');
  }
  return apiKey;
};

export const generatePersonalizedPromotion = async (bettingHistory: string): Promise<Promotion | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = `
      Based on the following user betting history, generate a single personalized promotion.
      The user's history is: "${bettingHistory}".
      
      Analyze the user's preferences (favorite sports, teams, bet types) and generate a compelling, relevant, and personalized promotion.
      The promotion must be one of the following types: 'Free Bet', 'Odds Boost', or 'Cashback'.
      Ensure the description is exciting and mentions why this offer is tailored for them.
      The promo code should be catchy and related to the user's preferences.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            offer_type: {
              type: Type.STRING,
              description: "The type of offer (e.g., 'Free Bet', 'Odds Boost', 'Cashback')."
            },
            bonus_amount: {
              type: Type.NUMBER,
              description: "The value of the bonus. For Odds Boost, this is the percentage boost. For others, it's a dollar amount."
            },
            promo_code: {
              type: Type.STRING,
              description: "A short, catchy promotional code."
            },
            description: {
              type: Type.STRING,
              description: "A compelling, personalized description of the promotion for the user."
            }
          },
          required: ["offer_type", "bonus_amount", "promo_code", "description"]
        },
      },
    });

    const jsonText = response.text.trim();
    const promotionData = JSON.parse(jsonText);
    
    return promotionData as Promotion;

  } catch (error) {
    console.error("Error generating promotion:", error);
    return null;
  }
};
