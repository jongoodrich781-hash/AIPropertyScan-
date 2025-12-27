# Environment Setup Guide

## Required Environment Variables

### 1. Database Configuration
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
Get this from your Neon, Supabase, or other PostgreSQL provider.

### 2. OpenAI API Configuration

You have multiple options for the AI provider. The code uses OpenAI-compatible APIs, so you can choose from:

#### Option A: OpenAI (Recommended for best quality)
```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
```
- Sign up at https://platform.openai.com/
- Create an API key
- Models used: `gpt-4o` for analysis, `dall-e-2` for image generation

#### Option B: Groq (Fast and free tier available)
```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.groq.com/openai/v1
AI_INTEGRATIONS_OPENAI_API_KEY=gsk_...
```
- Sign up at https://console.groq.com/
- Free tier includes generous limits
- Note: Groq doesn't support image generation (dall-e), so you'll need to handle that separately

#### Option C: DeepSeek (Cost-effective)
```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.deepseek.com
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
```
- Sign up at https://platform.deepseek.com/
- Very cost-effective pricing

#### Option D: AI/ML API (Multiple models)
```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.aimlapi.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=...
```
- Access to multiple AI providers through one API

### 3. Stripe Configuration (for payments)
```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Sign up at https://stripe.com/
- Get keys from https://dashboard.stripe.com/apikeys
- Set up webhooks at https://dashboard.stripe.com/webhooks

### 4. Replit Configuration (auto-configured in Replit)
These are automatically set when running in Replit:
```bash
REPLIT_DOMAINS=your-app.repl.co
REPL_ID=...
```

## Setup Steps

1. **Copy the example env file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials**
   Edit `.env` and add your actual API keys and configuration

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Important Security Notes

⚠️ **NEVER commit `.env` files to git!**

The `.gitignore` file already excludes `.env`, but always double-check before committing.

## Testing the AI Workflow

Once configured, you can test the AI workflow by:

1. Navigate to `/analysis` page
2. Upload 4 property photos (front, back, left, right)
3. Enter a ZIP code
4. Click "Analyze My Property"
5. The AI will:
   - Assess condition of all components
   - Generate repair recommendations with materials and DIY steps
   - Calculate ROI and value increase
   - Generate before/after visualization

## Troubleshooting

### "No response from AI" error
- Check that `AI_INTEGRATIONS_OPENAI_API_KEY` is set correctly
- Verify your API key has sufficient credits/quota
- Check the base URL matches your provider

### Image generation fails
- Some providers (like Groq) don't support image generation
- Use OpenAI or a provider that supports DALL-E
- Alternatively, update `ai.ts` to use a different image generation service

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure the database is accessible from your environment
- Check that migrations have been run

## Cost Optimization Tips

1. **Use cheaper models for development**
   - Replace `gpt-4o` with `gpt-3.5-turbo` in `ai.ts` for testing
   - Disable image generation during development

2. **Use Groq for text analysis**
   - Fast and has generous free tier
   - Good for testing the workflow

3. **Cache results**
   - The app already saves analyses to the database
   - Reuse saved analyses instead of re-analyzing

## Next Steps

After configuration:
- Test the upload and analysis flow
- Customize the AI prompts in `ai.ts` for your specific needs
- Adjust pricing tiers in `shared/schema.ts`
- Set up Stripe products and prices
