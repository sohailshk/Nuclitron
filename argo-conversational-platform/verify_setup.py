#!/usr/bin/env python3
"""
Quick setup verification script for Argo Conversational Platform.

This script tests basic configuration loading without external dependencies.
Run this to verify the initial setup is working correctly.
"""

import sys
import os
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
sys.path.insert(0, str(src_path))

def test_basic_setup():
    """Test basic project setup."""
    print("🌊 Testing Argo Platform Basic Setup...")
    
    # Test 1: Check directory structure
    print("\n1. Checking directory structure...")
    required_dirs = [
        "src", "src/config", "src/data", "src/rag", 
        "src/api", "src/ui", "src/utils", "tests", "docs", "data"
    ]
    
    for dir_name in required_dirs:
        dir_path = project_root / dir_name
        if dir_path.exists():
            print(f"   ✅ {dir_name}")
        else:
            print(f"   ❌ {dir_name} - Missing!")
            return False
    
    # Test 2: Check configuration files
    print("\n2. Checking configuration files...")
    config_files = [
        ".env.template", ".env", "requirements.txt", 
        "docker-compose.yml", "README.md", "PROGRESS.md"
    ]
    
    for file_name in config_files:
        file_path = project_root / file_name
        if file_path.exists():
            print(f"   ✅ {file_name}")
        else:
            print(f"   ❌ {file_name} - Missing!")
    
    # Test 3: Test configuration loading
    print("\n3. Testing configuration loading...")
    try:
        from src.config import get_settings
        settings = get_settings()
        print(f"   ✅ Settings loaded successfully")
        print(f"   ✅ App name: {settings.app_name}")
        print(f"   ✅ Version: {settings.app_version}")
        print(f"   ✅ Debug mode: {settings.debug}")
        
        # Test Gemini API key
        if settings.gemini_api_key and len(settings.gemini_api_key) > 10:
            print(f"   ✅ Gemini API key configured")
        else:
            print(f"   ⚠️  Gemini API key needs configuration")
        
    except Exception as e:
        print(f"   ❌ Configuration loading failed: {e}")
        return False
    
    # Test 4: Check Indian Ocean bounds
    print("\n4. Testing geographic configuration...")
    try:
        bounds = settings.indian_ocean_bounds
        print(f"   ✅ Indian Ocean bounds: {bounds}")
        if len(bounds) == 4:
            print(f"   ✅ Bounds format is correct")
        else:
            print(f"   ❌ Invalid bounds format")
    except Exception as e:
        print(f"   ❌ Bounds parsing failed: {e}")
    
    print("\n🎉 Basic setup verification completed!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt") 
    print("2. Start PostgreSQL: docker-compose up postgres -d")
    print("3. Run tests: pytest tests/")
    print("4. Start development: streamlit run src/ui/app.py")
    
    return True


if __name__ == "__main__":
    try:
        test_basic_setup()
    except KeyboardInterrupt:
        print("\n\n👋 Setup verification cancelled.")
    except Exception as e:
        print(f"\n❌ Setup verification failed: {e}")
        sys.exit(1)
