

import { Type } from "@google/genai";
import { callGemini } from './geminiClient';
import { Promotion, Event, AIOdds, LiveUpdate, UserProfile, Account, AIBettCoachResponse, OddsSuggesterInputs, Selection, AIFraudCheckResponse, AIKycResponse, AIModerationResponse, SettlementExplainerInputs, AISettlementResponse } from '../types';

export const generatePersonalizedPromotion = async (bettingHistory: string): Promise<Promotion | null> => {
  const prompt = `
    Based on the following user betting history, generate a single personalized promotion.
    The user's history is: "${bettingHistory}".
    
    Analyze the user's preferences (favorite sports, teams, bet types) and generate a compelling, relevant, and personalized promotion.
    The promotion must be one of the following types: 'Free Bet', 'Odds Boost', or 'Cashback'.
    Ensure the description is exciting and mentions why this offer is tailored for them.
    The promo code should be catchy and related to the user's preferences.
  `;
  
  const schema = {
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
  };

  return callGemini<Promotion>("gemini-2.5-flash", {text: prompt}, schema);
};

export const generateOddsAnalysis = async (event: Event): Promise<AIOdds | null> => {
  const prompt = `
You are a professional sports odds analyst. Always respond **only** with JSON that strictly follows the schema below. Do not output any extra text, code fences, or explanations. Use short, conservative reasoning in the "rationale_short" field (<=120 chars). Use deterministic logic and do not hallucinate external data. If any numeric field cannot be estimated from inputs, return null for that field and set "notes" explaining why.

Generate suggested market odds for this event.

Match: ${event.teamA} vs ${event.teamB}
Competition: ${event.competition}
Start (ISO801): ${new Date().toISOString()}
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
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      home: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      draw: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      away: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      book_margin_percent: { type: Type.NUMBER },
      rationale_short: { type: Type.STRING },
      notes: { type: Type.STRING, nullable: true },
    },
    required: ["home", "draw", "away", "book_margin_percent", "rationale_short", "notes"],
  };

  return callGemini<AIOdds>("gemini-2.5-flash", {text: prompt}, schema);
};

export interface LiveCommentary {
  micro_summary: string;
  notification: string;
}

export const generateLiveCommentary = async (update: LiveUpdate): Promise<LiveCommentary | null> => {
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
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      micro_summary: { type: Type.STRING },
      notification: { type: Type.STRING },
    },
    required: ["micro_summary", "notification"],
  };

  return callGemini<LiveCommentary>("gemini-2.5-flash", {text: prompt}, schema);
};

export const generateBettingAdvice = async (
  user_question: string,
  user_profile: UserProfile,
  account: Account,
  context_summary: string
): Promise<AIBettCoachResponse | null> => {
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
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      reply: { type: Type.STRING },
      recommended_stake: {
        type: Type.OBJECT, properties: { percent: { type: Type.NUMBER }, currency: { type: Type.STRING },}
      },
      rationale_short: { type: Type.STRING },
      confidence: { type: Type.STRING },
    },
    required: ["reply", "recommended_stake", "rationale_short", "confidence"],
  };

  return callGemini<AIBettCoachResponse>("gemini-2.5-flash", {text: prompt}, schema);
};

export const suggestOdds = async (inputs: OddsSuggesterInputs): Promise<AIOdds | null> => {
  const prompt = `
You are a professional sports odds analyst. Always respond **only** with JSON that strictly follows the schema below. Do not output any extra text, code fences, or explanations. Use short, conservative reasoning in the "rationale_short" field (<=120 chars). Use deterministic logic and do not hallucinate external data. If any numeric field cannot be estimated from inputs, return null for that field and set "notes" explaining why.

Generate suggested market odds for this event.

Match: ${inputs.homeTeam} vs ${inputs.awayTeam}
Competition: ${inputs.competition}
Start (ISO801): ${new Date().toISOString()}
Venue: ${inputs.venue}
Inputs:
- home_form_last5: "${inputs.homeForm}"
- away_form_last5: "${inputs.awayForm}"
- head_to_head: "${inputs.h2h}"
- home_advantage_factor: ${inputs.homeAdvantage}
- key_injuries: "${inputs.keyInjuries || 'none'}"
- pitch_character: "${inputs.pitchCharacter}"
- weather_note: "${inputs.weather}"
Constraints:
- Output must be JSON matching schema below.
- Use decimal odds rounded to 3 decimals.
- Implied probability = 100 / decimal_odds rounded to 2 decimals.
- Ensure total implied probability >=100% and compute book_margin_percent accordingly.
`;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      home: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      draw: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      away: {
        type: Type.OBJECT, properties: { odds: { type: Type.NUMBER, nullable: true }, implied_prob: { type: Type.NUMBER, nullable: true },},
      },
      book_margin_percent: { type: Type.NUMBER },
      rationale_short: { type: Type.STRING },
      notes: { type: Type.STRING, nullable: true },
    },
    required: ["home", "draw", "away", "book_margin_percent", "rationale_short", "notes"],
  };

  return callGemini<AIOdds>("gemini-2.5-flash", {text: prompt}, schema);
};


export const triageBetForFraud = async (
    selections: Selection[],
    stake: number,
    userProfile: UserProfile,
    account: Account,
): Promise<AIFraudCheckResponse | null> => {
    const context = {
        selections: selections.map(s => ({ runner: s.runnerName, odds: s.odds, market: s.marketName })),
        stake: stake,
        total_odds: selections.reduce((acc, s) => acc * s.odds, 1),
        user_id: userProfile.user_id,
        user_risk_profile: userProfile.risk_profile,
        account_balance: account.balance,
        bet_as_percent_of_balance: (stake / account.balance) * 100
    };

    const prompt = `
You are an AI Fraud & Anomaly Detection agent for a sportsbook. Analyze the following bet context and user profile to identify suspicious activity. Your goal is to flag high-velocity bets, unusually large stakes relative to balance, or patterns inconsistent with the user's risk profile. Return a risk score from 0 (no risk) to 100 (high-risk), a concise rationale, and a boolean flag.

Bet Context:
${JSON.stringify(context, null, 2)}
`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            risk_score: { type: Type.NUMBER, description: "A risk score from 0 to 100." },
            rationale: { type: Type.STRING, description: "A concise rationale for the score." },
            is_flagged: { type: Type.BOOLEAN, description: "True if the bet should be flagged for review." }
        },
        required: ["risk_score", "rationale", "is_flagged"],
    };
    
    return callGemini<AIFraudCheckResponse>("gemini-2.5-flash", {text: prompt}, schema);
};


export const performKycCheck = async (base64ImageData: string, mimeType: string): Promise<AIKycResponse | null> => {
  const contents = {
    parts: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64ImageData,
        },
      },
      {
        text: `
          You are an automated KYC (Know Your Customer) verification agent. Analyze the provided image of an identity document.
          1.  Extract the person's full name and date of birth.
          2.  Identify the type of ID (e.g., "Driver's License", "Passport").
          3.  Perform a quality check on the image itself.
          Return your findings strictly in the specified JSON format.
        `,
      },
    ],
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      id_type: { type: Type.STRING, description: "Type of ID document." },
      extracted_name: { type: Type.STRING, description: "Full name as written on the ID." },
      extracted_dob: { type: Type.STRING, description: "Date of birth as written on the ID (YYYY-MM-DD)." },
      is_clear: { type: Type.BOOLEAN, description: "True if the image is sharp and not blurry." },
      has_glare: { type: Type.BOOLEAN, description: "True if there is significant glare obscuring information." },
      all_corners_visible: { type: Type.BOOLEAN, description: "True if all four corners of the document are visible." },
      quality_notes: { type: Type.STRING, description: "A brief summary of any quality issues found." },
    },
    required: ["id_type", "extracted_name", "extracted_dob", "is_clear", "has_glare", "all_corners_visible", "quality_notes"],
  };

  return callGemini<AIKycResponse>("gemini-2.5-flash", contents, schema);
};

export const moderateChatMessage = async (message: string): Promise<AIModerationResponse | null> => {
    const prompt = `
You are a content moderation AI for a sports betting community chat. Your task is to determine if a message violates our safety policy.
Categories to check for: Hate Speech, Incitement of Violence, Illegal Activities (e.g., sharing illegal streaming links), Spam, Self-Harm.
Analyze the following message and respond strictly with the JSON schema.

Message: "${message}"
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            is_approved: { type: Type.BOOLEAN, description: "True if the message is safe, false if it violates policy." },
            rejection_reason: { type: Type.STRING, nullable: true, description: "A brief, user-facing reason for rejection if applicable." },
            violation_category: { type: Type.STRING, nullable: true, description: "The specific policy category violated." }
        },
        required: ["is_approved", "rejection_reason", "violation_category"],
    };
    
    return callGemini<AIModerationResponse>("gemini-2.5-flash", {text: prompt}, schema);
};

export const generateSettlementExplanation = async (inputs: SettlementExplainerInputs): Promise<AISettlementResponse | null> => {
    const prompt = `
You are a bet settlement specialist AI. Your task is to generate a clear, human-readable explanation for a bet settlement and a corresponding structured JSON object for database auditing.

Settlement Details:
- Bet ID: ${inputs.bet_id}
- Selection: ${inputs.selection_details}
- Final Outcome: ${inputs.final_outcome}
- Settlement Status: ${inputs.settlement_status}
- Special Circumstances: ${inputs.special_circumstances || "None"}

Generate a response that includes:
1.  A concise, easy-to-understand explanation for the user.
2.  A structured JSON object for our records. The 'reason_code' should be a standardized, uppercase string (e.g., 'MATCH_RESULT', 'PLAYER_DID_NOT_PLAY', 'RAIN_AFFECTED_DLS').
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            human_explanation: { type: Type.STRING, description: "A brief, user-facing explanation of the settlement." },
            audit_json: {
                type: Type.OBJECT,
                properties: {
                    bet_id: { type: Type.STRING },
                    settlement_status: { type: Type.STRING },
                    settlement_timestamp: { type: Type.STRING, description: "ISO 8601 format." },
                    reason_code: { type: Type.STRING, description: "Standardized reason code, e.g., 'MATCH_RESULT'." },
                    explanation: { type: Type.STRING, description: "Internal-facing detailed explanation." },
                    settled_by: { type: Type.STRING, description: "Should be 'AI_ASSISTANT'." },
                },
                required: ["bet_id", "settlement_status", "settlement_timestamp", "reason_code", "explanation", "settled_by"],
            }
        },
        required: ["human_explanation", "audit_json"],
    };

    return callGemini<AISettlementResponse>("gemini-2.5-flash", {text: prompt}, schema);
};