import { GoogleGenAI } from "@google/genai";
try {
  new GoogleGenAI({ apiKey: "" });
  console.log("No error on empty API key.");
} catch(e) {
  console.error("Error creating AI:", e);
}
