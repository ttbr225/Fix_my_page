// report.js


import { GoogleGenAI, Type } from "@google/genai";


const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    chute: { type: Type.STRING, enum: ["single-sentence", "short-list", "full-report"] },
  },
  propertyOrdering: ["text", "chute"],
    required: ["text", "chute"],
};



/**
 * @typedef {object} AuditResult
 * @property {string} url
 * @property {number} bytes
 * @property {{type: string}[]} problems
 * @property {object} checks
*/

/** @param {AuditResult} auditResult */
export async function writeReport(auditResult) {
  if (!ai) return null;

  const prompt = `
  Recommend a course of action and specify which of the chutes best describes the format of your recommendation.

  ${auditResult.url} - ${auditResult.bytes} bytes
  ${JSON.stringify(auditResult.problems)}
  ${JSON.stringify(auditResult.checks)}
  `
  console.log(prompt);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });
    try {
      const report = JSON.parse(response.text);
      console.log(report.chute);
      return report;
    } catch {
      throw new Error(`model returned unparseable JSON: ${response}`);
    }
  } catch {
    return null;
  };

};
