#!/usr/bin/env python3
"""
Civic Issue Classification Model Inference Service
Makes predictions on new images using trained model
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import sys

class CivicIssuePredictor:
    """
    Predictor class for civic issue classification
    """
    
    def __init__(self, model_dir=None):
        """
        Initialize predictor with trained model
        """
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
        
        self.model_dir = model_dir
        self.model = None
        self.metadata = None
        self.class_indices = None
        self.index_to_class = None
        
        self.load_model()
    
    def load_model(self):
        """
        Load trained model and metadata
        """
        try:
            # Load metadata
            metadata_path = os.path.join(self.model_dir, 'model_metadata.json')
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            
            self.class_indices = self.metadata['class_indices']
            self.index_to_class = {v: k for k, v in self.class_indices.items()}
            
            # Load model (try SavedModel format first, then .h5)
            model_path = os.path.join(self.model_dir, self.metadata['model_name'])
            if os.path.exists(model_path):
                self.model = keras.models.load_model(model_path)
                print(f"✅ Model loaded from: {model_path}")
            else:
                # Try .h5 format
                h5_path = os.path.join(self.model_dir, f"{self.metadata['model_name']}_best.h5")
                if os.path.exists(h5_path):
                    self.model = keras.models.load_model(h5_path)
                    print(f"✅ Model loaded from: {h5_path}")
                else:
                    raise FileNotFoundError("Model file not found")
            
            print(f"✅ Loaded model with {self.metadata['num_classes']} classes")
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise
    
    def preprocess_image(self, image_path):
        """
        Preprocess image for prediction
        """
        try:
            # Load image
            img = Image.open(image_path)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to model input size
            img_size = tuple(self.metadata['img_size'])
            img = img.resize(img_size)
            
            # Convert to array and normalize
            img_array = np.array(img)
            img_array = img_array / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            print(f"❌ Error preprocessing image: {str(e)}")
            raise
    
    def predict(self, image_path, top_k=3):
        """
        Make prediction on image
        
        Args:
            image_path: Path to image file
            top_k: Number of top predictions to return
            
        Returns:
            dict with predictions and metadata
        """
        try:
            # Preprocess image
            img_array = self.preprocess_image(image_path)
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            
            # Get top k predictions
            top_indices = np.argsort(predictions[0])[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                category = self.index_to_class[idx]
                confidence = float(predictions[0][idx])
                department = self.metadata['category_to_department'].get(
                    category, 
                    'roads_infrastructure'  # Default
                )
                
                results.append({
                    'category': category,
                    'confidence': confidence,
                    'confidence_percent': round(confidence * 100, 2),
                    'department': department
                })
            
            # Get primary prediction
            primary = results[0]
            
            return {
                'success': True,
                'primary_prediction': primary,
                'all_predictions': results,
                'model_version': self.metadata.get('trained_date', 'unknown')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict_batch(self, image_paths, top_k=3):
        """
        Make predictions on multiple images
        """
        results = []
        for image_path in image_paths:
            result = self.predict(image_path, top_k)
            results.append({
                'image_path': image_path,
                **result
            })
        return results

def main():
    """
    Command line interface for predictions
    """
    if len(sys.argv) < 2:
        print("Usage: python predictModel.py <image_path>")
        print("Example: python predictModel.py test_image.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"❌ Error: Image not found at {image_path}")
        sys.exit(1)
    
    print("=" * 80)
    print("🎯 CIVIC ISSUE CLASSIFICATION - PREDICTION")
    print("=" * 80)
    
    # Initialize predictor
    predictor = CivicIssuePredictor()
    
    # Make prediction
    print(f"\n🔍 Analyzing image: {image_path}")
    result = predictor.predict(image_path, top_k=3)
    
    if result['success']:
        print("\n✅ PREDICTION RESULTS:")
        print("-" * 80)
        
        primary = result['primary_prediction']
        print(f"\n🎯 PRIMARY PREDICTION:")
        print(f"   Category: {primary['category']}")
        print(f"   Confidence: {primary['confidence_percent']}%")
        print(f"   Department: {primary['department']}")
        
        print(f"\n📊 TOP 3 PREDICTIONS:")
        for i, pred in enumerate(result['all_predictions'], 1):
            print(f"   {i}. {pred['category']} ({pred['confidence_percent']}%) → {pred['department']}")
        
        print(f"\n📅 Model Version: {result['model_version']}")
        
    else:
        print(f"\n❌ PREDICTION FAILED:")
        print(f"   Error: {result['error']}")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
