#!/usr/bin/env python3
"""
Test Setup Script - Verify environment and dataset
"""

import os
import sys

def test_python_version():
    """Check Python version"""
    print("🐍 Testing Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor}.{version.micro} (Need 3.8+)")
        return False

def test_dependencies():
    """Check if required packages are installed"""
    print("\n📦 Testing dependencies...")
    
    required = {
        'tensorflow': 'TensorFlow',
        'numpy': 'NumPy',
        'PIL': 'Pillow',
        'matplotlib': 'Matplotlib',
        'sklearn': 'scikit-learn'
    }
    
    all_installed = True
    for module, name in required.items():
        try:
            __import__(module)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} (not installed)")
            all_installed = False
    
    return all_installed

def test_tensorflow():
    """Test TensorFlow installation"""
    print("\n🔧 Testing TensorFlow...")
    try:
        import tensorflow as tf
        print(f"   ✅ TensorFlow version: {tf.__version__}")
        
        # Check GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"   ✅ GPU available: {len(gpus)} device(s)")
            for gpu in gpus:
                print(f"      - {gpu.name}")
        else:
            print("   ⚠️  No GPU found (training will use CPU)")
        
        return True
    except Exception as e:
        print(f"   ❌ TensorFlow error: {str(e)}")
        return False

def test_dataset():
    """Check dataset structure"""
    print("\n📊 Testing dataset...")
    
    dataset_base = os.path.join(os.path.dirname(__file__), '..', 'datasets', 
                                'data-20251026T073650Z-1-001', 'data')
    
    if not os.path.exists(dataset_base):
        print(f"   ❌ Dataset not found at: {dataset_base}")
        return False
    
    print(f"   ✅ Dataset found")
    
    # Check Road Issues
    road_path = os.path.join(dataset_base, 'Road Issues')
    if os.path.exists(road_path):
        categories = [d for d in os.listdir(road_path) if os.path.isdir(os.path.join(road_path, d))]
        total_images = 0
        for cat in categories:
            cat_path = os.path.join(road_path, cat)
            images = [f for f in os.listdir(cat_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            total_images += len(images)
            print(f"   ✅ {cat}: {len(images)} images")
        
        print(f"   📍 Road Issues total: {total_images} images")
    
    # Check Cleanliness Issues
    clean_path = os.path.join(dataset_base, 'Public Cleanliness + Environmental Issues')
    if os.path.exists(clean_path):
        categories = [d for d in os.listdir(clean_path) if os.path.isdir(os.path.join(clean_path, d))]
        total_images = 0
        for cat in categories:
            cat_path = os.path.join(clean_path, cat)
            images = [f for f in os.listdir(cat_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            total_images += len(images)
            print(f"   ✅ {cat}: {len(images)} images")
        
        print(f"   🧹 Cleanliness Issues total: {total_images} images")
    
    return True

def test_model_directory():
    """Check if model directory exists"""
    print("\n📁 Testing model directory...")
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        print(f"   ✅ Created model directory: {model_dir}")
    else:
        print(f"   ✅ Model directory exists")
        
        # Check for existing models
        if os.path.exists(os.path.join(model_dir, 'model_metadata.json')):
            print("   ✅ Trained model found")
        else:
            print("   ⚠️  No trained model (run training first)")
    
    return True

def main():
    print("=" * 80)
    print("🧪 AI MODEL SETUP TEST")
    print("=" * 80)
    
    results = []
    
    # Run tests
    results.append(("Python Version", test_python_version()))
    results.append(("Dependencies", test_dependencies()))
    results.append(("TensorFlow", test_tensorflow()))
    results.append(("Dataset", test_dataset()))
    results.append(("Model Directory", test_model_directory()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📋 TEST SUMMARY")
    print("=" * 80)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
        if not passed:
            all_passed = False
    
    print("=" * 80)
    
    if all_passed:
        print("\n✅ All tests passed! Ready to train.")
        print("\nNext steps:")
        print("  1. Run: python trainModel.py")
        print("  2. Or: ./train.sh")
        print("  3. Quick test: python quickTrain.py")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")
        print("\nTo install dependencies:")
        print("  pip install -r requirements.txt")
    
    print("")

if __name__ == '__main__':
    main()
