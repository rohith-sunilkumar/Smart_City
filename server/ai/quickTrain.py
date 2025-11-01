#!/usr/bin/env python3
"""
Quick Training Script - Faster training for testing
Uses smaller model and fewer epochs for quick validation
"""

import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(__file__))

from trainModel import *

# Override config for quick training
class QuickConfig(Config):
    EPOCHS = 10  # Reduced from 50
    BATCH_SIZE = 64  # Larger batches
    IMG_SIZE = (128, 128)  # Smaller images for faster processing

# Replace Config with QuickConfig
Config = QuickConfig

def quick_train():
    print("=" * 80)
    print("⚡ QUICK TRAINING MODE - For Testing Only")
    print("=" * 80)
    print("⚠️  This uses reduced settings for faster training")
    print("   - Epochs: 10 (instead of 50)")
    print("   - Image size: 128x128 (instead of 224x224)")
    print("   - Batch size: 64 (instead of 32)")
    print("")
    print("For production model, use: python trainModel.py")
    print("=" * 80)
    
    # Check GPU
    print(f"\n🖥️  GPU Available: {tf.config.list_physical_devices('GPU')}")
    print(f"📦 TensorFlow Version: {tf.__version__}")
    
    # Analyze dataset
    dataset_info = create_dataset_structure()
    
    # Create data generators
    train_generators, val_generators, class_indices = create_data_generators()
    
    # Build smaller model
    num_classes = len(class_indices)
    print(f"\n🏗️  Building lightweight model for {num_classes} classes...")
    
    # Use smaller custom CNN (no transfer learning for speed)
    model = keras.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(*Config.IMG_SIZE, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model = compile_model(model)
    
    print("\n📋 Model Summary:")
    model.summary()
    
    # Create callbacks
    callbacks = create_callbacks()
    
    # Quick training
    print("\n🚀 Starting quick training...")
    history_road, history_clean = train_model(model, train_generators, val_generators, callbacks)
    
    # Save model
    save_model_artifacts(model, class_indices)
    
    # Plot history
    plot_training_history(history_road, history_clean)
    
    print("\n" + "=" * 80)
    print("✅ QUICK TRAINING COMPLETED!")
    print("=" * 80)
    print("\n⚠️  Note: This is a quick test model.")
    print("For better accuracy, run: python trainModel.py")

if __name__ == '__main__':
    quick_train()
