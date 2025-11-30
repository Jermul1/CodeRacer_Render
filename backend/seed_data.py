import sys
from pathlib import Path

# Add parent directory to path for imports
if __name__ == "__main__":
    # Get the backend directory path
    backend_dir = Path(__file__).parent
    parent_dir = backend_dir.parent
    
    # Add both to sys.path to support different execution contexts
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))

try:
    # Try absolute import first (when run as module)
    from backend.models import Language, Snippet
    from backend.database import SessionLocal, engine, Base
except ImportError:
    # Fall back to relative import (when run from backend directory)
    from models import Language, Snippet
    from database import SessionLocal, engine, Base


# Create all tables
Base.metadata.create_all(bind=engine)

def seed_data():
    """Seed the database with initial languages and code snippets"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Add Python language if it doesn't exist
        python_lang = db.query(Language).filter(Language.name == "python").first()
        if not python_lang:
            python_lang = Language(name="python")
            db.add(python_lang)
            db.commit()
            db.refresh(python_lang)
            print("✅ Added Python language")
        else:
            print("ℹ️  Python language already exists")

        # Python code snippets
        python_snippets = [
            {
                "code": """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr""",
            },
            {
                "code": """def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence""",
            },
            {
                "code": """def is_palindrome(text):
    text = text.lower()
    text = ''.join(c for c in text if c.isalnum())
    return text == text[::-1]""",
            }
        ]

        # Add snippets if they don't exist
        added_count = 0
        for snippet_data in python_snippets:
            existing_snippet = db.query(Snippet).filter(
                Snippet.code == snippet_data["code"]
            ).first()
            
            if not existing_snippet:
                snippet = Snippet(
                    language_id=python_lang.id,
                    code=snippet_data["code"]
                )
                db.add(snippet)
                added_count += 1
        
        if added_count > 0:
            db.commit()
            print(f"✅ Added {added_count} Python snippets")
        else:
            print("ℹ️  All snippets already exist")
        
        print("🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()