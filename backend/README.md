# StudyGenie AI Backend

**Live Project**: [https://studygenie-ai-ec6p.vercel.app/](https://studygenie-ai-ec6p.vercel.app/)

A Node.js backend for StudyGenie AI application with Express, MongoDB, and OpenRouter AI integration.

## Features

- User authentication with JWT
- PDF upload and text extraction
- AI-powered content generation (summaries, flashcards, quizzes, study plans)
- MongoDB database with Mongoose ODM
- RESTful API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **OpenRouter AI** - AI service integration
- **multer** - File upload handling
- **pdf-parse** - PDF text extraction

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (protected)

### AI Features
- `POST /api/ai/summary` - Generate summary from text
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/study-plan` - Generate study plan

### PDF
- `POST /api/pdf/upload` - Upload PDF and extract text

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── aiController.js       # AI features
│   └── pdfController.js      # PDF handling
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Summary.js           # Summary model
│   ├── Flashcard.js         # Flashcard model
│   ├── Quiz.js              # Quiz model
│   └── StudyPlan.js         # Study plan model
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── userRoutes.js        # User routes
│   ├── aiRoutes.js          # AI routes
│   └── pdfRoutes.js         # PDF routes
├── services/
│   └── openrouterService.js # OpenRouter AI service
├── utils/
│   └── generateToken.js     # JWT token generation
├── uploads/                 # Uploaded files directory
├── .env                     # Environment variables
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENROUTER_API_KEY` - API key for OpenRouter service

## Usage

1. Start the server
2. Use tools like Postman or curl to test the API endpoints
3. All AI endpoints require authentication (Bearer token in Authorization header)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request