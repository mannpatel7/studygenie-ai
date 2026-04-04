# AI Chatbot Feature - Implementation Guide

## 📋 What's Implemented

### ✅ Backend (Node.js + Express)

1. **Chat Service** (`backend/services/chatService.js`)
   - Handles API calls to OpenRouter
   - Supports context-based and regular questions
   - Uses Llama 3.8B Instruct model (free)

2. **Chat Controller** (`backend/controller/aiController.js`)
   - `chatWithAI()` endpoint handler
   - Accepts `message` and optional `context`
   - Updates user stats (chat messages tracked)

3. **Chat Route** (`backend/router/aiRouter.js`)
   - POST `/api/chat` endpoint
   - Integrated with existing router structure

### ✅ Frontend (React + TypeScript)

1. **Chat Component** (`src/pages/Chat.tsx`)
   - Full-featured chat UI with:
     - Message list with user/AI bubbles
     - Auto-scrolling conversation
     - Input box with Enter to send (Shift+Enter for newline)
     - Context input box (toggle visible/hidden)
     - Loading state with spinner
     - Error handling and alerts
     - "New Chat" button to clear history
   - Beautiful gradient background and dark mode support
   - Message timestamps

2. **App Integration** (`src/App.tsx`)
   - Chat route added: `/chat`
   - Protected route (requires authentication)

3. **Navigation** (`src/components/AppLayout.tsx`)
   - Chat menu item added to sidebar
   - Message icon for chat
   - Integrated with existing navigation

4. **Animations** (`src/App.css`)
   - Fade-in animation for messages

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ (for built-in fetch API)
- OpenRouter API key (free tier available)

### Step 1: Get OpenRouter API Key
1. Go to https://openrouter.ai
2. Sign up (free tier available)
3. Copy your API key

### Step 2: Set Environment Variables
Create/update `.env` file in the project root:
```bash
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
```

### Step 3: Install Dependencies (if needed)

**Backend:**
```bash
cd backend
npm install
# The following should already be installed:
# - express, cors, dotenv (for existing features)
# - node-fetch (if not already present)
```

If `node-fetch` is missing:
```bash
npm install node-fetch
```

**Frontend:**
```bash
# Already has all required dependencies:
# - react, typescript
# - lucide-react (icons)
# - UI components (shadcn/ui already configured)
```

### Step 4: Verify Dependencies

Ensure backend `package.json` has these (add if missing):
```json
{
  "dependencies": {
    "express": "^...",
    "cors": "^...",
    "dotenv": "^...",
    "node-fetch": "^3.x"
  }
}
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App runs on: http://localhost:5173 (or similar)
```

---

## 📝 API Documentation

### POST `/api/chat`

**Request:**
```json
{
  "message": "Explain photosynthesis",
  "context": "Optional: Paste text or PDF content here"
}
```

**Response:**
```json
{
  "response": "AI generated answer..."
}
```

**Examples:**

1. **Normal Question:**
```json
{
  "message": "What is the capital of Japan?"
}
```

2. **Context-Based Question:**
```json
{
  "message": "What are the main points?",
  "context": "The photosynthesis process is... [your text]"
}
```

---

## 🎯 Features Breakdown

### User Messages
- Input box at bottom with send button
- Press Enter to send (Shift+Enter for new line)
- Message appears immediately in chat

### AI Responses
- API called to OpenRouter
- Llama 3.8B processes request
- Response displayed in chat bubble
- Loading spinner while waiting

### Context Mode
- Click "📄 Add Context" to show context input
- Paste text, notes, or PDF content
- AI answers ONLY based on provided context
- Click "Clear" to remove context
- Shows context chunk count

### Error Handling
- Network errors caught and displayed
- User-friendly error messages
- Chat continues functioning after errors

### Chat History
- Messages persist in state during session
- "New Chat" button clears entire history
- Timestamps shown for each message

---

## 🤖 AI Behavior

**System Prompt includes:**
- Acts as friendly study tutor
- Provides clear, simple explanations
- Uses examples when helpful
- Encouraging and patient tone
- Study tips and strategies

**When Context Provided:**
- ONLY answers from provided text
- Returns: "I couldn't find the answer to your question in the provided material..." if not found
- Prevents hallucination

**When No Context:**
- Answers as general study assistant
- Can draw from general knowledge

---

## 📱 Responsive Design

- **Desktop:** Full-width layout with sidebar
- **Tablet:** Optimized spacing and touch-friendly
- **Mobile:** Responsive chat bubbles, collapsible sidebar

---

## 🎨 UI Components Used

- Button (shadcn/ui)
- Input (shadcn/ui)
- Textarea (shadcn/ui)
- Card (shadcn/ui)
- Alert (shadcn/ui)
- Icons from `lucide-react`:
  - MessageSquare (nav)
  - Send (button)
  - Loader (loading state)
  - AlertCircle (errors)

---

## 🔧 Customization

### Change AI Model
In `backend/services/chatService.js`, change:
```javascript
const MODEL = "meta-llama/llama-3-8b-instruct";
```

Available free models on OpenRouter:
- `meta-llama/llama-3-8b-instruct`
- `mistralai/mistral-7b-instruct`
- `nousresearch/nous-hermes-2-mixtral-8x7b-dpo`

### Change System Prompt
In `backend/services/chatService.js`, modify:
```javascript
let systemPrompt = `You are a friendly and helpful study tutor...`
```

### Adjust UI Colors
In `src/pages/Chat.tsx`:
- User message: `bg-blue-500` → change to your color
- AI message: `bg-white dark:bg-slate-700`
- Gradient: `from-blue-50 to-indigo-100`

---

## 🐛 Troubleshooting

### "Failed to get response from AI"
- ✅ Check OPENROUTER_API_KEY in `.env`
- ✅ Verify API key has credits (free tier limited)
- ✅ Check backend is running on correct port

### Messages not sending
- ✅ Ensure backend route is `/api/chat`
- ✅ Check CORS is enabled (already configured)
- ✅ No network errors in browser console

### Context not working
- ✅ Click "📄 Add Context" to show input
- ✅ Paste content before sending message
- ✅ Context sent with each message in that state

### Dark mode issues
- ✅ Component uses Tailwind dark mode classes
- ✅ Check if dark mode is enabled in app settings

---

## 📊 Stats Tracking

Chat messages are tracked in user stats:
```javascript
$inc: { chatMessages: 1 }
```

Updates dashboard activity feed:
```
"Had a chat with AI tutor"
```

---

## 🔒 Security Notes

- API key is backend-only (never exposed to frontend)
- User messages sent to OpenRouter API
- Context processed server-side only
- Token-based authentication required (existing system)

---

## 📦 Files Modified/Created

**Created:**
- `backend/services/chatService.js` - Chat API logic
- `src/pages/Chat.tsx` - React component

**Modified:**
- `backend/controller/aiController.js` - Added chatWithAI controller
- `backend/router/aiRouter.js` - Added /api/chat route
- `src/App.tsx` - Added Chat route
- `src/components/AppLayout.tsx` - Added Chat nav item
- `src/App.css` - Added fadeIn animation

---

## ✨ Next Steps

1. ✅ Set up .env with OPENROUTER_API_KEY
2. ✅ npm install (if needed)
3. ✅ Run backend: `npm run dev` (from backend folder)
4. ✅ Run frontend: `npm run dev`
5. ✅ Navigate to Chat page after logging in
6. ✅ Start chatting!

Enjoy your AI Tutor! 🎓
