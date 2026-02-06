# Hugging Face Setup Guide for Face Comparison

## Overview
This project uses Hugging Face Inference API for face comparison during KYC verification. The system:
1. Uses Gemini to extract and crop face from Aadhaar card
2. Uses Hugging Face model to compare Aadhaar face with live captured image
3. Verifies identity based on similarity threshold (75%)

## Setup Instructions

### Step 1: Create Hugging Face Account
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account (if you don't have one)
3. Verify your email address

### Step 2: Get Your API Token
1. Go to [Hugging Face Settings → Access Tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Name it: `credify-face-comparison` (or any name you prefer)
4. Select **Read** permission (minimum required)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 3: Add Token to Environment Variables
Add your Hugging Face API token to `.env.local`:

```env
# Hugging Face API Configuration
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

**Important:** 
- Never commit this token to Git
- Keep it secure and private
- The token starts with `hf_` prefix

### Step 4: Verify Setup
1. Restart your Next.js dev server after adding the token
2. The API route at `/api/face-comparison` will use this token automatically

## Model Used

The implementation uses **`bingsheng/insightface`** (InsightFace ArcFace) for face recognition:
- **Model Type:** InsightFace ArcFace (face recognition model)
- **Purpose:** Extracts 512-dimensional face embeddings optimized for face verification
- **Comparison Method:** Cosine similarity between face embeddings
- **Threshold:** 75% similarity required for verification
- **Fallback Model:** `deepinsight/insightface` (if primary model is unavailable)

**Why InsightFace?**
- Specifically designed for face recognition and verification
- Provides high accuracy for face matching
- Produces robust embeddings that work well with cosine similarity
- Industry-standard for face verification tasks

## How It Works

1. **Face Extraction (Gemini):**
   - User uploads Aadhaar card image
   - Gemini extracts and crops the face region
   - Face is stored temporarily in memory

2. **Face Comparison (Hugging Face):**
   - User captures live image via camera
   - Both images (Aadhaar face + live face) are sent to Hugging Face API
   - Model extracts features from both images
   - Cosine similarity is calculated
   - If similarity ≥ 75%, verification passes

## API Usage

The face comparison happens via Next.js API route:
- **Endpoint:** `/api/face-comparison`
- **Method:** POST
- **Body:**
  ```json
  {
    "aadhaarFaceImage": "data:image/jpeg;base64,...",
    "liveImage": "data:image/jpeg;base64,..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "similarity": 85.5,
    "match": true,
    "threshold": 75
  }
  ```

## Troubleshooting

### Error: "Hugging Face API key not configured"
- Make sure `HUGGINGFACE_API_KEY` is in `.env.local`
- Restart your dev server after adding the token

### Error: "Model inference failed"
- Check if your Hugging Face token has proper permissions
- Verify the token is valid (not expired)
- Check Hugging Face service status

### Low Similarity Scores
- Ensure good lighting in both images
- Make sure faces are clearly visible
- Try adjusting the threshold in `app/api/face-comparison/route.ts` (currently 75%)

## Cost Considerations

- **Hugging Face Free Tier:** Limited requests per month
- **Upgrade:** If you need more requests, consider upgrading your Hugging Face account
- **Alternative:** You can host your own model for unlimited usage

## Security Notes

- Face images are processed temporarily and not stored permanently
- All API calls are server-side (secure)
- API token should never be exposed to client-side code
