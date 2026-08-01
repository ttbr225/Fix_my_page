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
  if (!ai) { console.warn("no API key"); return null; };
  if (auditResult.problems.length === 0) { console.log("report: nothing to report"); return null; }

  const prompt = `
  Recommend a course of action and specify which of the chutes best describes the format of your recommendation.

  ${auditResult.url} - ${auditResult.bytes} bytes
  ${JSON.stringify(auditResult.problems)}
  ${JSON.stringify(auditResult.checks)}
  `

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });
    try {
      const report = JSON.parse(response.text);
      return report;
    } catch {
      throw new Error(`model returned unparseable JSON: ${response}`);
    }
  } catch (caughtError) {
    console.error("call failed:", caughtError instanceof Error ? caughtError.message : String(caughtError));
    return null;
  };
};
