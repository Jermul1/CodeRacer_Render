import sys
from pathlib import Path

# Add parent directory to path for imports
if __name__ == "__main__":
    backend_dir = Path(__file__).parent
    parent_dir = backend_dir.parent
    
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))

try:
    from backend.models import Language, Snippet
    from backend.database import SessionLocal, engine, Base
except ImportError:
    from models import Language, Snippet
    from database import SessionLocal, engine, Base


Base.metadata.create_all(bind=engine)

def seed_data():
    """Seed the database with languages and code snippets"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # ==========================================
        # PYTHON LANGUAGE
        # ==========================================
        python_lang = db.query(Language).filter(Language.name == "python").first()
        if not python_lang:
            python_lang = Language(name="python")
            db.add(python_lang)
            db.commit()
            db.refresh(python_lang)
            print("✅ Added Python language")
        else:
            print("ℹ️  Python language already exists")

        python_snippets = [
            # 1. List Comprehension
            """numbers = [1, 2, 3, 4, 5, 6, 7, 8]
squares = [x**2 for x in numbers if x % 2 == 0]
print(squares)""",
            
            # 2. Fibonacci Function
            """def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a + b

fibonacci(10)""",
            
            # 3. Dictionary Operations
            """user = {'name': 'Alice', 'age': 25}
user['email'] = 'alice@example.com'
for key, value in user.items():
    print(f"{key}: {value}")""",
            
            # 4. Lambda and Filter
            """numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
evens = list(filter(lambda x: x % 2 == 0, numbers))
doubled = list(map(lambda x: x * 2, evens))
print(doubled)""",
            
            # 5. Simple Class
            """class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        return f"{self.name} says Woof!"

dog = Dog("Buddy")
print(dog.bark())"""
        ]

        # ==========================================
        # JAVASCRIPT LANGUAGE
        # ==========================================
        js_lang = db.query(Language).filter(Language.name == "javascript").first()
        if not js_lang:
            js_lang = Language(name="javascript")
            db.add(js_lang)
            db.commit()
            db.refresh(js_lang)
            print("✅ Added JavaScript language")
        else:
            print("ℹ️  JavaScript language already exists")

        js_snippets = [
            # 1. Array Methods
            """const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
const sum = nums.reduce((a, b) => a + b, 0);
console.log(doubled, evens, sum);""",
            
            # 2. Object Destructuring
            """const user = {name: 'Bob', age: 30, city: 'NYC'};
const {name, age} = user;
console.log(`${name} is ${age} years old`);

const [first, second] = [10, 20, 30];
console.log(first, second);""",
            
            # 3. Arrow Function
            """const square = x => x * x;
const add = (a, b) => a + b;

const result = [1, 2, 3].map(square);
console.log(result);
console.log(add(5, 3));""",
            
            # 4. Template Literals
            """const name = 'Alice';
const age = 25;
const greeting = `Hello, I'm ${name} and I'm ${age} years old.`;
console.log(greeting);

const multi = `Line 1
Line 2`;""",
            
            # 5. Async Function
            """async function fetchUser(id) {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
}

fetchUser(1).then(user => console.log(user));"""
        ]
# ==========================================
# BRAINFUCK LANGUAGE
# ==========================================
        bf_lang = db.query(Language).filter(Language.name == "brainfuck").first()
        if not bf_lang:
            bf_lang = Language(name="brainfuck")
            db.add(bf_lang)
            db.commit()
            db.refresh(bf_lang)
            print("✅ Added Brainfuck language")
        else:
            print("ℹ️  Brainfuck language already exists")

        bf_snippets = [

    # 1. Hello World (decorative-long)
    """++++++++++[>+++++++>++++++++++>+++++++++++<<<-]>>>++.<<++.>-.+++++++..+++.>>++++.<---.<<++.>>-.+++.------.--------.>>>+.>++.""",

    # 2. Fibonacci (first 10 numbers)
    """++++++++++>+>+<<<[
    >.>.<<
    >[-<+>]< 
    >>[-<+>]< 
    <-]""",

    # 3. Reverse input characters until newline
    """>,[>+>+<<- >>[<<+>>-] <<,] <[>. [-] <]""",

    # 4. ASCII counter 0–255 loop
    """+[>++++++++[<+++++++++>-]<.>-<]""",

    # 5. Memory pattern fill + print
    """++++++++++[
    >+++++++++<-
]
>++++++++++[
    .>+
    -
]"""
        ]

        # ==========================================
        # INSERT SNIPPETS
        # ==========================================
        python_added = 0
        for code in python_snippets:
            existing = db.query(Snippet).filter(Snippet.code == code).first()
            if not existing:
                snippet = Snippet(language_id=python_lang.id, code=code)
                db.add(snippet)
                python_added += 1
        
        js_added = 0
        for code in js_snippets:
            existing = db.query(Snippet).filter(Snippet.code == code).first()
            if not existing:
                snippet = Snippet(language_id=js_lang.id, code=code)
                db.add(snippet)
                js_added += 1
        bf_added = 0
        for code in bf_snippets:
            existing = db.query(Snippet).filter(Snippet.code == code).first()
            if not existing:
                snippet = Snippet(language_id=bf_lang.id, code=code)
                db.add(snippet)
                bf_added += 1
        
        if python_added > 0 or js_added > 0 or bf_added > 0:
            db.commit()
            print(f"✅ Added {python_added} Python snippets")
            print(f"✅ Added {js_added} JavaScript snippets")
            print(f"✅ Added {bf_added} Brainfuck snippets")
        else:
            print("ℹ️  All snippets already exist")

        python_total = db.query(Snippet).filter(Snippet.language_id == python_lang.id).count()
        js_total = db.query(Snippet).filter(Snippet.language_id == js_lang.id).count()
        bf_total = db.query(Snippet).filter(Snippet.language_id == bf_lang.id).count()

        print(f"\n📊 Summary:")
        print(f"   Python snippets: {python_total}")
        print(f"   JavaScript snippets: {js_total}")
        print(f"   Brainfuck snippets: {bf_total}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()