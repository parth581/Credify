"""
Face Comparison Service using InsightFace
Compares two face images and returns similarity score
"""

import sys
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import insightface
from insightface.app import FaceAnalysis
import onnxruntime
import os

# Suppress InsightFace and ONNX Runtime verbose output
os.environ['INSIGHTFACE_VERBOSE'] = '0'
import warnings
warnings.filterwarnings('ignore')

# Redirect InsightFace output to stderr during initialization
# This ensures only JSON goes to stdout
_original_stdout = sys.stdout
sys.stdout = sys.stderr

try:
    # Initialize FaceAnalysis app
    # buffalo_l is the recommended model for face recognition
    app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=-1)  # -1 = CPU, 0 = GPU (if available)
finally:
    # Restore stdout
    sys.stdout = _original_stdout

def decode_base64_image(base64_string):
    """Decode base64 string to PIL Image"""
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

def get_face_embedding(image_array):
    """Extract face embedding from image"""
    # Detect faces and get embeddings
    faces = app.get(image_array)
    
    if len(faces) == 0:
        return None
    
    # Get the first (largest) face
    face = faces[0]
    
    # Return the embedding (512-dimensional vector)
    return face.embedding

def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    # Normalize embeddings
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    # Calculate cosine similarity
    similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
    
    return float(similarity)

def compare_faces(aadhaar_image_base64, live_image_base64):
    """Compare two face images and return similarity score"""
    try:
        # Decode images
        aadhaar_image = decode_base64_image(aadhaar_image_base64)
        live_image = decode_base64_image(live_image_base64)
        
        # Extract face embeddings
        aadhaar_embedding = get_face_embedding(aadhaar_image)
        live_embedding = get_face_embedding(live_image)
        
        if aadhaar_embedding is None:
            return {
                "success": False,
                "error": "No face detected in Aadhaar image. Please ensure the image clearly shows your face."
            }
        
        if live_embedding is None:
            return {
                "success": False,
                "error": "No face detected in live image. Please ensure your face is clearly visible in the camera."
            }
        
        # Calculate similarity
        similarity = cosine_similarity(aadhaar_embedding, live_embedding)
        
        # Convert similarity (-1 to 1) to percentage (0-100%)
        # InsightFace embeddings typically give similarity in range 0.3-1.0 for same person
        # We normalize to 0-100% range
        similarity_percent = max(0, min(100, ((similarity + 1) / 2) * 100))
        
        # Threshold for face matching (typically 0.6-0.7 for InsightFace)
        # We use 75% as threshold (which corresponds to ~0.5 cosine similarity)
        threshold = 75
        is_match = similarity_percent >= threshold
        
        return {
            "success": True,
            "similarity": round(similarity_percent, 2),
            "threshold": threshold,
            "match": is_match,
            "raw_similarity": round(similarity, 4)  # Raw cosine similarity for debugging
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Face comparison failed: {str(e)}"
        }

def main():
    """Main function to handle command-line input"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        aadhaar_image = input_data.get("aadhaarFaceImage")
        live_image = input_data.get("liveImage")
        
        if not aadhaar_image or not live_image:
            result = {
                "success": False,
                "error": "Both images are required"
            }
        else:
            # Suppress any output during face comparison
            # Redirect stdout to stderr temporarily to avoid mixing with JSON
            _temp_stdout = sys.stdout
            sys.stdout = sys.stderr
            try:
                result = compare_faces(aadhaar_image, live_image)
            finally:
                sys.stdout = _temp_stdout
        
        # Output result as JSON to stdout (this is the only thing that should go to stdout)
        print(json.dumps(result), file=sys.stdout)
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Error processing request: {str(e)}"
        }
        print(json.dumps(error_result), file=sys.stdout)
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
