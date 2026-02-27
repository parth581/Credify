# Hugging Face Deployment Guide - InsightFace Model

## Option 1: Hugging Face Spaces (Recommended)

### Step 1: Setup Hugging Face Account
- Sign up at https://huggingface.co
- Create API token: Settings → Access Tokens → Create new token (write access)

### Step 2: Create a Space
- Go to https://huggingface.co/spaces
- Click "Create new Space"
- Choose name: `credify-face-comparison`
- SDK: **Docker** (most flexible)
- License: MIT

### Step 3: File Structure in Space
```
credify-face-comparison/
├── Dockerfile
├── requirements.txt
├── app.py
└── .gitignore
```

### Step 4: Create `requirements.txt`
```
insightface==0.7.3
onnxruntime==1.16.3
pillow==10.1.0
numpy==1.24.3
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
```

### Step 5: Create `Dockerfile`
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app.py .

# Expose port
EXPOSE 7860

# Run app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### Step 6: Create `app.py` (FastAPI Server)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from insightface.app import FaceAnalysis
import json

app = FastAPI()

# Initialize model (loads once)
face_app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=-1)

class FaceComparisonRequest(BaseModel):
    aadhaarFaceImage: str  # base64
    liveImage: str  # base64

class FaceComparisonResponse(BaseModel):
    success: bool
    similarity: float = None
    match: bool = None
    threshold: int = None
    error: str = None

def decode_base64_image(base64_string: str):
    """Decode base64 string to PIL Image"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return np.array(image)

def get_face_embedding(image_array):
    """Extract face embedding from image"""
    faces = face_app.get(image_array)
    
    if len(faces) == 0:
        return None
    
    return faces[0].embedding

def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
    return float(similarity)

@app.post("/compare", response_model=FaceComparisonResponse)
async def compare_faces(request: FaceComparisonRequest):
    """Compare two face images"""
    try:
        # Decode images
        aadhaar_image = decode_base64_image(request.aadhaarFaceImage)
        live_image = decode_base64_image(request.liveImage)
        
        # Extract embeddings
        aadhaar_embedding = get_face_embedding(aadhaar_image)
        live_embedding = get_face_embedding(live_image)
        
        if aadhaar_embedding is None:
            return FaceComparisonResponse(
                success=False,
                error="No face detected in Aadhaar image"
            )
        
        if live_embedding is None:
            return FaceComparisonResponse(
                success=False,
                error="No face detected in live image"
            )
        
        # Calculate similarity
        similarity = cosine_similarity(aadhaar_embedding, live_embedding)
        similarity_percent = max(0, min(100, ((similarity + 1) / 2) * 100))
        
        threshold = 75
        is_match = similarity_percent >= threshold
        
        return FaceComparisonResponse(
            success=True,
            similarity=round(similarity_percent, 2),
            threshold=threshold,
            match=is_match
        )
        
    except Exception as e:
        return FaceComparisonResponse(
            success=False,
            error=f"Face comparison failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### Step 7: Deploy to Hugging Face
```bash
cd credify-face-comparison
git add .
git commit -m "Initial deployment"
git push
```

Hugging Face will automatically build and deploy the Docker container. The space URL will be:
`https://huggingface.co/spaces/your-username/credify-face-comparison`

---

## Option 2: Use Hugging Face Inference API (Simplest)

If you want only inference (no custom logic):

1. Go to https://huggingface.co/models and search for face embedding models
2. Use models like:
   - `mixedbread-ai/mxbai-embed-large` (CLIP embeddings)
   - `sentence-transformers/all-MiniLM-L6-v2`

3. Get API key from https://huggingface.co/settings/tokens

4. Use in your Next.js code:
```typescript
const response = await fetch('https://api-inference.huggingface.co/models/your-model', {
  headers: { Authorization: `Bearer ${HF_TOKEN}` },
  method: 'POST',
  body: JSON.stringify({ inputs: base64Image }),
})
```

**Limitation**: These models might not be as specialized for face recognition as InsightFace.

---

## Option 3: Use Replicate API (Alternative)

Deploy InsightFace on Replicate.com:
1. Sign up at https://replicate.com
2. Use existing models or create custom
3. Call via REST API with your API key

Example:
```typescript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: 'model-version-id',
    input: { image1: base64Image1, image2: base64Image2 }
  })
})
```

---

## Recommended: Option 1 (Hugging Face Spaces)

**Why?**
- ✅ Free tier available
- ✅ Full control over code
- ✅ Uses your exact InsightFace setup
- ✅ Easy to scale
- ✅ No monthly costs (free tier)
- ✅ Simple integration with your Next.js app

---

## Integration with Your Next.js App

Once deployed to Hugging Face, replace your current API route with:

```typescript
// app/api/face-comparison/route.ts
import { NextRequest, NextResponse } from "next/server"

const HF_SPACE_URL = "https://huggingface.co/spaces/your-username/credify-face-comparison"
const HF_API_URL = `${HF_SPACE_URL}/call/compare` // Adjust if using custom endpoint

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aadhaarFaceImage, liveImage } = body

    if (!aadhaarFaceImage || !liveImage) {
      return NextResponse.json(
        { success: false, error: "Both images are required" },
        { status: 400 }
      )
    }

    // Call Hugging Face Space
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aadhaarFaceImage,
        liveImage
      })
    })

    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("Face comparison error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

---

## Benefits of Cloud Deployment

1. **Speed**: No local model loading
2. **Scalability**: Handles multiple concurrent requests
3. **No Dependencies**: Your client machine doesn't need Python/InsightFace
4. **Maintenance**: Hugging Face handles infrastructure
5. **Cost**: Free tier includes decent usage limits

---

## Next Steps

1. Choose Option 1 (Hugging Face Spaces) for best experience
2. Create Hugging Face account
3. Deploy files (can do via web UI or git)
4. Update your Next.js API route to call the space
5. Test with your app
