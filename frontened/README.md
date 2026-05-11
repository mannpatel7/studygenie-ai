# StudyGenie AI Frontend

A React frontend application with Vite and Tailwind CSS for StudyGenie AI, featuring AI-powered study tools.

## Features

- **Authentication**: Login/Register with JWT tokens
- **PDF Upload**: Drag & drop PDF upload with text extraction
- **AI Summary**: Generate intelligent summaries from documents
- **Flashcards**: Interactive flashcards with flip animation
- **Quiz**: Multiple choice questions with scoring
- **Study Planner**: AI-generated study schedules
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animation library
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API layer
│   │   ├── axios.js           # Axios configuration
│   │   ├── authApi.js         # Authentication API
│   │   ├── aiApi.js           # AI features API
│   │   └── pdfApi.js          # PDF upload API
│   ├── components/            # Reusable components
│   ├── context/               # React context providers
│   │   └── AuthContext.jsx    # Authentication context
│   ├── pages/                 # Page components
│   │   ├── Auth.tsx           # Login/Register
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Upload.tsx         # PDF upload
│   │   ├── Summary.tsx        # AI summaries
│   │   ├── Flashcards.tsx     # Flashcard viewer
│   │   ├── Quiz.tsx           # Quiz interface
│   │   ├── Planner.tsx        # Study planner
│   │   └── NotFound.tsx       # 404 page
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   └── App.tsx                # Main app component
├── public/                    # Static assets
└── package.json               # Dependencies
```

## API Integration

### Base URL
```
http://localhost:5000
```

### Authentication Flow
1. User registers/logs in through Auth page
2. JWT token stored in localStorage
3. Axios interceptor automatically adds Bearer token to requests
4. 401 responses trigger automatic logout and redirect

### API Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/pdf/upload` - PDF upload and text extraction
- `POST /api/ai/summary` - Generate document summaries
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/study-plan` - Generate study plans

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Environment Setup

The frontend connects to the backend running on `http://localhost:5000`. Make sure the backend server is running before starting the frontend.

## Key Features Implementation

### Authentication Context
- Manages user state across the application
- Handles login, register, and logout
- Protects routes based on authentication status

### API Layer
- Centralized axios configuration
- Automatic JWT token attachment
- Global error handling with toast notifications
- Separate API modules for different features

### Route Protection
- Public routes (Auth) redirect authenticated users to dashboard
- Protected routes redirect unauthenticated users to login
- Loading states during authentication checks

### File Upload
- Drag & drop interface with visual feedback
- File validation (PDF only, size limits)
- Progress indicators and error handling

### AI Features
- Real-time content generation from uploaded PDFs
- Interactive flashcards with flip animations
- Quiz system with scoring and feedback
- Study planner with date-based scheduling

## Development Notes

- Uses TypeScript for type safety
- Implements responsive design patterns
- Follows React best practices with hooks and context
- Includes loading states and error boundaries
- Optimized bundle size with Vite

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new components
3. Implement proper error handling
4. Add loading states for async operations
5. Test on multiple screen sizes
6. Follow Tailwind CSS utility patterns
