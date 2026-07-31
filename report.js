// report.js


import { GoogleGenAI, Type } from "@google/genai";


const prompt = `
    
`


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    fixThisWeek: {
      type: Type.ARRAY,
      maxItems: "3",
      items: { type: Type.STRING },
    },
    worthDoing: {
      type: Type.ARRAY,
      maxItems: "4",
      items: { type: Type.STRING },
    },
    housekeeping: { type: Type.STRING, nullable: true },
    headline: { type: Type.STRING },
  },
  propertyOrdering: ["fixThisWeek", "worthDoing", "housekeeping", "headline"],
  required: ["fixThisWeek", "worthDoing", "headline"],
};

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: reportSchema,
  },
});

let report;
try {
  report = JSON.parse(response.text);
} catch {
  throw new Error("model returned unparseable JSON");
}