import OpenAI, { toFile } from "openai";
import type { YardAnalysisData } from "./shared/schema";
import { Buffer } from "node:buffer";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface ImageSet {
  front: string;
  right: string;
  left: string;
  back?: string;
  cornerFrontLeft?: string;
  cornerFrontRight?: string;
  cornerBackLeft?: string;
  cornerBackRight?: string;
  zipCode?: string;
  analysisType?: string;
}

const ANALYSIS_TYPE_CONTEXT = {
  curb: {
    title: 'Curb View Analysis',
    description: 'front center view, front right side view, and front left side view of the same property',
    focus: 'Focus on CURB APPEAL improvements - what buyers see from the street. Prioritize front-facing elements: facade, front yard, driveway, walkway, porch, front door, and visible roofline.',
  },
  'full-exterior': {
    title: 'Full Exterior Analysis',
    description: 'multiple angles showing different sides of the property exterior',
    focus: 'Analyze the COMPLETE EXTERIOR of the property from all visible angles. Include all sides of the house, full roof assessment, all windows, complete landscaping, fencing, garage, and any outbuildings visible.',
  },
};

export async function analyzeYardImages(images: ImageSet): Promise<YardAnalysisData> {
  const analysisType = images.analysisType || 'curb';
  const typeContext = ANALYSIS_TYPE_CONTEXT[analysisType as keyof typeof ANALYSIS_TYPE_CONTEXT] || ANALYSIS_TYPE_CONTEXT.curb;
  
  const locationContext = images.zipCode 
    ? `\n\nLOCATION CONTEXT: The property is located in ZIP code ${images.zipCode}. Adjust all pricing estimates to reflect the local market conditions, labor costs, and material availability for this area.`
    : '';

  const prompt = `You are an expert exterior property inspector, home repair planner, and property valuation AI.
  
  Input: 3+ photos of a property (${typeContext.description}) + Zip Code: ${images.zipCode || 'Unknown'}.
  
  Task:
  1. Condition Assessment: Identify roof, siding, windows, doors, gutters, trim, lawn, shrubs, driveway, sidewalk, porch, fence. Give a condition score (1-5) and list visible issues.
  2. Repairs & DIY Plans: For each issue, decide repair vs replace. List materials, cost ranges (low/high), DIY steps, and if pro is recommended.
  3. Value & ROI: Estimate current value, projected value after repairs, rent uplift, ROI %, and payback period.
  4. Cost Breakdown: Summarize costs per component.
  
  ${typeContext.focus}
  ${locationContext}
  
  Output JSON format:
  {
    "conditionAssessment": [
      { "component": "Roof", "conditionScore": 3, "issues": ["Missing shingles"], "confidence": 0.9 }
    ],
    "repairs": [
      {
        "component": "Roof",
        "recommendation": "Repair",
        "materials": [{ "name": "Asphalt shingles", "quantity": "15 bundles", "costRange": "$80-$120 each" }],
        "diySteps": ["1. Remove old...", "2. ..."],
        "proRecommended": true,
        "costRange": { "low": 3500, "high": 6000 }
      }
    ],
    "roi": {
      "currentValue": 450000,
      "projectedValue": 475000,
      "rentUplift": 200,
      "roiPercentage": 15,
      "paybackPeriodMonths": 12
    },
    "costBreakdown": [
      { "component": "Roof", "low": 3500, "high": 6000 }
    ],
    "totalCost": { "low": 10000, "high": 15000 },
    "estimatedTime": "4-8 weeks DIY, 2-3 weeks pro"
  }
  `;

  const imageContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.front}` } },
  ];

  if (images.right) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.right}` } });
  if (images.left) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.left}` } });
  if (images.back) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.back}` } });
  if (images.cornerFrontLeft) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerFrontLeft}` } });
  if (images.cornerFrontRight) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerFrontRight}` } });
  if (images.cornerBackLeft) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerBackLeft}` } });
  if (images.cornerBackRight) imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerBackRight}` } });

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // Using a capable model for vision and complex reasoning
    messages: [
      {
        role: "user",
        content: imageContent,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const analysisData = JSON.parse(content) as Omit<YardAnalysisData, 'beforeImage' | 'afterImage'> & { beforeImage: string; afterImage: string };
  
  // Generate after image
  const improvements = analysisData.repairs.map(r => r.recommendation + " " + r.component);
  const afterImage = await editImageWithImprovements(images.front, improvements);

  return {
    ...analysisData,
    beforeImage: `data:image/jpeg;base64,${images.front}`,
    afterImage,
  };
}

async function editImageWithImprovements(
  imageBase64: string, 
  improvements: string[]
): Promise<string> {
  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const imageFile = await toFile(imageBuffer, 'yard.png', { type: 'image/png' });
    
    const topImprovements = improvements.slice(0, 3).join("; ");

    const response = await openai.images.edit({
      model: "dall-e-2", // Or appropriate model
      image: imageFile,
      prompt: `Edit this exact house photo to show realistic home improvements. Keep the EXACT same house structure. Apply these upgrades: ${topImprovements}. Realistic renovation, fresh paint, clean landscaping.`,
      n: 1,
      size: "1024x1024",
    });

    const url = response.data?.[0]?.url;
    if (url) {
        // Fetch the image and convert to base64 to store consistent with beforeImage
        const imgRes = await fetch(url);
        const buffer = await imgRes.arrayBuffer();
        return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
    }
    return "";
  } catch (error) {
    console.error("Error editing image with improvements:", error);
    return ""; // Return empty string on failure to avoid breaking the whole flow
  }
}
