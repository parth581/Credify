# InsightFace Setup Guide for Face Comparison

This guide will help you set up InsightFace for face comparison in your Credify application.

## What is InsightFace?

InsightFace is a state-of-the-art face recognition library that provides highly accurate face embeddings for comparison. It's specifically designed for face recognition tasks and is much more accurate than general vision models.

## Installation Steps

### 1. Install Python (if not already installed)

**Check if Python is installed:**
```bash
python --version
# or
python3 --version
```

**If not installed:**
- **Windows**: Download from https://www.python.org/downloads/
- **Mac**: Usually pre-installed, or use `brew install python3`
- **Linux**: `sudo apt-get install python3 python3-pip`

### 2. Navigate to the Face Service Directory

```bash
cd server/face_service
```

### 3. Create a Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Required Packages

```bash
pip install -r requirements.txt
```

This will install:
- `insightface` - The face recognition library
- `onnxruntime` - Required for running InsightFace models
- `pillow` - For image processing
- `numpy` - For numerical operations

**Note:** The first time you run the script, InsightFace will automatically download the `buffalo_l` model (about 200MB). This happens automatically, so just wait for it to complete.

### 5. Test the Installation

Test that everything is working:

```bash
python face_comparison.py
```

You should see the model loading. If you get an error, make sure all packages are installed correctly.

### 6. Verify Python is Accessible from Node.js

The Next.js API will call Python using the system's Python command. Make sure Python is in your PATH:

**Windows:**
- Check if `python` command works in Command Prompt
- If not, add Python to your system PATH during installation

**Mac/Linux:**
- Usually `python3` is available
- You may need to create a symlink: `sudo ln -s /usr/bin/python3 /usr/bin/python`

## How It Works

1. **Model Loading**: When the Python script runs, it loads the `buffalo_l` InsightFace model (auto-downloads on first run)
2. **Face Detection**: Both images are analyzed to detect faces
3. **Embedding Extraction**: 512-dimensional face embeddings are extracted from each detected face
4. **Similarity Calculation**: Cosine similarity is calculated between the two embeddings
5. **Result**: Returns similarity percentage (0-100%) and match status

## Model Information

- **Model Name**: `buffalo_l` (recommended by InsightFace)
- **Model Size**: ~200MB (auto-downloaded on first run)
- **Embedding Dimension**: 512
- **Accuracy**: Very high for face recognition tasks
- **Speed**: Fast on CPU, even faster on GPU

## Configuration

The Python service uses:
- **CPU Mode**: `ctx_id=-1` (works on all systems)
- **GPU Mode**: `ctx_id=0` (if you have CUDA/GPU available)

To use GPU, you'll need:
- CUDA installed
- cuDNN installed
- ONNX Runtime GPU version: `pip install onnxruntime-gpu`

## Troubleshooting

### Python not found
- Make sure Python is installed and in your PATH
- Try using `python3` instead of `python`
- On Windows, you may need to add Python to PATH manually

### Module not found errors
- Make sure you're in the virtual environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
- Reinstall packages: `pip install -r requirements.txt`

### Model download fails
- Check your internet connection
- The model downloads to `~/.insightface/models/` (or `C:\Users\YourName\.insightface\models\` on Windows)
- You can manually download from: https://github.com/deepinsight/insightface/releases

### Out of memory errors
- Close other applications
- The model needs about 2-3GB RAM
- Consider using a smaller model if needed (modify `buffalo_l` to `buffalo_s` in the script)

### Slow performance
- First run is slower (model loading)
- Subsequent runs are faster
- Consider using GPU if available

## System Requirements

- **Python**: 3.8 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: ~500MB for model and dependencies
- **OS**: Windows, macOS, or Linux

## Next Steps

After completing this setup:
1. Restart your Next.js dev server
2. Test the face comparison feature
3. The first request may take 10-20 seconds while the model loads
4. Subsequent requests should be faster (2-5 seconds)

## File Structure

```
server/
  face_service/
    face_comparison.py    # Main Python script
    requirements.txt      # Python dependencies
    venv/                 # Virtual environment (created by you)
```

## API Integration

The Next.js API route (`app/api/face-comparison/route.ts`) will:
1. Receive base64-encoded images from the frontend
2. Call the Python script with the images
3. Parse the JSON response
4. Return similarity score and match status

No API keys or external services needed - everything runs locally!
