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
  // ⚡ FIX: Define variables in the parent function scope so the catch block can see them!
  const { note } = req.body;
  let trimmedNote = "";
  let dynamicInstructions = "";

  try {
    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note content payload is required for processing Matrix."
      });
    }

    trimmedNote = note.trim();

    // ⚡ DYNAMIC PROMPT ROUTING LOGIC BASED ON CHARACTER COUNT
    if (trimmedNote.length < 50) {
      dynamicInstructions = `You are an empathetic, warm, and insightful personal AI journal companion for "Moodiary" — an app where users log their daily moods and share reflections with close friends.
      
      Your task is to analyze the user's raw, brief note and expand it into a meaningful daily summary. 
      Based on their short note, intelligently think about what practical, realistic actions, situations, or routines they likely went through today.
      
      FORMAT RULES:
      - Do not use a single repetitive greeting. Start your entry directly with a natural, variable opening anchor that sets up a breakdown of the day. Examples:
        * "Aaj ka din kuch aisa raha:"
        * "So today was all about:"
        * "Here is how my day went down:"
        * "Aaj ka scene yeh tha:"
      - Follow this opening immediately with a bulleted list of 3 specific, relatable daily actions or events inferred from their note.
      - End with a separate, brief closing sentence that captures their overall emotional feeling/vibe using warm Hinglish.
      
      TONE & LANGUAGE RULES:
      - Write from a first-person perspective ("I", "Me", "My").
      - Use a warm, desi Indian tone — like a close friend or yaar sharing their day transparently.
      - Use simple, everyday English words. Naturally mix in common Hinglish words where genuine conversations happen (like "yaar", "thoda", "bahut", "sukoon").
      - Make sure the Hinglish feels completely organic and conversational, exactly how close Indian friends chat.
      
      Do not add any introductory metadata, conversational prefaces, or quotes. Return ONLY the final structured reflection text under 250 characters.`;

    } else { // Standard refining, polishing, and structure formatting
      dynamicInstructions = `You are an empathetic, warm, and insightful personal AI journal companion for "Moodiary" — an app where users log their daily moods and share reflections with close friends.
      
      Your task is to refine, structure, and polish the user's daily note. Read their raw input, break down the context into explicit experiences they faced today, and format it cleanly.
      
      FORMAT RULES:
      - Start directly with a casual, scanning-friendly first-person introductory line summarizing the log's onset (e.g., "Summarizing my day:", "Quick update on what went down today:", or "Aaj ka breakdown:").
      - Follow it with a bulleted list of 3 clear, meaningful points summarizing their actions, interactions, or events from the note.
      - End with a separate, brief closing sentence summarizing their raw emotional state or feeling.
      
      TONE & LANGUAGE RULES:
      - Keep it entirely in the first-person perspective.
      - Write in a warm, relatable Indian English/Hinglish style — keeping it natural, authentic, and human. 
      - Use simple words that are easy to understand. The vibe should match a personal update you'd feel safe sharing with your closest group of friends.
      - Total length must be concise and natural (under 250 characters total).
      
      
      Do not add any introductory prefaces, explanations, or quotes. Return ONLY the formatted reflection list and closing feeling statement under 250 characters.`;
    }

    // Call the Gemini API to process the text
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${dynamicInstructions}\n\nUser Entry: "${trimmedNote}"`,
    });

    const refinedText = response.text?.trim();

    return res.status(200).json({
      success: true,
      refinedNote: refinedText
    });

  } catch (err) {
    console.error("Primary GenAI processing failure:", err);

    // ⚡ FALLBACK HANDLER: Triggered on 503 (High Demand) or 429 (Quota Exhausted)
    if (err.status === 503 || err.message?.includes("503") || err.message?.includes("high demand") || err.status === 429) {
      try {
        console.warn("Diverting traffic to fallback model engine...");
        
        const fallbackResponse = await ai.models.generateContent({
          // ⚡ FIX: Swap to a running target model ID (like 2.5-flash with fallback settings, or 1.5-pro)
          model: "gemini-3.5-flash", 
          contents: `${dynamicInstructions}\n\nUser Entry: "${trimmedNote}"`,
          config: { temperature: 0.5 }
        });

        const fallbackRefinedText = fallbackResponse.text?.trim();
        
        return res.status(200).json({
          success: true,
          refinedNote: fallbackRefinedText
        });
      } catch (fallbackError) {
        console.error("Fallback engine processing crashed:", fallbackError);
        return res.status(500).json({
          success: false,
          message: "Server error executing AI text transformation pipelines: " + fallbackError.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error executing AI text transformation pipelines: " + err.message
    });
  }
});

export default router;