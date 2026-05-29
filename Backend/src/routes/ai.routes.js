// backend/routes/ai.routes.js
import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize the Google Gen AI SDK (it automatically picks up GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({});

/**
 * @route   POST /api/ai/refine
 * @desc    Refine and rewrite user diary entry logs for clarity and depth
 * @access  Private (Ensure your auth middleware is placed before this)
 */
router.post("/refine", async (req, res) => {
try {
    const { note } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note content payload is required for processing Matrix."
      });
    }

    const trimmedNote = note.trim();
    let dynamicInstructions = "";

    // ⚡ DYNAMIC PROMPT ROUTING LOGIC BASED ON CHARACTER COUNT
    if (trimmedNote.length < 50) {
      dynamicInstructions = `You are an empathetic, warm, and insightful personal AI journal companion made for Indian users.
      The user wrote a very brief diary log entry. Your task is to expand, deepen, and elaborate on this thought to make it a more complete reflection.
      Analyze the emotional baseline or context provided, and write a more detailed version that is AT LEAST 50 characters long.
      
      TONE & LANGUAGE RULES (very important):
      - Write in a warm, desi Indian tone — like a close friend or yaar who truly understands.
      - Use simple, easy English words that any average Indian person can understand. Avoid complex or fancy English.
      - Naturally mix in common Hinglish words and phrases where it feels genuine and relatable — like "yaar", "arre", "sach mein", "thoda", "bahut", "ajeeb", "dil", "sab kuch", "kya baat hai", "lagta hai", etc.
      - The Hinglish should feel organic, not forced — just like how Indians actually talk and think.
      - Keep the core raw emotional truth, original meaning, and first-person perspective completely intact.
      
      Do not add any introductory phrases, explanations, or quotes — return ONLY the expanded, polished entry text.`;
    } else {
      dynamicInstructions = `You are an empathetic, warm, and insightful personal AI journal companion made for Indian users.
      Your task is to refine, gently proofread, and polish the following user diary log entry.
      Improve its flow, depth, and vocabulary while keeping the core raw emotional truth, original meaning, and perspective completely intact.
      
      TONE & LANGUAGE RULES (very important):
      - Write in a warm, desi Indian tone — like a close friend or yaar who truly understands.
      - Use simple, easy English words that any average Indian person can understand. Avoid complex or fancy English.
      - Naturally mix in common Hinglish words and phrases where it feels genuine and relatable — like "yaar", "arre", "sach mein", "thoda", "bahut", "ajeeb", "dil", "sab kuch", "kya baat hai", "lagta hai", etc.
      - The Hinglish should feel organic, not forced — just like how Indians actually talk and think.
      - Keep it brief, natural, first-person, and human. 300 characters or less.
      
      Do not add any introductory phrases, explanations, or quotes — return only the polished entry text in plain Indian English.`;
    }

    // Call the Gemini API to process the text
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: ` ${dynamicInstructions}
      User Entry: "${trimmedNote}"`,
    });

    const refinedText = response.text?.trim();

    return res.status(200).json({
      success: true,
      refinedNote: refinedText
    });

  } catch (err) {
    console.error("Gemini context refinement matrix failure:", err);
    return res.status(500).json({
      success: false,
      message: "Server error executing AI text transformation pipelines."
    });
  }
});

export default router;