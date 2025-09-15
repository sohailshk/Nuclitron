#!/usr/bin/env python3
"""
Reinitialize database with updated constraints.

This script recreates the database to apply the updated pressure constraints
that allow realistic negative values near the surface.
"""

import os
import sys
import shutil
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.data.database import init_database
from src.data.models import Base

def main():
    """Reinitialize the database with updated constraints."""
    print("🔄 Reinitializing Database with Updated Constraints")
    print("=" * 55)
    
    # Get database path
    db_path = Path("data/argo_platform.db")
    
    # Backup existing database if it exists
    if db_path.exists():
        backup_path = db_path.with_suffix('.db.backup')
        print(f"📁 Backing up existing database to {backup_path}")
        shutil.copy2(db_path, backup_path)
        
        # Remove old database
        print("🗑️ Removing old database...")
        db_path.unlink()
    
    # Create database directory if it doesn't exist
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Initialize new database
    print("🆕 Creating new database with updated constraints...")
    init_database()
    
    print("✅ Database reinitialized successfully!")
    print("💡 Updated constraints now allow realistic negative pressures (-5 to positive values)")
    print("🚀 Ready to integrate real Argo data!")

if __name__ == "__main__":
    main()
