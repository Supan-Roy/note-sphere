import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "50mb" }));

// API Endpoints for Noteflow
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1. Multimodal Note Processing
app.post("/api/process-note", upload.single("file"), async (req, res) => {
  try {
    const { type, prompt } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const parts: any[] = [
      { text: prompt || "Analyze this note. Extract ALL the text content faithfully into 'extractedText'. Provide a structured summary, key concepts, quality scores (0-100), tags, and missing topics for exam readiness." }
    ];

    if (file) {
      parts.push({
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            extractedText: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                knowledge: { type: Type.INTEGER },
                readability: { type: Type.INTEGER },
                completeness: { type: Type.INTEGER },
                examReadiness: { type: Type.INTEGER }
              },
              required: ["knowledge", "readability", "completeness", "examReadiness"]
            },
            missingTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "keyConcepts", "scores", "tags"]
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (parseError) {
      console.error("Parse error (note):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error processing note:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. AI Chat / Companion
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context, history } = req.body;
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a smart academic assistant for NOTEFLOW. 
        Your goal is to help the user understand their studies.
        ${context ? `
        --- NOTE CONTEXT ---
        ${context}
        --------------------
        
        Answer based primarily on the provided context if possible.` : "Provide general academic help based on your knowledge base."}
        Keep answers pedagogical, encouraging, and clear.`
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Smart Routine Parsing
app.post("/api/parse-routine", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Read this academic routine/timetable and extract the courses and semesters. Group courses by semester. Provide course names and codes if present." },
          {
            inlineData: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            semesters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  courses: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        code: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            confidence: { type: Type.INTEGER }
          }
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (parseError) {
      console.error("Parse error (routine):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error parsing routine:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Quiz Generation
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { context, difficulty, count } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: `Generate a ${difficulty} difficulty academic quiz with ${count || 5} MCQs based on the following context:\n\n${context}` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (parseError) {
      console.error("Parse error (quiz):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Preparation Mode Summary Generation
app.post("/api/preparation-summary", async (req, res) => {
  try {
    const { title, context } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `Create a premium exam-prep summary for the following note or document. Keep it concise, high-yield, and practical. Return a JSON object with: title, summary, keyTakeaways (5 items), weakAreas (3 items), and nextSteps (3 items). Use the source title when helpful: ${title || "Untitled Source"}.\n\nSOURCE:\n${context || "No content provided."}`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "keyTakeaways", "weakAreas", "nextSteps"]
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (parseError) {
      console.error("Parse error (preparation summary):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error generating preparation summary:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Preparation Mode Live Exam Generation
app.post("/api/preparation-exam", async (req, res) => {
  try {
    const { title, context, difficulty, questionCount, durationMinutes } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `Create a timed live exam paper for preparation mode. Make it premium, fair, and challenging. Generate ${questionCount || 5} open-ended or short-answer questions from the source. The recommended duration is ${durationMinutes || 30} minutes. Difficulty level: ${difficulty || "Medium"}. Return JSON with title, recommendedMinutes, instructions, and questions. Each question should include question, topic, marks, and expectedAnswer. Use the source title when helpful: ${title || "Untitled Source"}.\n\nSOURCE:\n${context || "No content provided."}`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            recommendedMinutes: { type: Type.INTEGER },
            instructions: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  marks: { type: Type.INTEGER },
                  expectedAnswer: { type: Type.STRING }
                },
                required: ["question", "topic", "marks", "expectedAnswer"]
              }
            }
          },
          required: ["title", "recommendedMinutes", "instructions", "questions"]
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (parseError) {
      console.error("Parse error (preparation exam):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error generating preparation exam:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Preparation Mode Answer Script Grading
app.post("/api/preparation-grade", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { exam, context, difficulty } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No answer script uploaded" });
    }

    let examPayload: any = null;
    try {
      examPayload = exam ? JSON.parse(exam) : null;
    } catch {
      examPayload = null;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `You are a strict but fair academic examiner. Grade the uploaded answer script against the exam and source material below. Return JSON with: grade, scorePercent, totalMarks, awardedMarks, feedback, strengths (3-5 items), improvements (3-5 items), and questionWiseFeedback (one item per exam question with question, maxMarks, marksAwarded, and comment). Be careful, concise, and constructive. Difficulty: ${difficulty || "Medium"}.\n\nEXAM JSON:\n${exam || "{}"}\n\nEXAM SOURCE CONTEXT:\n${context || "No context provided."}`
          },
          {
            inlineData: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING },
            scorePercent: { type: Type.INTEGER },
            totalMarks: { type: Type.INTEGER },
            awardedMarks: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionWiseFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  maxMarks: { type: Type.INTEGER },
                  marksAwarded: { type: Type.INTEGER },
                  comment: { type: Type.STRING }
                },
                required: ["question", "maxMarks", "marksAwarded", "comment"]
              }
            }
          },
          required: ["grade", "scorePercent", "totalMarks", "awardedMarks", "feedback", "strengths", "improvements", "questionWiseFeedback"]
        }
      }
    });

    try {
      const respText = response.text || "{}";
      const cleaned = respText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (!parsed.totalMarks && examPayload?.questions) {
        const totalMarks = examPayload.questions.reduce((sum: number, question: any) => sum + Number(question.marks || 0), 0);
        parsed.totalMarks = totalMarks;
      }

      res.json(parsed);
    } catch (parseError) {
      console.error("Parse error (preparation grade):", response.text);
      res.status(500).json({ error: "Failed to parse AI response as JSON", raw: response.text });
    }
  } catch (error: any) {
    console.error("Error grading preparation answer script:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Handwritten Note to Text/PDF (OCR)
app.post("/api/handwritten-ocr", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          { text: "This is an image of a handwritten note. Please transcribe it accurately. Format it in Markdown with appropriate headings, bold text for key terms, and standard formatting. Ensure the output is clean and professional." },
          {
            inlineData: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype
            }
          }
        ]
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error OCR-ing handwritten note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev, Asset Serving for Prod
async function setupVite() {
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
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
