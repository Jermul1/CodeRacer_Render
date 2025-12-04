# CodeRacer - Competitive Code Racing Game

CodeRacer is a multiplayer web-based coding challenge platform where users race to complete code snippets accurately and quickly. The application supports both solo and multiplayer modes with real-time interactions.

## Render
Jos ei lataa snippettejä. Mene backendin linkkiin ja kato onko päällä. Käytössä renderin ilmaisversio. Sivustojen pitäisi olla voimassa koko ajan, mutta backendin toimintaa saatetaan hidastaa, jos se ei ole käytössä.

https://coderacer-frontend.onrender.com 

https://coderacer-backend-fs4h.onrender.com/docs



## Quick Start Setup

### Prerequisites
- **Python** 3.10+ (installed)
- **PostgreSQL** (installed and running)
- **Node.js** 18+ (installed)

### Backend Setup

Kokeilin helpottaa backendin launchaamista. Pitäs lähteä käyntiin riippuvuuksien asentamisella ja backendin päälle laittamisella. 1, 2, ja 5. Pitäs luoda automaattisesti tietokannan, jos sitä ei ole ja laittaa sinne dataa. 

1. Create and activate a virtual environment in project root:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Configure environment variables by creating a `.env` file in the backend directory with database credentials

5. Run the backend server:
   ```bash
   # Importit hassuja ei välttämättä toimi jos olet backend kansiossa ja käytät uvicorn main:app--reload

   ucicorn backend.main:app --reload
   ```

6. Add code snippets to database
   ```bash
   python backend/seed_data.py
   ```  

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Tech Stack

### Backend
- **Framework**: FastAPI - Modern, fast Python web framework with async support
- **Database**: PostgreSQL - Robust relational database with SQLAlchemy ORM
- **Authentication**: Passlib (Argon2) - Secure password hashing and authentication
- **Real-time Communication**: Socket.IO - WebSocket-based event-driven architecture
- **Data Validation**: Pydantic - Runtime type checking and settings validation
- **Caching**: Redis - In-memory data store for session management and caching
- **Server**: Uvicorn - ASGI server for running async Python applications
- **Email**: Email-validator - RFC-compliant email validation (En oo varma onko käytössä)

**Architecture**: Modular layered architecture with separation of concerns:
- `routes/` - HTTP endpoint handlers
- `services/` - Business logic layer
- `repositories/` - Data access layer
- `schemas/` - Pydantic models for validation
- `core/` - Configuration and security utilities

### Frontend
- **Framework**: React 19 - Modern UI library with hooks and concurrent features
- **Build Tool**: Vite - Lightning-fast build tool and dev server
- **Routing**: React Router v7 - Client-side navigation and routing
- **Styling**: styles/ Ai generoitu .css tiedostot
- **HTTP Client**: Axios - Promise-based HTTP client
- **Real-time**: Socket.IO Client - WebSocket client for real-time game events
- **Accessibility**: Axe-core & Jest-axe - Automated accessibility testing
- **Testing**: Vitest - Lightning-fast unit test framework (Kokeiltu vähän en saanu toimimaan)

**Architecture**: Component-based with feature pages:
- `components/` - Reusable UI components
- `pages/` - Page-level components (Home, Solo, Multiplayer)
- `styles/` - CSS modules for component styling
- `api.js` - Centralized HTTP request utilities

## Project Structure

```
Render/
├── backend/          # Python FastAPI backend server
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── repositories/ # Database access
│   ├── schemas/      # Pydantic validators
│   ├── core/         # Config and security
│   └── tests/        # Unit tests
├── frontend/         # React + Vite frontend application
│   └── src/
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       └── styles/       # CSS files
└── README.md         # This file
```

## Key Features

- **Solo Racing**: Complete code challenges at your own pace
- **Multiplayer Racing**: Real-time racing against other users
- **Code Snippets**: Diverse code challenges in multiple programming languages
- **Real-time Synchronization**: Socket.IO for instant multiplayer updates



## Environment Configuration

Create `.env` files in both backend and frontend directories for environment-specific settings:

**Backend `.env` example:**
```
DATABASE_URL=postgresql://user:password@localhost/coderacer_db
```



## Additional Resources

- API Documentation: Available at `http://localhost:8000/docs` when backend is running
- Architecture Documentation: See `backend/ARCHITECTURE.md`
- Multiplayer Setup: See `MULTIPLAYER_SETUP.md`

## Tekoälyn käyttö

- On käytetty GitHub Copilottia koodin muokkaamisessa/luonnissa ja uusien tiedostojen luonnissa
- Koko projekti Vibe Koodattu :D Varmasti huomaat
