FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for image processing and building wheels
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app.py .

# Expose port (Hugging Face Spaces uses 7860)
EXPOSE 7860

# Run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
