import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing_key" });
    }
    return aiInstance;
}

export interface MarkingResult {
  student_name: string;
  class: string;
  subject: string;
  score: number;
  grade: string;
  submission_id: string;
  remarks: string;
}

export async function markStudentScript(
  studentName: string,
  className: string,
  subject: string,
  questionImageBase64: string,
  questionMimeType: string,
  scriptImages: { data: string; mimeType: string }[]
): Promise<MarkingResult> {
  const parts: any[] = [
    { text: `You are an AI-powered WAEC examiner assistant designed to help teachers accurately mark students scripts.
* You must behave like a strict WAEC examiner
* Be consistent, objective, and precise
* Do NOT guess unclear answers
* Do NOT award marks for partially correct but incomplete logic`},
  ];

  try {
      const kbQ = query(collection(db, 'knowledgeBase'), where('subject', '==', subject));
      const kbSnapshot = await getDocs(kbQ);
      
      if (!kbSnapshot.empty) {
          parts.push({ text: `\n\n=== OFFICIAL WAEC MARKING GUIDES & KNOWLEDGE BASE ===\nPlease use the following official WAEC resources to accurately grade the student. STRICTLY adhere to the marking schemes and guidelines defined in these documents.` });
          
          for (const kbDoc of kbSnapshot.docs) {
              const kbData = kbDoc.data();
              const chunksCount = kbData.chunksCount || 0;
              let pdfBase64 = "";
              for (let i = 0; i < chunksCount; i++) {
                  const chunkSnap = await getDoc(doc(db, `knowledgeBase/${kbDoc.id}/chunks/${i}`));
                  if (chunkSnap.exists()) {
                      pdfBase64 += chunkSnap.data().data;
                  }
              }
              if (pdfBase64) {
                 parts.push({
                     inlineData: {
                         data: pdfBase64,
                         mimeType: "application/pdf"
                     }
                 });
                 parts.push({ text: `\nEnd of resource: ${kbData.fileName}\n` });
              }
          }
      }
  } catch (e) {
      console.error("Error loading knowledge base", e);
  }

  parts.push({ text: `\n\n=== QUESTION ===\nHere is the WAEC theory question:` });
  parts.push({ inlineData: { data: questionImageBase64, mimeType: questionMimeType } });
  parts.push({ text: `\n\n=== STUDENT SCRIPT ===\nHere are the handwritten script images for student: ${studentName} (Class: ${className}, Subject: ${subject}).` });

  for (const script of scriptImages) {
    parts.push({ inlineData: { data: script.data, mimeType: script.mimeType } });
  }

  parts.push({ text: `
Follow this STRICT MARKING LOGIC:
* If official marking guides were provided above, USE THEM.
* No marks for vague explanations, missing steps, or incorrect formulas.
* Award marks ONLY when correct method is shown, logical progression is clear, and final answer is correct.
* If handwriting is unclear: "Unable to confidently read this script. No marks awarded for affected sections."
* If answer is partially correct: Award marks ONLY for valid steps.
* If student skips question: Assign zero.

Grading Scale:
75–100: A1
70–74: B2
65–69: B3
60–64: C4
55–59: C5
50–54: C6
45–49: D7
40–44: E8
0–39: F9

Return a JSON object analyzing their answers and providing the final score and grade.` });

  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          student_name: { type: Type.STRING },
          class: { type: Type.STRING },
          subject: { type: Type.STRING },
          score: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          submission_id: { type: Type.STRING },
          remarks: { type: Type.STRING },
        },
        required: ["student_name", "class", "subject", "score", "grade", "submission_id", "remarks"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr) as MarkingResult;
    return {
      ...result,
      student_name: studentName,
      class: className,
      subject: subject,
      submission_id: result.submission_id || `sub_${Date.now()}`,
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse marking result.");
  }
}

export async function generateReportAnalytics(results: MarkingResult[]) {
    // We could use Gemini to generate the specific "Common Mistakes" and "Examples of Errors"
    // For now, we will create another prompt just for the report generation if needed, or compute locally.
}
