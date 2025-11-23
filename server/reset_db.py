"""
Reset database script - drops and recreates all tables with updated schema
"""
from database import reset_database
import models  # Register models with SQLModel

if __name__ == "__main__":
    print("⚠️  WARNING: This will delete all data in the database!")
    confirm = input("Type 'YES' to continue: ")
    
    if confirm == "YES":
        print("Dropping all tables...")
        reset_database()
        print("✅ Database reset complete! All tables recreated with new schema.")
    else:
        print("❌ Cancelled.")
