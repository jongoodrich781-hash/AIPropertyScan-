import OpenAI, { toFile } from "openai";
import type { YardAnalysisData } from "@shared/schema";
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
    ? `\n\nLOCATION CONTEXT: The property is located in ZIP code ${images.zipCode}. Adjust all pricing estimates to reflect the local market conditions, labor costs, and material availability for this area. Consider regional factors like climate (which affects material choices and landscaping), local contractor rates, and property values typical for this ZIP code.`
    : '';

  const prompt = `You are a professional landscape architect and home renovation expert performing a ${typeContext.title}. You are viewing 3 photos: ${typeContext.description}.${locationContext}

${typeContext.focus}

CRITICAL REQUIREMENT: Every repair/upgrade you suggest MUST generate PROFIT for the homeowner. The property value increase MUST be higher than the repair cost. For example: if a repair costs $3,500, the property value increase should be $5,500 or more.

Analyze ALL THREE images together to provide a comprehensive analysis with actionable recommendations for BOTH the yard/landscaping AND the house exterior.

Provide:
1. Current condition assessment - describe what you see across all angles including the house exterior condition (paint, siding, roof, windows, doors, porch, steps, railings) AND yard/landscaping (lawn, plants, walkways, driveway)

2. Specific repair/improvement suggestions that GENERATE PROFIT. IMPORTANT: Only include suggestions for issues you can actually see in the photos. The number of suggestions should vary based on the property's actual condition:
   - Well-maintained properties may only need 2-3 suggestions
   - Properties needing moderate work may have 4-5 suggestions
   - Properties in poor condition may need 6-8 suggestions
   
   Each repair must have:
   - Estimated cost to complete the repair (adjusted for the local market if ZIP code provided)
   - Property value increase (MUST be higher than cost - typically 1.3x to 2x the cost)
   
   Only suggest repairs for issues visible in the photos. Consider these categories if applicable:
   - Windows: only if showing signs of age, damage, or inefficiency (old, drafty, single-pane, foggy, damaged, peeling frames)
   - Porch and step repairs: only if visible damage or wear
   - Exterior paint/power washing: only if faded, peeling, or dirty
   - Front door: only if worn or outdated
   - Landscaping: only if overgrown, sparse, or neglected
   - Driveway/walkway: only if cracked, stained, or damaged
   - Roof: only if visible issues like missing shingles or damage
   - Siding: only if damaged or deteriorating

3. Estimated total cost range for all improvements combined (adjusted for local market)
4. Expected total property value increase (must show overall profit, based on local property values)
5. Recommended design style that fits the property
6. Top 3 most impactful improvements
7. Pricing breakdown for three service tiers (adjusted for local market rates):
   - DIY: cost if homeowner does it themselves (materials only)
   - Low-grade contractor: budget-friendly professional service
   - High-grade contractor: premium professional service

Format your response as JSON:
{
  "currentCondition": "detailed description of current state",
  "suggestions": [
    {
      "title": "Replace porch and steps",
      "description": "Current porch shows wear and safety concerns. New composite decking and railings will improve safety and curb appeal.",
      "priority": 1,
      "estimatedCost": 3500,
      "valueIncrease": 5500
    },
    {
      "title": "Repaint house exterior",
      "description": "Faded and peeling paint. Fresh paint in modern neutral colors will dramatically improve appearance.",
      "priority": 2,
      "estimatedCost": 4000,
      "valueIncrease": 7000
    }
  ],
  "estimatedCost": {
    "min": 10000,
    "max": 15000
  },
  "valueIncrease": {
    "amount": 25000,
    "percentage": 8
  },
  "style": "Modern Farmhouse",
  "improvements": ["Replace porch with composite decking", "Repaint exterior in warm gray", "Add landscaping beds with perennials"],
  "pricing": {
    "diy": 5000,
    "lowGradeContractor": 12000,
    "highGradeContractor": 18000
  },
  "beforeImage": "placeholder",
  "afterImage": "placeholder"
}

REMEMBER: Every suggestion's valueIncrease MUST be greater than its estimatedCost to show profit!`;

  const imageContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.front}` } },
  ];

  if (images.right) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.right}` } });
  }
  if (images.left) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.left}` } });
  }
  if (images.back) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.back}` } });
  }
  if (images.cornerFrontLeft) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerFrontLeft}` } });
  }
  if (images.cornerFrontRight) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerFrontRight}` } });
  }
  if (images.cornerBackLeft) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerBackLeft}` } });
  }
  if (images.cornerBackRight) {
    imageContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${images.cornerBackRight}` } });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "user",
        content: imageContent,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const analysisData = JSON.parse(content) as Omit<YardAnalysisData, 'beforeImage' | 'afterImage'> & { beforeImage: string; afterImage: string };
  
  const afterImage = await editImageWithImprovements(images.front, analysisData.improvements, analysisData.suggestions);

  return {
    ...analysisData,
    beforeImage: `data:image/jpeg;base64,${images.front}`,
    afterImage,
  };
}

async function editImageWithImprovements(
  imageBase64: string, 
  improvements: string[],
  suggestions: Array<{ title: string; description: string; priority: number }>
): Promise<string> {
  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const imageFile = await toFile(imageBuffer, 'yard.png', { type: 'image/png' });
    
    const topImprovements = improvements.slice(0, 3).join("; ");
    const suggestionTitles = suggestions
      .slice(0, 3)
      .map(s => s.title)
      .join("; ");

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: `Edit this exact house photo to show realistic home improvements. Keep the EXACT same house, same angle, same perspective, same trees, same driveway, same basic structure. Only apply these specific upgrades: ${topImprovements}. Specific changes: ${suggestionTitles}. The result should look like a realistic before/after renovation photo where someone would instantly recognize it as the same property. Apply these improvements realistically: fresh paint on house and window frames, clean/upgraded windows (new frames, shutters if suggested), tidied landscaping, cleaner walkways, and improved curb appeal. Do NOT change the house shape, roof line, or add new structures. Keep windows in the same positions but show them refreshed/upgraded if window repairs are suggested.`,
    });

    const base64 = response.data?.[0]?.b64_json ?? "";
    return base64 ? `data:image/png;base64,${base64}` : "";
  } catch (error) {
    console.error("Error editing image with improvements:", error);
    return "";
  }
}