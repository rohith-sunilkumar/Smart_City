# 🚀 Install & Train AI Model - Step by Step

## ✅ Your Dataset is Ready!

**Total Images**: 9,675
- Road Issues: 6,115 images
- Cleanliness Issues: 3,560 images

## 📋 Installation Steps

### Step 1: Install Python Dependencies

```bash
cd server/ai
pip install -r requirements.txt
```

**What gets installed**:
- TensorFlow 2.15.0 (deep learning framework)
- NumPy (numerical computing)
- Pillow (image processing)
- Matplotlib (plotting)
- scikit-learn (machine learning utilities)

### Step 2: Verify Installation

```bash
python3 test_setup.py
```

You should see all tests pass ✅

### Step 3: Train the Model

**Option A - Automated (Recommended)**:
```bash
./train.sh
```

**Option B - Manual**:
```bash
python3 trainModel.py
```

**Option C - Quick Test (10 epochs)**:
```bash
python3 quickTrain.py
```

## ⏱️ Training Time

- **With GPU**: 30-60 minutes
- **CPU only**: 2-4 hours

## 📊 What Happens During Training

1. **Dataset Analysis** - Scans all 9,675 images
2. **Data Augmentation** - Creates variations (rotation, zoom, flip)
3. **Model Building** - MobileNetV2 with transfer learning
4. **Phase 1 Training** - Road Issues (25 epochs)
5. **Phase 2 Training** - Cleanliness Issues (25 epochs)
6. **Model Saving** - Best model automatically saved
7. **Plots Generated** - Training history visualization

## 🎯 Expected Output

```
server/ai/models/
├── civic_issue_classifier/          # Production model
├── civic_issue_classifier_best.h5   # Best checkpoint
├── civic_issue_classifier_final.h5  # Final model
├── model_metadata.json              # Configuration
├── training_history.png             # Training plots
└── logs/                            # TensorBoard logs
```

## 🧪 Test Your Trained Model

```bash
# Test with an image from your dataset
python3 predictModel.py ../datasets/data-20251026T073650Z-1-001/data/Road\ Issues/Pothole\ Issues/[any-image].png
```

**Example Output**:
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

## 🔗 Integration (Already Done!)

The model is already integrated with your Node.js backend via:
- `/server/services/aiModelService.js`

Your app can now:
- Automatically classify civic issues from images
- Route reports to correct departments
- Provide confidence scores

## 📈 Expected Accuracy

- **Training Accuracy**: 90-95%
- **Validation Accuracy**: 85-92%
- **7 Categories**: Potholes, Damaged Roads, Broken Signs, Illegal Parking, Littering, Vandalism, Mixed

## 🎓 Training Commands Reference

```bash
# Default training (recommended)
python3 trainModel.py

# More epochs for better accuracy
python3 trainModel.py --epochs 100

# Larger batch size (faster, needs more RAM)
python3 trainModel.py --batch-size 64

# Custom learning rate
python3 trainModel.py --learning-rate 0.0001

# Train from scratch (no transfer learning)
python3 trainModel.py --no-pretrained
```

## 🐛 Troubleshooting

### "Out of memory"
```bash
python3 trainModel.py --batch-size 16
```

### "Training too slow"
- Use GPU if available (30x faster)
- Or use `python3 quickTrain.py` for testing

### "Module not found"
```bash
pip install -r requirements.txt
```

## 📚 Documentation

- **Complete Guide**: `AI_MODEL_TRAINING_GUIDE.md`
- **Quick Reference**: `server/ai/README.md`
- **Summary**: `AI_TRAINING_SUMMARY.md`

## ✅ Ready to Start!

```bash
cd server/ai
./train.sh
```

That's it! Your AI model will be trained and ready to classify civic issues automatically. 🎉
