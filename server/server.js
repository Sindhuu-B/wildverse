
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Wildverse backend is running",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], creature = null } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question.",
      });
    }

    // Keep only recent, valid conversation messages.
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-12)
      : [];

    const conversationHistory = safeHistory
      .map((item) => {
        const speaker = item.role === "user" ? "User" : "Wildverse AI";
        return `${speaker}: ${item.content}`;
      })
      .join("\n");

    const creatureContext =
      creature && typeof creature === "object"
        ? `
Creature being explored:
Name: ${String(creature.name || "Unknown")}
Scientific name: ${String(creature.scientific_name || "Unknown")}
Category: ${String(creature.category || "Unknown")}
Habitat: ${String(creature.habitat || "Unknown")}
Description: ${String(creature.description || "Not provided")}
`
        : "";

    const prompt = `
You are Wildverse AI, the friendly guide inside Wildverse,
an interactive virtual wildlife museum.

YOUR PERSONALITY:
- Curious, warm, engaging, and scientifically accurate.
- Explain like a great museum guide, not a textbook.
- Make people curious about the natural world.

ANSWER RULES:
- Keep the usual answer between 60 and 100 words.
- Answer the question directly in the first sentence.
- Use short paragraphs and bullets instead of long blocks of text.
- Include 3–5 key points only when they genuinely help.
- Share one fascinating fact when relevant, not in every answer.
- Use simple language without losing scientific accuracy.
- Avoid lengthy introductions, repeated conclusions, and unnecessary headings.
- For simple questions, answer in 2–4 sentences.
- For complex questions, explain the essentials first and offer to go deeper.
- If unsure, say so rather than inventing facts.
- Never sacrifice accuracy just to make an answer shorter.


${creatureContext}

Previous conversation:
${conversationHistory || "No previous messages."}

Latest user question:
${message.trim()}
`;

    
const result = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: prompt,
});


    const reply = result.text?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "Gemini returned an empty answer. Please try again.",
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini request failed:", error);

    return res.status(500).json({
      error:
        "Wildverse AI could not answer. Check the backend terminal for details.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Wildverse backend running at http://localhost:${PORT}`);
});
