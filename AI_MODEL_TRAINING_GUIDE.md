# 🤖 AI Model Training Guide - Civic Issue Classification

## Overview
This guide explains how to train a deep learning model to automatically classify civic issues from images using your dataset of 9,675+ images.

## 📊 Dataset Structure

Your dataset is located at: `/server/datasets/data-20251026T073650Z-1-001/data/`

### Categories:

**Road Issues** (4,567 images):
- Pothole Issues
- Damaged Road issues
- Broken Road Sign Issues
- Illegal Parking Issues
- Mixed Issues

**Public Cleanliness + Environmental Issues** (5,108 images):
- Littering Garbage on Public Places Issues
- Vandalism Issues

**Total: 9,675 images**

## 🚀 Quick Start

### Step 1: Install Python Dependencies

```bash
cd server/ai
pip install -r requirements.txt
```

Or using a virtual environment (recommended):

```bash
cd server/ai
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Train the Model

Basic training (recommended):
```bash
python trainModel.py
```

Advanced options:
```bash
# Train for more epochs
python trainModel.py --epochs 100

# Adjust batch size
python trainModel.py --batch-size 64

# Custom learning rate
python trainModel.py --learning-rate 0.0001

# Train from scratch (no transfer learning)
python trainModel.py --no-pretrained
```

### Step 3: Monitor Training

The training process will:
1. ✅ Analyze your dataset structure
2. ✅ Create data augmentation pipeline
3. ✅ Build CNN model with transfer learning (MobileNetV2)
4. ✅ Train in 2 phases (Road Issues → Cleanliness Issues)
5. ✅ Save best model automatically
6. ✅ Generate training plots
7. ✅ Create TensorBoard logs

**View TensorBoard** (optional):
```bash
tensorboard --logdir=server/ai/models/logs
```

## 📁 Output Files

After training, you'll find:

```
server/ai/models/
├── civic_issue_classifier/          # SavedModel format (production)
├── civic_issue_classifier_best.h5   # Best model checkpoint
├── civic_issue_classifier_final.h5  # Final trained model
├── model_metadata.json              # Model configuration
├── training_history.png             # Training plots
└── logs/                            # TensorBoard logs
```

## 🎯 Model Architecture

### Transfer Learning (Default)
- **Base Model**: MobileNetV2 (pre-trained on ImageNet)
- **Input Size**: 224x224 pixels
- **Architecture**:
  - MobileNetV2 base (frozen initially)
  - Global Average Pooling
  - Dense layers: 512 → 256 → num_classes
  - Dropout for regularization
  - Softmax activation

### Training Strategy
1. **Data Augmentation**:
   - Rotation (±20°)
   - Width/Height shift (20%)
   - Shear transformation
   - Zoom (20%)
   - Horizontal flip

2. **Optimization**:
   - Adam optimizer
   - Categorical cross-entropy loss
   - Learning rate reduction on plateau
   - Early stopping (patience=10)

3. **Two-Phase Training**:
   - Phase 1: Road Issues (25 epochs)
   - Phase 2: Cleanliness Issues (25 epochs)

## 🔍 Testing the Model

Test a single image:
```bash
python predictModel.py /path/to/test/image.jpg
```

Example output:
```
🎯 PRIMARY PREDICTION:
   Category: Pothole Issues
   Confidence: 94.52%
   Department: roads_infrastructure

📊 TOP 3 PREDICTIONS:
   1. Pothole Issues (94.52%) → roads_infrastructure
   2. Damaged Road issues (3.21%) → roads_infrastructure
   3. Mixed Issues (1.15%) → roads_infrastructure
```

## 🔗 Integration with Backend

The model is automatically integrated with your Node.js backend through `/server/services/aiModelService.js`.

### Usage in Your Code:

```javascript
const aiModelService = require('./services/aiModelService');

// Check if model is available
const isAvailable = await aiModelService.isModelAvailable();

// Make prediction
const result = await aiModelService.predictImage('/path/to/image.jpg');

if (result.success) {
  console.log('Category:', result.category);
  console.log('Confidence:', result.confidence);
  console.log('Department:', result.department);
}
```

## 📈 Expected Performance

With 9,675 images:
- **Training Accuracy**: 90-95%
- **Validation Accuracy**: 85-92%
- **Training Time**: 
  - With GPU: 30-60 minutes
  - CPU only: 2-4 hours

## 🎛️ Hyperparameter Tuning

### Increase Accuracy:
```bash
# More epochs + lower learning rate
python trainModel.py --epochs 100 --learning-rate 0.0001
```

### Faster Training:
```bash
# Larger batch size (requires more RAM)
python trainModel.py --batch-size 64 --epochs 30
```

### From Scratch:
```bash
# No transfer learning (longer training)
python trainModel.py --no-pretrained --epochs 100
```

## 🐛 Troubleshooting

### Issue: Out of Memory
**Solution**: Reduce batch size
```bash
python trainModel.py --batch-size 16
```

### Issue: Model not found
**Solution**: Ensure training completed successfully and check `server/ai/models/` directory

### Issue: Low accuracy
**Solutions**:
1. Train for more epochs
2. Adjust learning rate
3. Check dataset quality
4. Use data augmentation (already enabled)

### Issue: Python not found
**Solution**: Install Python 3.8+ and TensorFlow
```bash
python3 --version  # Should be 3.8 or higher
pip install tensorflow
```

## 🔄 Retraining the Model

To retrain with new data:
1. Add new images to appropriate category folders
2. Run training script again:
```bash
python trainModel.py
```

The model will automatically:
- Detect new images
- Retrain from scratch
- Save new model (overwrites old one)

## 📊 Model Evaluation

### View Training History:
Check `server/ai/models/training_history.png` for:
- Accuracy curves
- Loss curves
- Training vs Validation performance

### TensorBoard (Advanced):
```bash
tensorboard --logdir=server/ai/models/logs
# Open http://localhost:6006 in browser
```

## 🎯 Category to Department Mapping

The model automatically maps predictions to departments:

| Category | Department |
|----------|-----------|
| Pothole Issues | roads_infrastructure |
| Damaged Road issues | roads_infrastructure |
| Broken Road Sign Issues | traffic_management |
| Illegal Parking Issues | traffic_management |
| Littering Garbage | sanitation_waste |
| Vandalism Issues | public_property |
| Mixed Issues | roads_infrastructure |

## 🚀 Production Deployment

### Option 1: Local Inference
- Model runs on your server
- Python process spawned for predictions
- Already integrated in `aiModelService.js`

### Option 2: API Service
- Deploy model as separate microservice
- Use Flask/FastAPI
- Call via HTTP requests

### Option 3: TensorFlow Serving
- Production-grade model serving
- High performance
- Scalable

## 📝 Notes

1. **GPU Recommended**: Training is much faster with GPU (CUDA-enabled)
2. **Disk Space**: Model files ~100-200 MB
3. **RAM**: Minimum 8GB recommended for training
4. **Dataset**: Keep original dataset intact for retraining

## 🎓 Next Steps

1. ✅ Train the model: `python trainModel.py`
2. ✅ Test predictions: `python predictModel.py test_image.jpg`
3. ✅ Integrate with your report submission flow
4. ✅ Monitor accuracy and retrain as needed
5. ✅ Collect user feedback to improve dataset

## 🤝 Support

For issues or questions:
1. Check TensorFlow documentation
2. Review training logs
3. Inspect `model_metadata.json` for configuration
4. Test with sample images from dataset

---

**Happy Training! 🎉**
