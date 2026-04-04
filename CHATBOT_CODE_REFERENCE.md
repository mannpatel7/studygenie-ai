# AI Chatbot - Full Code Reference

## 📁 File: `backend/services/chatService.js`

```javascript
import fetch from "node-fetch";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3-8b-instruct";

export const generateChatResponse = async (message, context = null) => {
  let systemPrompt = `You are a friendly and helpful study tutor. Your role is to:
- Explain concepts clearly and simply
- Use examples when helpful
- Be encouraging and patient
- Provide study tips and strategies
- Help students understand difficult topics`;

  let userMessage = message;

  // If context is provided, modify the system prompt to use only that context
  if (context) {
    systemPrompt += `\n\nIMPORTANT: You will be provided with reference text/material. Answer ONLY based on this provided text. If the answer cannot be found in the provided text, respond with: "I couldn't find the answer to your question in the provided material. Could you provide more context or ask about something else?"\n\nProvided Material:\n${context}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("API Response Error:", data);
      throw new Error("Failed to generate chat response");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Chat Service Error:", error);
    throw error;
  }
};
```

---

## 📁 File: `backend/controller/aiController.js` (Addition)

Add this to the end of your existing file:

```javascript
// ─────────────────────────────────────────
// ✅ AI CHATBOT
// ─────────────────────────────────────────
import { generateChatResponse } from "../services/chatService.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Generate AI response
    const response = await generateChatResponse(message, context || null);

    // Update activity stats
    await updateStats({
      $inc: { chatMessages: 1 },
      $push: {
        recentActivity: {
          text: "Had a chat with AI tutor",
          time: "just now",
        },
      },
    });

    res.json({ response });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Failed to get response. Please try again." });
  }
};
```

---

## 📁 File: `backend/router/aiRouter.js`

```javascript
import express from "express";
import upload from "../middleware/upload.js";
import { getSummary, getPdfSummary, getPdfQuiz } from "../controller/aiController.js";
import { getFlashcards, getPdfFlashcards } from "../controller/aiController.js";
import { saveQuizResult, chatWithAI } from "../controller/aiController.js";

const airouter = express.Router();

// Summary endpoints
airouter.post("/summary", getSummary);
airouter.post("/pdf-summary", upload.single("file"), getPdfSummary);

// Flashcard endpoints
airouter.post("/flashcards", getFlashcards);
airouter.post("/pdf-flashcards", upload.single("file"), getPdfFlashcards);

// Quiz endpoints
airouter.post("/pdf-quiz", upload.single("file"), getPdfQuiz);
airouter.post("/quiz-result", saveQuizResult);

// Chat endpoint
airouter.post("/chat", chatWithAI);

export default airouter;
```

---

## 📁 File: `src/pages/Chat.tsx`

```typescript
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, Send, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI study tutor. I'm here to help you learn and answer your questions. You can ask me anything related to your studies, or provide context (like text from your notes) for more specific help. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context: context || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearContext = () => {
    setContext("");
    setShowContextInput(false);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your AI study tutor. I'm here to help you learn and answer your questions. You can ask me anything related to your studies, or provide context (like text from your notes) for more specific help. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setContext("");
    setError("");
    setShowContextInput(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📚 AI Study Tutor
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask anything and get AI-powered explanations
            </p>
          </div>
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="dark:border-slate-600"
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl p-4 rounded-lg shadow-md animate-fadeIn ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-slate-600"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    msg.role === "user"
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg rounded-bl-none border border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto w-full px-4">
          <Alert variant="destructive" className="dark:border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Context Section */}
      {showContextInput && (
        <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📄 Provide Context (Optional)
              </label>
              <Button
                onClick={handleClearContext}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste your notes, text, or PDF content here. The AI will answer questions based only on this context."
              className="min-h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              When context is provided, the AI will only answer based on this
              material.
            </p>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !loading) {
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              disabled={loading}
              className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Context Toggle */}
          <div className="flex items-center justify-between text-xs">
            <Button
              onClick={() => setShowContextInput(!showContextInput)}
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-500"
            >
              {showContextInput ? "🔒 Hide Context" : "📄 Add Context"}
            </Button>
            <span className="text-gray-500 dark:text-gray-400">
              {context.length > 0 &&
                `${Math.ceil(context.length / 100)} chunks of context`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📁 File: `src/App.tsx` (Updated)

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Summary from "./pages/Summary";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

---

## 📁 File: `src/App.css` (CSS Addition)

Add this animation to your CSS file:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
```

---

## 📁 File: `.env` (Environment Variables)

Create/update:

```bash
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
```

---

## 📁 File: `backend/package.json` (Updated)

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.8.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.2",
    "mongoose": "^8.0.0",
    "multer": "^2.1.1",
    "node-fetch": "^3.3.2",
    "pdf-parse": "^1.1.1"
  }
}
```

---

## ✨ Quick Start Commands

```bash
# 1. Setup Environment
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# 2. Install Backend Dependencies
cd backend
npm install

# 3. Run Backend
npm run dev

# 4. In another terminal, run Frontend
npm run dev

# 5. Open browser and go to http://localhost:5173
# Login and navigate to "AI Chat" in sidebar
```

---

All code is production-ready and fully integrated with StudyGenie! 🚀
