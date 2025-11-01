#!/bin/bash

# Civic Issue Classification Model - Training Script
# This script sets up the environment and trains the model

echo "=========================================="
echo "🤖 AI Model Training - Civic Issues"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check TensorFlow installation
python3 -c "import tensorflow as tf; print('✅ TensorFlow version:', tf.__version__)"

# Check GPU availability
echo ""
echo "🖥️  Checking GPU availability..."
python3 -c "import tensorflow as tf; gpus = tf.config.list_physical_devices('GPU'); print('✅ GPUs available:', len(gpus)) if gpus else print('⚠️  No GPU found, training will use CPU (slower)')"

echo ""
echo "=========================================="
echo "🚀 Starting Model Training"
echo "=========================================="
echo ""

# Train the model
python3 trainModel.py "$@"

# Check if training was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Training completed successfully!"
    echo "=========================================="
    echo ""
    echo "📁 Model saved in: ai/models/"
    echo "📊 View training plots: ai/models/training_history.png"
    echo "🧪 Test model: python3 predictModel.py <image_path>"
    echo ""
else
    echo ""
    echo "❌ Training failed. Check the error messages above."
    exit 1
fi
