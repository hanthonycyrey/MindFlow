import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeThoughts = async (thought: string): Promise<AnalysisResult> => {
  const prompt = `Analyze the following thought entry and extract key insights, themes, and patterns. 
  Suggest relevant mental models or frameworks that could apply to this specific thought.
  Also, identify potential internal connections or sub-ideas within this thought for a mind map.
  
  Thought Entry:
  ${thought}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A compelling title for this thought cluster." },
          summary: { type: Type.STRING, description: "A concise summary of the thought cluster." },
          themes: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Key themes identified."
          },
          patterns: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Recurring ideas or behavioral patterns."
          },
          suggestedFrameworks: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Names of mental models or frameworks that apply."
          },
          actionableInsights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Practical steps or advice based on the thoughts."
          },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING, description: "Source idea/theme" },
                to: { type: Type.STRING, description: "Target idea/theme" },
                reason: { type: Type.STRING, description: "Why they are connected" }
              },
              required: ["from", "to", "reason"]
            }
          }
        },
        required: ["title", "summary", "themes", "patterns", "suggestedFrameworks", "actionableInsights", "connections"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to analyze thoughts. Please try again.");
  }
};
