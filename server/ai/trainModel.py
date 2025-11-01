#!/usr/bin/env python3
"""
Civic Issue Classification Model Training Script
Trains a CNN model to classify civic issues from images
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2, EfficientNetB0
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
from datetime import datetime
import argparse

# Configuration
class Config:
    # Dataset paths
    DATASET_BASE = os.path.join(os.path.dirname(__file__), '..', 'datasets', 'data-20251026T073650Z-1-001', 'data')
    
    # Model configuration
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 50
    LEARNING_RATE = 0.001
    
    # Model save paths
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    MODEL_NAME = 'civic_issue_classifier'
    
    # Category mapping to departments
    CATEGORY_MAPPING = {
        'Pothole Issues': 'roads_infrastructure',
        'Damaged Road issues': 'roads_infrastructure',
        'Broken Road Sign Issues': 'traffic_management',
        'Illegal Parking Issues': 'traffic_management',
        'Littering Garbage on Public Places Issues': 'sanitation_waste',
        'Vandalism Issues': 'public_property',
        'Mixed Issues': 'roads_infrastructure'  # Default to roads
    }

def create_dataset_structure():
    """
    Analyze and prepare dataset structure
    Returns: dict with category info
    """
    print("📊 Analyzing dataset structure...")
    
    dataset_info = {
        'categories': [],
        'image_counts': {},
        'total_images': 0
    }
    
    # Check Road Issues
    road_issues_path = os.path.join(Config.DATASET_BASE, 'Road Issues')
    if os.path.exists(road_issues_path):
        for category in os.listdir(road_issues_path):
            category_path = os.path.join(road_issues_path, category)
            if os.path.isdir(category_path):
                image_count = len([f for f in os.listdir(category_path) 
                                 if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
                dataset_info['categories'].append(category)
                dataset_info['image_counts'][category] = image_count
                dataset_info['total_images'] += image_count
    
    # Check Public Cleanliness Issues
    cleanliness_path = os.path.join(Config.DATASET_BASE, 'Public Cleanliness + Environmental Issues')
    if os.path.exists(cleanliness_path):
        for category in os.listdir(cleanliness_path):
            category_path = os.path.join(cleanliness_path, category)
            if os.path.isdir(category_path):
                image_count = len([f for f in os.listdir(category_path) 
                                 if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
                dataset_info['categories'].append(category)
                dataset_info['image_counts'][category] = image_count
                dataset_info['total_images'] += image_count
    
    print(f"✅ Found {len(dataset_info['categories'])} categories")
    print(f"✅ Total images: {dataset_info['total_images']}")
    for cat, count in dataset_info['image_counts'].items():
        print(f"   - {cat}: {count} images")
    
    return dataset_info

def create_data_generators(validation_split=0.2):
    """
    Create training and validation data generators with augmentation
    """
    print("\n🔄 Creating data generators with augmentation...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=validation_split
    )
    
    # Validation data (only rescaling)
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=validation_split
    )
    
    # Create generators for Road Issues
    road_issues_path = os.path.join(Config.DATASET_BASE, 'Road Issues')
    train_generator_road = train_datagen.flow_from_directory(
        road_issues_path,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    val_generator_road = val_datagen.flow_from_directory(
        road_issues_path,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    # Create generators for Public Cleanliness Issues
    cleanliness_path = os.path.join(Config.DATASET_BASE, 'Public Cleanliness + Environmental Issues')
    train_generator_clean = train_datagen.flow_from_directory(
        cleanliness_path,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    val_generator_clean = val_datagen.flow_from_directory(
        cleanliness_path,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    # Combine class indices
    all_classes = {**train_generator_road.class_indices, **train_generator_clean.class_indices}
    
    print(f"✅ Training samples: {train_generator_road.samples + train_generator_clean.samples}")
    print(f"✅ Validation samples: {val_generator_road.samples + val_generator_clean.samples}")
    print(f"✅ Number of classes: {len(all_classes)}")
    
    return (train_generator_road, train_generator_clean), (val_generator_road, val_generator_clean), all_classes

def build_model(num_classes, use_pretrained=True):
    """
    Build CNN model with transfer learning
    """
    print(f"\n🏗️  Building model for {num_classes} classes...")
    
    if use_pretrained:
        # Use MobileNetV2 as base (efficient and accurate)
        base_model = MobileNetV2(
            input_shape=(*Config.IMG_SIZE, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model layers initially
        base_model.trainable = False
        
        # Build model
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
        
        print("✅ Using MobileNetV2 with transfer learning")
    else:
        # Custom CNN from scratch
        model = keras.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(*Config.IMG_SIZE, 3)),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(256, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        print("✅ Using custom CNN architecture")
    
    return model

def compile_model(model):
    """
    Compile model with optimizer and loss function
    """
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=Config.LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    print("✅ Model compiled")
    return model

def create_callbacks():
    """
    Create training callbacks
    """
    os.makedirs(Config.MODEL_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            os.path.join(Config.MODEL_DIR, f'{Config.MODEL_NAME}_best.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard logging
        TensorBoard(
            log_dir=os.path.join(Config.MODEL_DIR, 'logs', timestamp),
            histogram_freq=1
        )
    ]
    
    print("✅ Callbacks created")
    return callbacks

class CombinedGenerator:
    """
    Combines multiple generators into one
    """
    def __init__(self, generators):
        self.generators = generators
        self.num_classes = sum(gen.num_classes for gen in generators)
        
    def __iter__(self):
        return self
    
    def __next__(self):
        # Randomly select a generator
        gen = np.random.choice(self.generators)
        batch_x, batch_y = next(gen)
        return batch_x, batch_y

def train_model(model, train_generators, val_generators, callbacks):
    """
    Train the model
    """
    print("\n🚀 Starting training...")
    
    # Combine generators
    train_gen_road, train_gen_clean = train_generators
    val_gen_road, val_gen_clean = val_generators
    
    # Calculate steps
    steps_per_epoch = (train_gen_road.samples + train_gen_clean.samples) // Config.BATCH_SIZE
    validation_steps = (val_gen_road.samples + val_gen_clean.samples) // Config.BATCH_SIZE
    
    # Train on road issues first
    print("\n📍 Phase 1: Training on Road Issues...")
    history_road = model.fit(
        train_gen_road,
        epochs=Config.EPOCHS // 2,
        validation_data=val_gen_road,
        callbacks=callbacks,
        verbose=1
    )
    
    # Train on cleanliness issues
    print("\n🧹 Phase 2: Training on Cleanliness Issues...")
    history_clean = model.fit(
        train_gen_clean,
        epochs=Config.EPOCHS // 2,
        validation_data=val_gen_clean,
        callbacks=callbacks,
        verbose=1
    )
    
    print("✅ Training completed!")
    
    return history_road, history_clean

def save_model_artifacts(model, class_indices):
    """
    Save model and metadata
    """
    print("\n💾 Saving model artifacts...")
    
    # Save final model
    model_path = os.path.join(Config.MODEL_DIR, f'{Config.MODEL_NAME}_final.h5')
    model.save(model_path)
    print(f"✅ Model saved to: {model_path}")
    
    # Save as TensorFlow SavedModel format (for production)
    saved_model_path = os.path.join(Config.MODEL_DIR, Config.MODEL_NAME)
    model.save(saved_model_path)
    print(f"✅ SavedModel saved to: {saved_model_path}")
    
    # Save class indices and mapping
    metadata = {
        'class_indices': class_indices,
        'category_to_department': Config.CATEGORY_MAPPING,
        'num_classes': len(class_indices),
        'img_size': Config.IMG_SIZE,
        'model_name': Config.MODEL_NAME,
        'trained_date': datetime.now().isoformat()
    }
    
    metadata_path = os.path.join(Config.MODEL_DIR, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata saved to: {metadata_path}")

def plot_training_history(history_road, history_clean):
    """
    Plot training history
    """
    print("\n📊 Generating training plots...")
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Road Issues - Accuracy
    axes[0, 0].plot(history_road.history['accuracy'], label='Train')
    axes[0, 0].plot(history_road.history['val_accuracy'], label='Val')
    axes[0, 0].set_title('Road Issues - Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Road Issues - Loss
    axes[0, 1].plot(history_road.history['loss'], label='Train')
    axes[0, 1].plot(history_road.history['val_loss'], label='Val')
    axes[0, 1].set_title('Road Issues - Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Cleanliness Issues - Accuracy
    axes[1, 0].plot(history_clean.history['accuracy'], label='Train')
    axes[1, 0].plot(history_clean.history['val_accuracy'], label='Val')
    axes[1, 0].set_title('Cleanliness Issues - Accuracy')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Accuracy')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Cleanliness Issues - Loss
    axes[1, 1].plot(history_clean.history['loss'], label='Train')
    axes[1, 1].plot(history_clean.history['val_loss'], label='Val')
    axes[1, 1].set_title('Cleanliness Issues - Loss')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Loss')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plot_path = os.path.join(Config.MODEL_DIR, 'training_history.png')
    plt.savefig(plot_path)
    print(f"✅ Training plots saved to: {plot_path}")

def main():
    parser = argparse.ArgumentParser(description='Train Civic Issue Classification Model')
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--learning-rate', type=float, default=0.001, help='Learning rate')
    parser.add_argument('--no-pretrained', action='store_true', help='Train from scratch without transfer learning')
    
    args = parser.parse_args()
    
    # Update config
    Config.EPOCHS = args.epochs
    Config.BATCH_SIZE = args.batch_size
    Config.LEARNING_RATE = args.learning_rate
    
    print("=" * 80)
    print("🎯 CIVIC ISSUE CLASSIFICATION MODEL TRAINING")
    print("=" * 80)
    
    # Check GPU availability
    print(f"\n🖥️  GPU Available: {tf.config.list_physical_devices('GPU')}")
    print(f"📦 TensorFlow Version: {tf.__version__}")
    
    # Analyze dataset
    dataset_info = create_dataset_structure()
    
    # Create data generators
    train_generators, val_generators, class_indices = create_data_generators()
    
    # Build model
    num_classes = len(class_indices)
    model = build_model(num_classes, use_pretrained=not args.no_pretrained)
    model = compile_model(model)
    
    # Print model summary
    print("\n📋 Model Summary:")
    model.summary()
    
    # Create callbacks
    callbacks = create_callbacks()
    
    # Train model
    history_road, history_clean = train_model(model, train_generators, val_generators, callbacks)
    
    # Save model and artifacts
    save_model_artifacts(model, class_indices)
    
    # Plot training history
    plot_training_history(history_road, history_clean)
    
    print("\n" + "=" * 80)
    print("✅ TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print(f"\n📁 Model saved in: {Config.MODEL_DIR}")
    print(f"🎯 Number of classes: {num_classes}")
    print(f"📊 Total training images: {dataset_info['total_images']}")

if __name__ == '__main__':
    main()
