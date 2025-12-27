import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { analyzeYardImages } from "./ai";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
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

        const analysis = await analyzeYardImages(imageSet);
        res.json(analysis);
      } catch (error: any) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: error.message || "Failed to analyze property" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
