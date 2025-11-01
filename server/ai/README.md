# 🤖 AI Model - Civic Issue Classification

Deep learning model for automatic classification of civic issues from images.

## 📊 Dataset

- **Total Images**: 9,675
- **Categories**: 7 (Potholes, Damaged Roads, Broken Signs, Illegal Parking, Littering, Vandalism, Mixed)
- **Location**: `../datasets/data-20251026T073650Z-1-001/data/`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train Model

**Full Training** (recommended for production):
```bash
python trainModel.py
```

**Quick Training** (for testing):
```bash
python quickTrain.py
```

**With Options**:
```bash
# More epochs for better accuracy
python trainModel.py --epochs 100

# Larger batch size (requires more RAM)
python trainModel.py --batch-size 64

# Custom learning rate
python trainModel.py --learning-rate 0.0001
```

### 3. Test Predictions

```bash
python predictModel.py /path/to/image.jpg
```

## 📁 Files

- **trainModel.py** - Main training script with transfer learning
- **quickTrain.py** - Fast training for testing (10 epochs, smaller model)
- **predictModel.py** - Inference script for predictions
- **train.sh** - Automated setup and training script
- **requirements.txt** - Python dependencies

## 🏗️ Model Architecture

### Default (Transfer Learning)
- **Base**: MobileNetV2 (pre-trained on ImageNet)
- **Input**: 224x224 RGB images
- **Layers**: 
  - MobileNetV2 base
  - Global Average Pooling
  - Dense(512) + BatchNorm + Dropout(0.5)
  - Dense(256) + BatchNorm + Dropout(0.3)
  - Dense(num_classes) + Softmax

### Training Strategy
- **Optimizer**: Adam (lr=0.001)
- **Loss**: Categorical Cross-Entropy
- **Data Augmentation**: Rotation, shift, zoom, flip
- **Callbacks**: Early stopping, LR reduction, model checkpoint

## 📈 Expected Results

- **Training Accuracy**: 90-95%
- **Validation Accuracy**: 85-92%
- **Training Time**: 
  - GPU: 30-60 minutes
  - CPU: 2-4 hours

## 🔗 Integration

The model integrates with Node.js backend via `../services/aiModelService.js`:

```javascript
const aiModelService = require('./services/aiModelService');

// Check availability
const available = await aiModelService.isModelAvailable();

// Make prediction
const result = await aiModelService.predictImage(imagePath);
console.log(result.category, result.confidence, result.department);
```

## 📊 Output

After training, you'll get:

```
models/
├── civic_issue_classifier/          # SavedModel (production)
├── civic_issue_classifier_best.h5   # Best checkpoint
├── civic_issue_classifier_final.h5  # Final model
├── model_metadata.json              # Configuration
├── training_history.png             # Training plots
└── logs/                            # TensorBoard logs
```

## 🎯 Category → Department Mapping

| Category | Department |
|----------|-----------|
| Pothole Issues | roads_infrastructure |
| Damaged Road issues | roads_infrastructure |
| Broken Road Sign Issues | traffic_management |
| Illegal Parking Issues | traffic_management |
| Littering Garbage | sanitation_waste |
| Vandalism Issues | public_property |
| Mixed Issues | roads_infrastructure |

## 🐛 Troubleshooting

### Out of Memory
```bash
python trainModel.py --batch-size 16
```

### Slow Training
- Use GPU if available
- Reduce image size
- Use quickTrain.py for testing

### Model Not Found
- Ensure training completed
- Check `models/` directory
- Run training script again

## 📚 Documentation

See `../../AI_MODEL_TRAINING_GUIDE.md` for detailed documentation.

## 🔄 Retraining

To retrain with new data:
1. Add images to dataset folders
2. Run `python trainModel.py`
3. Model will automatically detect new images

## 🎓 Tips

1. **Use GPU**: Much faster training (30x speedup)
2. **More Data**: Better accuracy with more training images
3. **Augmentation**: Already enabled for better generalization
4. **Validation**: Always check validation accuracy
5. **TensorBoard**: Monitor training in real-time

## 📝 Notes

- Model files: ~100-200 MB
- Minimum RAM: 8GB recommended
- Python: 3.8+ required
- TensorFlow: 2.15.0

---

**Ready to train? Run: `./train.sh`** 🚀
