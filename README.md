# StudyGenie AI

**🚀 Live Project**: [https://studygenie-ai-ec6p.vercel.app/](https://studygenie-ai-ec6p.vercel.app/)

An AI-powered study tool that helps students generate summaries, flashcards, quizzes, and study plans from PDF documents. Built with React, Node.js, and OpenRouter AI.

## 📋 Overview

StudyGenie AI simplifies studying by leveraging artificial intelligence to transform your documents into actionable study materials. Upload a PDF, choose what type of content you need, and let AI do the heavy lifting.

### Key Features

- **📄 PDF Upload**: Drag-and-drop PDF upload with automatic text extraction
- **📝 AI Summaries**: Generate concise summaries of document content
- **🎴 Flashcards**: Create interactive flashcards for memorization
- **❓ Quizzes**: Generate multiple-choice quizzes with instant scoring
- **📅 Study Plans**: Get AI-generated study schedules tailored to your pace
- **👤 User Authentication**: Secure login/registration with JWT
- **📊 Dashboard**: Track your study progress and generated content
- **📱 Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **OpenRouter API** - AI integration
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction

### Deployment
- **Vercel** - Frontend & Backend (serverless)
- **MongoDB Atlas** - Database hosting

## 📂 Project Structure

```
studygenie-ai/
├── backend/              # Node.js Express server
│   ├── controllers/      # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication & utilities
│   ├── services/         # AI & external services
│   └── README.md         # Backend documentation
├── frontened/            # React Vite application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # State management
│   │   ├── api/          # API client
│   │   └── hooks/        # Custom React hooks
│   └── README.md         # Frontend documentation
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your environment variables:
# - MONGO_URI
# - JWT_SECRET
# - OPENROUTER_API_KEY
# - PORT (optional, defaults to 5000)

# Start server
npm run dev
```

See [backend/README.md](backend/README.md) for detailed setup.

### Frontend Setup

```bash
cd frontened

# Install dependencies
npm install

# Create .env file (if needed)
# Add VITE_API_URL pointing to your backend

# Start dev server
npm run dev
```

See [frontened/README.md](frontened/README.md) for detailed setup.

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### AI Features
- `POST /api/ai/summary` - Generate summary from PDF
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/quiz` - Generate quiz questions
- `POST /api/ai/study-plan` - Generate study plan

### PDF Processing
- `POST /api/pdf/upload` - Upload and extract PDF text

### User
- `GET /api/user/profile` - Get user profile (authenticated)

See [backend/README.md](backend/README.md) for complete API documentation.

## 🎯 Features in Detail

### PDF Upload & Processing
- Upload single or multiple PDFs
- Automatic text extraction and storage
- Support for documents up to 10MB

### AI Content Generation
- **Summaries**: Concise overviews of document content
- **Flashcards**: Question-answer pairs for active recall
- **Quizzes**: Multiple-choice questions with scoring system
- **Study Plans**: Day-by-day study schedules

### User Experience
- Clean, intuitive interface
- Real-time content generation
- Saved content accessible in dashboard
- One-click content deletion (per-page)
- Dark/light theme toggle
- Mobile-responsive design

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes with middleware
- Environment variable protection
- CORS configuration
- Input validation and sanitization

## 📊 Deployment

### Frontend & Backend
- Deployed on Vercel serverless platform
- Automatic deployment on push to main
- Environment variables configured in Vercel dashboard

### Database
- MongoDB Atlas for cloud database storage
- Automatic backups and point-in-time recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 📚 Additional Resources

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontened/README.md)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**Made with ❤️ for better learning**

Last Updated: June 2026
