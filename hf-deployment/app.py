"""
Face Comparison Service using InsightFace - Hugging Face Spaces Deployment
Compares two face images and returns similarity score
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from insightface.app import FaceAnalysis
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress InsightFace verbose output
os.environ['INSIGHTFACE_VERBOSE'] = '0'
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(
    title="Credify Face Comparison API",
    description="Face comparison using InsightFace for KYC verification",
    version="1.0.0"
)

# Initialize model (loads once at startup)
logger.info("Loading InsightFace model...")
face_app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=-1)  # -1 = CPU
logger.info("Model loaded successfully!")

# Request/Response models
class FaceComparisonRequest(BaseModel):
    aadhaarFaceImage: str  # base64 encoded image
    liveImage: str  # base64 encoded image

class FaceComparisonResponse(BaseModel):
    success: bool
    similarity: float = None
    match: bool = None
    threshold: int = None
    raw_similarity: float = None
    error: str = None

def decode_base64_image(base64_string: str):
    """Decode base64 string to PIL Image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        return np.array(image)
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        raise ValueError(f"Invalid image format: {str(e)}")

def get_face_embedding(image_array):
    """Extract face embedding from image"""
    try:
        faces = face_app.get(image_array)
        
        if len(faces) == 0:
            return None
        
        # Get the first (largest) face
        face = faces[0]
        
        # Return the 512-dimensional embedding
        return face.embedding
    except Exception as e:
        logger.error(f"Error extracting face embedding: {e}")
        raise

def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    try:
        # Normalize embeddings
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
        
        return float(similarity)
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        raise

@app.post("/compare", response_model=FaceComparisonResponse)
async def compare_faces(request: FaceComparisonRequest):
    """
    Compare two face images and return similarity score
    
    - **aadhaarFaceImage**: Base64 encoded Aadhaar/ID face image
    - **liveImage**: Base64 encoded live captured face image
    
    Returns:
    - **success**: Whether comparison succeeded
    - **similarity**: Similarity percentage (0-100)
    - **match**: Whether faces match (based on threshold)
    - **threshold**: Matching threshold used
    - **error**: Error message if any
    """
    try:
        logger.info("Starting face comparison...")
        
        # Decode images
        aadhaar_image = decode_base64_image(request.aadhaarFaceImage)
        live_image = decode_base64_image(request.liveImage)
        
        # Extract face embeddings
        logger.info("Extracting embeddings from Aadhaar image...")
        aadhaar_embedding = get_face_embedding(aadhaar_image)
        
        logger.info("Extracting embeddings from live image...")
        live_embedding = get_face_embedding(live_image)
        
        # Validate embeddings
        if aadhaar_embedding is None:
            logger.warning("No face detected in Aadhaar image")
            return FaceComparisonResponse(
                success=False,
                error="No face detected in Aadhaar image. Please ensure the image clearly shows your face."
            )
        
        if live_embedding is None:
            logger.warning("No face detected in live image")
            return FaceComparisonResponse(
                success=False,
                error="No face detected in live image. Please ensure your face is clearly visible in the camera."
            )
        
        # Calculate similarity
        logger.info("Calculating similarity...")
        similarity = cosine_similarity(aadhaar_embedding, live_embedding)
        
        # Convert similarity (-1 to 1) to percentage (0-100%)
        # InsightFace embeddings typically give similarity in range 0.3-1.0 for same person
        similarity_percent = max(0, min(100, ((similarity + 1) / 2) * 100))
        
        # Threshold for face matching (typically 0.6-0.7 for InsightFace)
        # We use 75% as threshold (which corresponds to ~0.5 cosine similarity)
        threshold = 75
        is_match = similarity_percent >= threshold
        
        logger.info(f"Comparison complete: {similarity_percent}% match={is_match}")
        
        return FaceComparisonResponse(
            success=True,
            similarity=round(similarity_percent, 2),
            threshold=threshold,
            match=is_match,
            raw_similarity=round(similarity, 4)  # Raw cosine similarity for debugging
        )
        
    except Exception as e:
        logger.error(f"Face comparison failed: {e}", exc_info=True)
        return FaceComparisonResponse(
            success=False,
            error=f"Face comparison failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model": "InsightFace buffalo_l",
        "service": "Credify Face Comparison API"
    }

@app.get("/")
async def root():
    """Root endpoint - shows API info"""
    return {
        "name": "Credify Face Comparison API",
        "version": "1.0.0",
        "description": "Face comparison using InsightFace for KYC verification",
        "endpoints": {
            "POST /compare": "Compare two face images",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
