# Gemini API Setup Guide

## Issue
Your Gemini API key has been suspended. You need to get a new API key.

## Steps to Get a New Gemini API Key

### Step 1: Go to Google AI Studio
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account

### Step 2: Create API Key
1. Click on "Get API key" button (top right)
2. Click "Create API key in new project" (or select existing project)
3. Copy the API key immediately (starts with `AIza...`)

### Step 3: Add to Environment Variables
Add your new Gemini API key to `.env.local`:

```env
# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_new_api_key_here
```

**Important:**
- Replace `your_new_api_key_here` with your actual API key
- The key should start with `AIza`
- Never commit this key to Git
- Keep it secure

### Step 4: Restart Dev Server
After adding the key:
1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. The new API key will be loaded

## Troubleshooting

### Error: "API key has been suspended"
- Your API key was suspended (likely due to misuse or policy violation)
- Get a new API key following the steps above
- Make sure to follow Google's usage policies

### Error: "Invalid or missing Gemini API key"
- Check that `NEXT_PUBLIC_GEMINI_API_KEY` is in `.env.local`
- Make sure the key starts with `AIza`
- Restart your dev server after adding the key

### Error: "Quota exceeded"
- You've hit the free tier limit
- Check your usage in [Google Cloud Console](https://console.cloud.google.com/)
- Consider upgrading your plan if needed

## Usage Policies
- Don't share your API key publicly
- Follow Google's AI usage policies
- Don't use for prohibited content
- Respect rate limits

## Security Notes
- API key is exposed to client-side (NEXT_PUBLIC_ prefix)
- This is necessary for client-side Gemini calls
- Consider using server-side API route for production if security is a concern
