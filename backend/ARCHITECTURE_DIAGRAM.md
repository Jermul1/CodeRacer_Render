# Architecture Flow Diagram

## Request Flow (SOLID Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT REQUEST                          │
│                   (HTTP/WebSocket)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (Controllers) - routes/                      │  │
│  │  • auth.py         - User authentication             │  │
│  │  • games.py        - Game management                 │  │
│  │  • codesnippets.py - Code snippet CRUD               │  │
│  │                                                       │  │
│  │  Responsibilities:                                    │  │
│  │  ✓ Handle HTTP requests/responses                    │  │
│  │  ✓ Input validation (Pydantic schemas)               │  │
│  │  ✓ Dependency injection                              │  │
│  │  ✗ No business logic                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services - services/                                 │  │
│  │  • AuthService       - Login, signup, validation      │  │
│  │  • GameService       - Game creation, join, progress  │  │
│  │  • SnippetService    - Snippet retrieval, creation    │  │
│  │                                                       │  │
│  │  Responsibilities:                                    │  │
│  │  ✓ Business rules & validation                       │  │
│  │  ✓ Orchestrate repository calls                      │  │
│  │  ✓ Transaction management                            │  │
│  │  ✓ Error handling                                    │  │
│  │  ✗ No HTTP concerns                                  │  │
│  │  ✗ No direct database queries                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repositories - repositories/                         │  │
│  │  • BaseRepository         - Generic CRUD              │  │
│  │  • UserRepository         - User queries              │  │
│  │  • GameRepository         - Game queries              │  │
│  │  • ParticipantRepository  - Participant queries       │  │
│  │  • SnippetRepository      - Snippet queries           │  │
│  │                                                       │  │
│  │  Responsibilities:                                    │  │
│  │  ✓ Database operations only                          │  │
│  │  ✓ Custom queries for specific models                │  │
│  │  ✓ Return database models                            │  │
│  │  ✗ No business logic                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SQLAlchemy Models - models.py                        │  │
│  │  • User            - User data model                  │  │
│  │  • Game            - Game data model                  │  │
│  │  │  GameParticipant - Participant data model          │  │
│  │  • Snippet         - Code snippet data model          │  │
│  │                                                       │  │
│  │  Database - database.py                               │  │
│  │  • SessionLocal    - Session factory                  │  │
│  │  • get_db()        - Dependency for DB sessions       │  │
│  │  • init_db()       - Database initialization          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

## Cross-Cutting Concerns

┌─────────────────────────────────────────────────────────────┐
│  Core Utilities - core/                                     │
│  • config.py     - Application settings (BaseSettings)      │
│  • security.py   - Password hashing (argon2)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DTOs - schemas/                                            │
│  • user.py       - UserCreate, UserLogin, UserResponse      │
│  • game.py       - GameCreate, GameJoin, GameResponse       │
│  • snippet.py    - SnippetCreate, SnippetResponse           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dependency Injection - dependencies.py                     │
│  • get_auth_service()    - Returns AuthService instance     │
│  • get_game_service()    - Returns GameService instance     │
│  • get_snippet_service() - Returns SnippetService instance  │
└─────────────────────────────────────────────────────────────┘

## Example: User Signup Flow

1. CLIENT sends POST /auth/signup
   ↓
2. ROUTE (auth.py) receives request
   - Validates input with UserCreate schema
   - Injects AuthService dependency
   ↓
3. SERVICE (AuthService.signup())
   - Checks if user exists via UserRepository
   - Hashes password with core/security
   - Creates User model
   - Calls UserRepository.create()
   ↓
4. REPOSITORY (UserRepository.create())
   - Inherits from BaseRepository
   - Executes INSERT query
   - Commits transaction
   - Returns User model
   ↓
5. DATABASE (SQLAlchemy)
   - Persists User to database
   ↓
6. RESPONSE flows back up
   - Repository → Service → Route → Client
   - Returns {"message": "User created", "id": 123}

## SOLID Principles in Action

### Single Responsibility (SRP)
- Routes: HTTP only
- Services: Business logic only
- Repositories: Data access only

### Open/Closed (OCP)
- BaseRepository can be extended without modification
- Add new services without changing existing ones

### Liskov Substitution (LSP)
- All repositories can substitute BaseRepository
- Maintain consistent interfaces

### Interface Segregation (ISP)
- Small, focused service methods
- No fat interfaces

### Dependency Inversion (DIP)
- Routes depend on services (abstractions)
- Services depend on repositories (abstractions)
- High-level modules independent of low-level details
