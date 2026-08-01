import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client (server-side only)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Question Generator Endpoint
app.post("/api/ai/generate-questions", async (req, res) => {
  try {
    const { topic, difficulty, questionCount = 5, questionTypes = ["MCQ"] } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const prompt = `Generate ${questionCount} high-quality test questions on the topic "${topic}".
Difficulty level: ${difficulty || "Intermediate"}.
Question type preference: ${questionTypes.join(", ")}.

Provide the response as a structured array of questions with options, correct answers, explanations, and hints.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert assessment author. Output well-formatted educational test questions with accurate answer keys and clear explanations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "Question type: 'MULTIPLE_CHOICE', 'MULTIPLE_RESPONSE', 'TRUE_FALSE', or 'SHORT_TEXT'",
              },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                  },
                  required: ["id", "text", "isCorrect"],
                },
              },
              correctAnswerText: { type: Type.STRING },
              marks: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              hint: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["type", "questionText", "marks", "explanation"],
          },
        },
      },
    });

    const questionsText = response.text;
    const questions = JSON.parse(questionsText || "[]");

    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// AI Raw Unstructured Text Parser Endpoint
app.post("/api/ai/parse-raw-questions", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: "rawText parameter is required." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const prompt = `Parse the following raw text into a structured list of quiz questions.
Identify question text and answers. 
If it contains question and answer pairs (such as memory verses, recitation questions, short answer items), set type to 'SHORT_TEXT' or 'PARAGRAPH' with questionText and correctAnswerText.
If multiple choice options exist, set type to 'MULTIPLE_CHOICE' or 'MULTIPLE_RESPONSE' with option objects.

Raw Text:
"""
${rawText}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert assessment parser. Extract questions, answer keys, question types, and explanations accurately from unstructured text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "'MULTIPLE_CHOICE', 'SHORT_TEXT', 'PARAGRAPH', 'TRUE_FALSE', 'MULTIPLE_RESPONSE'",
              },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN },
                  },
                  required: ["id", "text", "isCorrect"],
                },
              },
              correctAnswerText: { type: Type.STRING },
              marks: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["type", "questionText"],
          },
        },
      },
    });

    const parsedQuestions = JSON.parse(response.text || "[]");
    res.json({ success: true, questions: parsedQuestions });
  } catch (error: any) {
    console.error("AI Text Parsing error:", error);
    res.status(500).json({ error: error.message || "Failed to parse text questions." });
  }
});

// AI Explanation & AI Tutoring Endpoint
app.post("/api/ai/explain-answer", async (req, res) => {
  try {
    const { questionText, studentAnswer, correctAnswer } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const prompt = `Question: "${questionText}"
Student Answer: "${studentAnswer}"
Correct Answer: "${correctAnswer}"

Provide a concise, encouraging, and detailed step-by-step breakdown explaining why the correct answer is right and where the student might have misstepped if their answer was incorrect.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, precise educational tutor providing constructive feedback.",
      },
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("AI Explanation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI explanation" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
