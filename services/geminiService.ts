
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, CaptionOption } from "../types";

export const generateCaptions = async (params: GenerationParams): Promise<CaptionOption[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use flash model for ultra-fast <10s response times as requested
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `You are CAPTORO FAST, the high-velocity Virality Engine.
  
  PLATFORM: ${params.platform}
  ACCOUNT TYPE: ${params.accountType}
  STYLE: ${params.communicationStyle || 'High-impact, authentic, and modern'}
  LANGUAGE: ${params.language}

  CORE VIRAL PROTOCOL (EXECUTE IMMEDIATELY):
  1. THE HOOK: First line MUST stop the scroll. Use a curiosity gap or bold claim.
  2. SPACING: Minimize friction. Use line breaks only for dramatic impact or clarity. 
  3. NO "POV": Strictly forbidden.
  4. STRUCTURE: Hook -> Value Bridge -> Punchline/Meat -> CTA.
  5. MAGIC EDIT: Suggest one high-end visual enhancement (lighting/color/texture).

  Deliver exactly 3 ultra-viral options in JSON format.`;

  const promptParts: any[] = [
    { text: `GENERATE 3 VIRAL CAPTIONS NOW. Context: ${params.idea || 'Visual content scan'}` }
  ];

  if (params.image) {
    promptParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: params.image.split(',')[1] 
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: promptParts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      // Set thinkingBudget to 0 for maximum speed/latency optimization
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategy: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING }
              }
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                visualImpact: { type: Type.NUMBER },
                hookStrength: { type: Type.NUMBER },
                retentionRate: { type: Type.NUMBER },
                viralScore: { type: Type.NUMBER }
              }
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                targetAudience: { type: Type.STRING },
                bestPostingTime: { type: Type.STRING },
                whyItWorks: { type: Type.STRING }
              }
            },
            magicEditSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("CAPTORO ENGINE FAILURE", e);
    return [];
  }
};

export const applyMagicEnhance = async (base64Image: string, editPrompt: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Viral Realism Transformation: ${editPrompt}. Professional cinematic lighting. Return ONLY base64.`,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("MAGIC ENHANCE FAILED", e);
    return null;
  }
};
