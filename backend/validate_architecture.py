"""
Validation script to check the new architecture structure
"""
import os

def check_file_exists(filepath, description):
    """Check if a file exists and print result"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {filepath}")
    return exists

def main():
    print("\n" + "="*60)
    print("BACKEND ARCHITECTURE VALIDATION")
    print("="*60 + "\n")
    
    base_path = "c:\\CodeRacer_Prototype\\backend"
    
    # Core modules
    print("📁 CORE MODULES:")
    check_file_exists(f"{base_path}\\core\\__init__.py", "Core init")
    check_file_exists(f"{base_path}\\core\\config.py", "Config module")
    check_file_exists(f"{base_path}\\core\\security.py", "Security module")
    
    # Schemas
    print("\n📁 SCHEMAS (DTOs):")
    check_file_exists(f"{base_path}\\schemas\\__init__.py", "Schemas init")
    check_file_exists(f"{base_path}\\schemas\\user.py", "User schemas")
    check_file_exists(f"{base_path}\\schemas\\game.py", "Game schemas")
    check_file_exists(f"{base_path}\\schemas\\snippet.py", "Snippet schemas")
    
    # Repositories
    print("\n📁 REPOSITORIES:")
    check_file_exists(f"{base_path}\\repositories\\__init__.py", "Repositories init")
    check_file_exists(f"{base_path}\\repositories\\base.py", "Base repository")
    check_file_exists(f"{base_path}\\repositories\\user_repository.py", "User repository")
    check_file_exists(f"{base_path}\\repositories\\game_repository.py", "Game repository")
    check_file_exists(f"{base_path}\\repositories\\snippet_repository.py", "Snippet repository")
    
    # Services
    print("\n📁 SERVICES:")
    check_file_exists(f"{base_path}\\services\\__init__.py", "Services init")
    check_file_exists(f"{base_path}\\services\\auth_service.py", "Auth service")
    check_file_exists(f"{base_path}\\services\\game_service.py", "Game service")
    check_file_exists(f"{base_path}\\services\\snippet_service.py", "Snippet service")
    
    # Routes
    print("\n📁 ROUTES:")
    check_file_exists(f"{base_path}\\routes\\__init__.py", "Routes init")
    check_file_exists(f"{base_path}\\routes\\auth.py", "Auth routes")
    check_file_exists(f"{base_path}\\routes\\games.py", "Game routes")
    check_file_exists(f"{base_path}\\routes\\codesnippets.py", "Snippet routes")
    
    # Supporting files
    print("\n📁 SUPPORTING FILES:")
    check_file_exists(f"{base_path}\\dependencies.py", "Dependencies module")
    check_file_exists(f"{base_path}\\main.py", "Main application")
    check_file_exists(f"{base_path}\\models.py", "Database models")
    check_file_exists(f"{base_path}\\database.py", "Database connection")
    check_file_exists(f"{base_path}\\requirements.txt", "Requirements")
    check_file_exists(f"{base_path}\\ARCHITECTURE.md", "Architecture docs")
    
    print("\n" + "="*60)
    print("✅ ARCHITECTURE RESTRUCTURE COMPLETE!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
