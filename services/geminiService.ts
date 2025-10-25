

import { GoogleGenAI, Type } from "@google/genai";
import { Promotion, Event, AIOdds, LiveUpdate, UserProfile, Account, AIBettCoachResponse } from '../types';

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

export const generateOddsAnalysis = async (event: Event): Promise<AIOdds | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = `
You are a professional sports odds analyst. Always respond **only** with JSON that strictly follows the schema below. Do not output any extra text, code fences, or explanations. Use short, conservative reasoning in the "rationale_short" field (<=120 chars). Use deterministic logic and do not hallucinate external data. If any numeric field cannot be estimated from inputs, return null for that field and set "notes" explaining why.

Generate suggested market odds for this event.

Match: ${event.teamA} vs ${event.teamB}
Competition: ${event.competition}
Start (ISO8601): ${new Date().toISOString()}
Venue: ${event.venue}
Inputs:
- home_form_last5: "${event.form}"
- away_form_last5: "${event.form}"
- head_to_head: "${event.h2h}"
- home_advantage_factor: 0.6
- key_injuries: "${event.keyInjuries.join(', ') || 'none'}"
- pitch_character: "${event.pitchCharacter}"
- weather_note: "${event.weather}"
Constraints:
- Output must be JSON matching schema below.
- Use decimal odds rounded to 3 decimals.
- Implied probability = 100 / decimal_odds rounded to 2 decimals.
- Ensure total implied probability >=100% and compute book_margin_percent accordingly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            home: {
              type: Type.OBJECT,
              properties: {
                odds: { type: Type.NUMBER, nullable: true },
                implied_prob: { type: Type.NUMBER, nullable: true },
              },
            },
            draw: {
              type: Type.OBJECT,
              properties: {
                odds: { type: Type.NUMBER, nullable: true },
                implied_prob: { type: Type.NUMBER, nullable: true },
              },
            },
            away: {
              type: Type.OBJECT,
              properties: {
                odds: { type: Type.NUMBER, nullable: true },
                implied_prob: { type: Type.NUMBER, nullable: true },
              },
            },
            book_margin_percent: { type: Type.NUMBER },
            rationale_short: { type: Type.STRING },
            notes: { type: Type.STRING, nullable: true },
          },
          required: ["home", "draw", "away", "book_margin_percent", "rationale_short", "notes"],
        },
      },
    });

    const jsonText = response.text.trim();
    const oddsData = JSON.parse(jsonText);
    
    return oddsData as AIOdds;

  } catch (error) {
    console.error("Error generating odds analysis:", error);
    return null;
  }
};

export interface LiveCommentary {
  micro_summary: string;
  notification: string;
}

export const generateLiveCommentary = async (update: LiveUpdate): Promise<LiveCommentary | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `
You are a concise sports micro-copy writer. For each raw event input, return **only** valid JSON with two fields: "micro_summary" (<=30 words) and "notification" (<=80 characters). Do not include any other keys or commentary. Keep language vivid and suitable for push notifications. If the event is ambiguous, return neutral micro text and set "notification" to "Update".

Raw event text: "${update.raw_event_text}"
Context:
- inning: "${update.inning}"
- over: "${update.over}"
- score: "${update.score}"
- wickets: ${update.wickets}
- current_run_rate: ${update.current_run_rate}
Return exactly:
{
  "micro_summary": string,
  "notification": string
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            micro_summary: { type: Type.STRING },
            notification: { type: Type.STRING },
          },
          required: ["micro_summary", "notification"],
        },
      },
    });

    const jsonText = response.text.trim();
    const commentaryData = JSON.parse(jsonText);
    
    return commentaryData as LiveCommentary;

  } catch (error) {
    console.error("Error generating live commentary:", error);
    return null;
  }
};

export const generateBettingAdvice = async (
  user_question: string,
  user_profile: UserProfile,
  account: Account,
  context_summary: string
): Promise<AIBettCoachResponse | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const prompt = `
You are "BettCoach", a helpful, conservative betting assistant that can reply in Thanglish when requested. Always return **only** JSON matching the schema. If the user's risk_profile is missing, assume "medium". When giving stake advice use conservative guidance: express stake as percent of balance and justify in <=2 short sentences. Do not encourage problem gambling. Include a confidence field (low|medium|high).

User question: "${user_question}"
User profile:
- user_id: "${user_profile.user_id}"
- risk_profile: "${user_profile.risk_profile}"
- preferred_language: "${user_profile.preferred_language}"
Account:
- balance: ${account.balance}
Context (optional): ${context_summary}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            recommended_stake: {
              type: Type.OBJECT,
              properties: {
                percent: { type: Type.NUMBER },
                currency: { type: Type.STRING },
              }
            },
            rationale_short: { type: Type.STRING },
            confidence: { type: Type.STRING },
          },
          required: ["reply", "recommended_stake", "rationale_short", "confidence"],
        },
      },
    });

    const jsonText = response.text.trim();
    const adviceData = JSON.parse(jsonText);

    return adviceData as AIBettCoachResponse;

  } catch (error) {
    console.error("Error generating betting advice:", error);
    return null;
  }
};