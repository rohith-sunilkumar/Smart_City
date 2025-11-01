#!/usr/bin/env python3
"""
Simple Training Script - Trains on combined dataset
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from datetime import datetime

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.001

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_BASE = os.path.join(SCRIPT_DIR, '..', 'datasets', 'data-20251026T073650Z-1-001', 'data')
MODEL_DIR = os.path.join(SCRIPT_DIR, 'models')

# Create models directory
os.makedirs(MODEL_DIR, exist_ok=True)

# Category mapping
CATEGORY_MAPPING = {
    'Pothole Issues': 'roads_infrastructure',
    'Damaged Road issues': 'roads_infrastructure',
    'Broken Road Sign Issues': 'traffic_management',
    'Illegal Parking Issues': 'traffic_management',
    'Littering Garbage on Public Places Issues': 'sanitation_waste',
    'Vandalism Issues': 'public_property',
    'Mixed Issues': 'roads_infrastructure'
}

print("=" * 80)
print("🎯 SIMPLE CIVIC ISSUE CLASSIFICATION TRAINING")
print("=" * 80)

# Check GPU
print(f"\n🖥️  GPU Available: {tf.config.list_physical_devices('GPU')}")
print(f"📦 TensorFlow Version: {tf.__version__}")

# Create temporary combined dataset directory
print("\n📁 Preparing combined dataset...")
import shutil
import tempfile

temp_dir = tempfile.mkdtemp()
combined_data_dir = os.path.join(temp_dir, 'combined')
os.makedirs(combined_data_dir, exist_ok=True)

# Copy all categories to combined directory
road_path = os.path.join(DATASET_BASE, 'Road Issues')
clean_path = os.path.join(DATASET_BASE, 'Public Cleanliness + Environmental Issues')

total_images = 0
for source_dir in [road_path, clean_path]:
    if os.path.exists(source_dir):
        for category in os.listdir(source_dir):
            src_cat_path = os.path.join(source_dir, category)
            dst_cat_path = os.path.join(combined_data_dir, category)
            
            if os.path.isdir(src_cat_path):
                print(f"   Linking: {category}")
                os.symlink(src_cat_path, dst_cat_path)
                images = [f for f in os.listdir(src_cat_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                total_images += len(images)
                print(f"      → {len(images)} images")

print(f"\n✅ Total images: {total_images}")

# Data generators with augmentation
print("\n🔄 Creating data generators...")

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)

val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    combined_data_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_generator = val_datagen.flow_from_directory(
    combined_data_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

num_classes = len(train_generator.class_indices)
print(f"✅ Training samples: {train_generator.samples}")
print(f"✅ Validation samples: {val_generator.samples}")
print(f"✅ Number of classes: {num_classes}")
print(f"✅ Classes: {list(train_generator.class_indices.keys())}")

# Build model with transfer learning
print(f"\n🏗️  Building model...")

base_model = MobileNetV2(
    input_shape=(*IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(512, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
)

print("✅ Model compiled")
print("\n📋 Model Summary:")
model.summary()

# Callbacks
callbacks = [
    ModelCheckpoint(
        os.path.join(MODEL_DIR, 'civic_issue_classifier_best.h5'),
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
]

print("\n🚀 Starting training...")
print(f"⏱️  Estimated time: 1-2 hours on CPU")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator,
    callbacks=callbacks,
    verbose=1
)

print("\n✅ Training completed!")

# Save final model
print("\n💾 Saving model...")

# Save in Keras format (recommended for TensorFlow 2.20+)
keras_model_path = os.path.join(MODEL_DIR, 'civic_issue_classifier_final.keras')
model.save(keras_model_path)
print(f"✅ Keras model saved to: {keras_model_path}")

# Also save as SavedModel format (directory)
saved_model_path = os.path.join(MODEL_DIR, 'civic_issue_classifier')
try:
    model.export(saved_model_path)
    print(f"✅ SavedModel exported to: {saved_model_path}")
except:
    # Fallback: save as .keras if export fails
    print(f"⚠️  Using .keras format instead of SavedModel")

# Save metadata
metadata = {
    'class_indices': train_generator.class_indices,
    'category_to_department': CATEGORY_MAPPING,
    'num_classes': num_classes,
    'img_size': IMG_SIZE,
    'model_name': 'civic_issue_classifier',
    'trained_date': datetime.now().isoformat(),
    'total_images': total_images,
    'training_samples': train_generator.samples,
    'validation_samples': val_generator.samples
}

metadata_path = os.path.join(MODEL_DIR, 'model_metadata.json')
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"✅ Metadata saved to: {metadata_path}")

# Plot training history
print("\n📊 Generating training plots...")
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))

# Accuracy
ax1.plot(history.history['accuracy'], label='Train')
ax1.plot(history.history['val_accuracy'], label='Validation')
ax1.set_title('Model Accuracy')
ax1.set_xlabel('Epoch')
ax1.set_ylabel('Accuracy')
ax1.legend()
ax1.grid(True)

# Loss
ax2.plot(history.history['loss'], label='Train')
ax2.plot(history.history['val_loss'], label='Validation')
ax2.set_title('Model Loss')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('Loss')
ax2.legend()
ax2.grid(True)

plt.tight_layout()
plot_path = os.path.join(MODEL_DIR, 'training_history.png')
plt.savefig(plot_path)
print(f"✅ Training plots saved to: {plot_path}")

# Cleanup temp directory
shutil.rmtree(temp_dir)

# Print final results
print("\n" + "=" * 80)
print("✅ TRAINING COMPLETED SUCCESSFULLY!")
print("=" * 80)
print(f"\n📁 Model saved in: {MODEL_DIR}")
print(f"🎯 Number of classes: {num_classes}")
print(f"📊 Total training images: {total_images}")
print(f"📈 Final validation accuracy: {history.history['val_accuracy'][-1]:.2%}")
print(f"\n🧪 Test the model: python3 predictModel.py <image_path>")
print("\n" + "=" * 80)
