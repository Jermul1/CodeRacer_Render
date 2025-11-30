# Backend Architecture - SOLID Principles Implementation

## Overview

The backend has been restructured to follow **SOLID principles** with a clean separation of concerns using:
- **Repository Pattern** for data access
- **Service Layer** for business logic
- **Dependency Injection** for loose coupling
- **DTO Pattern** (Pydantic schemas) for data validation

## Directory Structure

```
backend/
├── core/                      # Core utilities and configuration
│   ├── config.py             # Application settings
│   └── security.py           # Password hashing utilities
│
├── schemas/                   # Pydantic models (DTOs)
│   ├── user.py               # User request/response models
│   ├── game.py               # Game request/response models
│   └── snippet.py            # Snippet request/response models
│
├── repositories/              # Data Access Layer
│   ├── base.py               # Generic CRUD repository
│   ├── user_repository.py    # User-specific queries
│   ├── game_repository.py    # Game & participant queries
│   └── snippet_repository.py # Snippet queries
│
├── services/                  # Business Logic Layer
│   ├── auth_service.py       # Authentication logic
│   ├── game_service.py       # Game management logic
│   └── snippet_service.py    # Snippet management logic
│
├── routes/                    # API Endpoints (Controllers)
│   ├── auth.py               # Authentication endpoints
│   ├── games.py              # Game endpoints
│   └── codesnippets.py       # Snippet endpoints
│
├── models.py                  # SQLAlchemy database models
├── database.py                # Database connection & session
├── dependencies.py            # Shared dependency injection
├── main.py                    # FastAPI application
└── socketio_server.py         # Real-time WebSocket handlers
```

## Architecture Layers

### 1. **Routes (Controllers) - Presentation Layer**

**Responsibility**: Handle HTTP requests and responses only

```python
# routes/auth.py
@router.post("/signup")
def signup(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.signup(payload)
```

**Characteristics**:
- Thin controllers with minimal logic
- Dependency injection for services
- Input validation via Pydantic schemas
- HTTP-specific concerns only

### 2. **Services - Business Logic Layer**

**Responsibility**: Contain all business logic and orchestrate operations

```python
# services/auth_service.py
class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
    
    def signup(self, user_data: UserCreate) -> dict:
        # Business logic here
        if self.user_repo.exists_by_email_or_username(...):
            raise HTTPException(...)
        # Create user...
```

**Characteristics**:
- Business rules and validation
- Orchestrates repository calls
- Transaction management
- Error handling

### 3. **Repositories - Data Access Layer**

**Responsibility**: Database operations only

```python
# repositories/user_repository.py
class UserRepository(BaseRepository[User]):
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
```

**Characteristics**:
- Inherits from `BaseRepository` for common CRUD
- Custom queries specific to the model
- No business logic
- Returns database models

### 4. **Schemas (DTOs) - Data Transfer Objects**

**Responsibility**: Define request/response structure and validation

```python
# schemas/user.py
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
```

**Characteristics**:
- Pydantic models for validation
- Separate schemas for create/update/response
- Type safety

## SOLID Principles Applied

### ✅ Single Responsibility Principle (SRP)
Each class has one reason to change:
- **Routes**: HTTP handling changes
- **Services**: Business logic changes
- **Repositories**: Data access changes
- **Models**: Database schema changes

### ✅ Open/Closed Principle (OCP)
- `BaseRepository` can be extended without modification
- New services can be added without changing existing ones
- New routes can be added independently

### ✅ Liskov Substitution Principle (LSP)
- All repositories can substitute `BaseRepository`
- Services implement consistent interfaces

### ✅ Interface Segregation Principle (ISP)
- Each service has focused, specific methods
- Routes depend only on the services they need
- No fat interfaces with unused methods

### ✅ Dependency Inversion Principle (DIP)
- Routes depend on service abstractions, not implementations
- Services depend on repository abstractions
- High-level modules don't depend on low-level modules

## Benefits

### 🧪 **Testability**
```python
# Easy to mock dependencies
def test_signup():
    mock_repo = Mock(UserRepository)
    service = AuthService(mock_db)
    service.user_repo = mock_repo
    # Test business logic in isolation
```

### 🔧 **Maintainability**
- Clear separation makes code easier to understand
- Changes in one layer don't ripple to others
- Easy to locate bugs

### 📈 **Scalability**
- Add new features without modifying existing code
- Easy to add new repositories, services, or routes
- Supports team collaboration

### ♻️ **Reusability**
- Business logic in services can be reused across routes
- Repository methods can be reused across services
- Common CRUD operations inherited from `BaseRepository`

## Usage Examples

### Creating a New Feature

1. **Define Schema** (schemas/)
```python
class NewFeatureCreate(BaseModel):
    name: str
    description: str
```

2. **Create Repository** (repositories/)
```python
class NewFeatureRepository(BaseRepository[NewFeature]):
    def get_by_name(self, name: str):
        return self.db.query(NewFeature).filter(...).first()
```

3. **Implement Service** (services/)
```python
class NewFeatureService:
    def __init__(self, db: Session):
        self.repo = NewFeatureRepository(db)
    
    def create(self, data: NewFeatureCreate):
        # Business logic
        return self.repo.create(...)
```

4. **Add Route** (routes/)
```python
@router.post("/")
def create_feature(
    payload: NewFeatureCreate,
    service: NewFeatureService = Depends(get_service)
):
    return service.create(payload)
```

## Migration from Old Structure

Old files have been preserved with `_old` suffix:
- `routes/auth_old.py`
- `routes/games_old.py`
- `routes/codesnippets_old.py`

These can be deleted once testing is complete.

## Dependencies

Updated `requirements.txt` includes:
- `pydantic-settings` - For configuration management
- `email-validator` - For EmailStr validation
- `passlib[argon2]` - For password hashing

## Next Steps

1. ✅ Architecture implemented
2. ⏳ Update tests to use new structure
3. ⏳ Add integration tests for services
4. ⏳ Add API documentation with examples
5. ⏳ Implement authentication tokens (JWT)

---

**Note**: This architecture is appropriately scaled for the CodeRacer project. It provides professional structure without over-engineering patterns like Factory or Abstract Factory which would be overkill for this use case.
