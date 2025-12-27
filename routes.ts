import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { analyzeYardImages } from "./ai";
import { db } from "./db";
import { yardAnalyses } from "./shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint to verify AI configuration
  app.get("/api/test-ai", async (req, res) => {
    try {
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
      
      if (!apiKey || !baseUrl) {
        return res.status(500).json({
          configured: false,
          message: "AI environment variables not configured",
          apiKeySet: !!apiKey,
          baseUrlSet: !!baseUrl,
        });
      }

      res.json({
        configured: true,
        message: "AI configuration is ready",
        baseUrl: baseUrl,
        apiKeyPrefix: apiKey.substring(0, 10) + "...",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post(
    "/api/analyze-yard",
    upload.fields([
      { name: "front", maxCount: 1 },
      { name: "right", maxCount: 1 },
      { name: "left", maxCount: 1 },
      { name: "back", maxCount: 1 },
      { name: "cornerFrontLeft", maxCount: 1 },
      { name: "cornerFrontRight", maxCount: 1 },
      { name: "cornerBackLeft", maxCount: 1 },
      { name: "cornerBackRight", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const zipCode = req.body.zipCode;
        const analysisType = req.body.analysisType;

        if (!files.front?.[0]) {
          return res.status(400).json({ error: "Front image is required" });
        }

        console.log("Starting analysis for ZIP code:", zipCode);
        console.log("Analysis type:", analysisType);
        console.log("Files received:", Object.keys(files));

        const imageSet = {
          front: files.front[0].buffer.toString("base64"),
          right: files.right?.[0]?.buffer.toString("base64") || "",
          left: files.left?.[0]?.buffer.toString("base64") || "",
          back: files.back?.[0]?.buffer.toString("base64"),
          cornerFrontLeft: files.cornerFrontLeft?.[0]?.buffer.toString("base64"),
          cornerFrontRight: files.cornerFrontRight?.[0]?.buffer.toString("base64"),
          cornerBackLeft: files.cornerBackLeft?.[0]?.buffer.toString("base64"),
          cornerBackRight: files.cornerBackRight?.[0]?.buffer.toString("base64"),
          zipCode,
          analysisType,
        };

        console.log("Calling AI analysis...");
        const analysisData = await analyzeYardImages(imageSet);
        console.log("AI analysis complete");

        // Save to database
        const [savedAnalysis] = await db.insert(yardAnalyses).values({
          imageUrl: analysisData.beforeImage,
          zipCode,
          analysis: analysisData,
        }).returning();

        console.log("Analysis saved to database:", savedAnalysis.id);

        res.json(savedAnalysis);
      } catch (error: any) {
        console.error("Analysis error:", error);
        res.status(500).json({ 
          error: error.message || "Failed to analyze property",
          details: error.stack,
        });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
