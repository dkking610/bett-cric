import { GoogleGenAI } from "@google/genai";
import type { GenerateContentRequest } from "@google/genai";

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable not set');
  }
  return apiKey;
};

// Simple schema validator (simulating a library like AJV)
const validateResponse = (data: any, schema: any): boolean => {
    if (typeof data !== 'object' || data === null) return false;
    const requiredKeys = schema.required || [];
    for (const key of requiredKeys) {
        if (!(key in data)) {
            console.error(`Validation Error: Missing required key '${key}' in response`, data);
            return false;
        }
    }
    return true;
};


export const callGemini = async <T>(
    model: string,
    contents: GenerateContentRequest['contents'],
    responseSchema: GenerateContentRequest['config']['responseSchema'],
): Promise<T | null> => {
    console.log('%c--- AI PROMPT AUDIT ---', 'color: #888;');
    console.log(`Model: ${model}`);
    console.log(`Contents:`, contents);
    
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        console.log('%c--- AI RESPONSE AUDIT ---', 'color: #888;');
        console.log(jsonText);
        
        const responseData = JSON.parse(jsonText);
        
        if (!validateResponse(responseData, responseSchema)) {
            throw new Error("AI response failed schema validation.");
        }
        
        return responseData as T;
        
    } catch (error) {
        console.error("Error in callGemini wrapper:", error);
        return null;
    }
};