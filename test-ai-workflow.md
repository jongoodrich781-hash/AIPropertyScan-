# AI Workflow Testing Guide

## Prerequisites

1. **Environment Variables**: Ensure `.env` is configured with:
   ```bash
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
   DATABASE_URL=postgresql://...
   ```

2. **Database**: Run migrations if not already done:
   ```bash
   npm run db:push
   ```

## Test Endpoint

### 1. Check AI Configuration
```bash
curl http://localhost:5000/api/test-ai
```

Expected response (if configured):
```json
{
  "configured": true,
  "message": "AI configuration is ready",
  "baseUrl": "https://api.openai.com/v1",
  "apiKeyPrefix": "sk-proj-..."
}
```

Expected response (if NOT configured):
```json
{
  "configured": false,
  "message": "AI environment variables not configured",
  "apiKeySet": false,
  "baseUrlSet": false
}
```

## Test with Real Images

### Option 1: Using the Web UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the browser at `http://localhost:5000`

3. Navigate to `/analysis` page

4. Upload 4 property images:
   - Front view
   - Back view
   - Left side
   - Right side

5. Enter a ZIP code (e.g., `90210`)

6. Click "Analyze My Property"

7. Wait for the AI to process (~30-60 seconds)

8. Review the dashboard showing:
   - Condition scores (1-5) for each component
   - Repair recommendations with materials and DIY steps
   - Cost breakdown (low/high estimates)
   - ROI metrics (current value, projected value, payback period)
   - Before/After visualization

### Option 2: Using cURL (API Test)

Create a test with sample images:

```bash
curl -X POST http://localhost:5000/api/analyze-yard \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg" \
  -F "left=@/path/to/left.jpg" \
  -F "right=@/path/to/right.jpg" \
  -F "zipCode=90210" \
  -F "analysisType=full-exterior"
```

Expected response structure:
```json
{
  "id": "uuid",
  "imageUrl": "data:image/jpeg;base64,...",
  "zipCode": "90210",
  "analysis": {
    "conditionAssessment": [
      {
        "component": "Roof",
        "conditionScore": 3,
        "issues": ["Missing shingles on north side", "Worn flashing around chimney"],
        "confidence": 0.85
      },
      ...
    ],
    "repairs": [
      {
        "component": "Roof",
        "recommendation": "Repair",
        "materials": [
          {
            "name": "Asphalt shingles",
            "quantity": "15 bundles",
            "costRange": "$80-$120 each"
          }
        ],
        "diySteps": [
          "1. Remove damaged shingles",
          "2. Install new underlayment",
          ...
        ],
        "proRecommended": true,
        "costRange": { "low": 3500, "high": 6000 }
      },
      ...
    ],
    "roi": {
      "currentValue": 450000,
      "projectedValue": 475000,
      "rentUplift": 200,
      "roiPercentage": 15,
      "paybackPeriodMonths": 12
    },
    "costBreakdown": [
      { "component": "Roof", "low": 3500, "high": 6000 },
      { "component": "Siding", "low": 2000, "high": 4000 }
    ],
    "totalCost": { "low": 10000, "high": 15000 },
    "estimatedTime": "4-8 weeks DIY, 2-3 weeks pro",
    "beforeImage": "data:image/jpeg;base64,...",
    "afterImage": "data:image/png;base64,..."
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Testing Different Scenarios

### 1. Well-Maintained Property
Upload images of a house in good condition. Expect:
- High condition scores (4-5)
- Fewer repair recommendations
- Lower total costs
- Focus on minor improvements

### 2. Property Needing Work
Upload images with visible issues. Expect:
- Lower condition scores (2-3)
- More comprehensive repair list
- Higher costs but also higher ROI
- Mix of DIY and pro recommendations

### 3. Different ZIP Codes
Test with various ZIP codes to verify regional pricing:
- High-cost area (e.g., `94102` - San Francisco)
- Medium-cost area (e.g., `30301` - Atlanta)
- Low-cost area (e.g., `73301` - Austin suburbs)

## Monitoring and Debugging

### Check Console Logs
When testing, watch the server console for:
```
Starting analysis for ZIP code: 90210
Analysis type: full-exterior
Files received: [ 'front', 'back', 'left', 'right' ]
Calling AI analysis...
AI analysis complete
Analysis saved to database: abc-123-def
```

### Common Issues and Solutions

**Issue**: "AI environment variables not configured"
- **Solution**: Check `.env` file has both `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`

**Issue**: "No response from AI"
- **Solution**: Verify API key is valid and has sufficient credits
- Check network connectivity to the AI provider

**Issue**: Image generation fails
- **Solution**: Some providers don't support image editing. Use OpenAI or skip image generation temporarily

**Issue**: Database errors
- **Solution**: Run `npm run db:push` to ensure schema is up to date

## Performance Notes

- **Analysis time**: 30-60 seconds depending on:
  - Number of images uploaded
  - AI provider response time
  - Whether image generation is enabled

- **Cost per analysis** (using OpenAI):
  - Text analysis (GPT-4o): ~$0.05-0.10
  - Image generation (DALL-E 2): ~$0.02
  - **Total**: ~$0.07-0.12 per analysis

- **Cost optimization**:
  - Use `gpt-3.5-turbo` instead of `gpt-4o` for development
  - Skip image generation during testing
  - Use Groq for free text analysis

## Next Steps After Successful Test

1. ✅ Verify all dashboard sections display correctly
2. ✅ Test with various property types and conditions
3. ✅ Validate cost estimates are reasonable for different regions
4. ✅ Check that ROI calculations make sense
5. ✅ Ensure before/after images are generated successfully
6. Deploy to production with environment variables set
