import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';

interface GeneratedContent {
  summary?: {
    id: string;
    content: string;
    title: string;
    createdAt: string;
  };
  flashcards?: Array<{
    id: string;
    question: string;
    answer: string;
    subject: string;
  }>;
  quiz?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
  }>;
  studyPlan?: {
    id: string;
    content: string;
    title: string;
    schedule: Array<{
      date: string;
      topics: string[];
      hours: number;
      description?: string;
    }>;
    createdAt: string;
  };
  filename?: string;
  extractedText?: string;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

interface ContentContextType {
  content: GeneratedContent | null;
  history: GeneratedContent[];
  chatMessages: ChatMessage[];
  pdfText: string;
  pdfName: string;
  setContent: (content: GeneratedContent | null) => void;
  appendContent: (content: GeneratedContent) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  appendChatMessage: (message: ChatMessage) => void;
  setPdfData: (text: string, filename: string) => void;
  clearContent: () => void;
  clearSummary: () => void;
  clearFlashcards: () => void;
  clearQuiz: () => void;
  clearStudyPlan: () => void;
  persistGuestState: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const getStorageKey = (userId: string | null) => `studygenie-content-${userId ?? 'guest'}`;

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider = ({ children }: ContentProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pdfText, setPdfText] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userKeyRef = useRef<string | null>(null);

  const removeStoredContent = (storageKey?: string | null) => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    localStorage.removeItem(getStorageKey('guest'));
  };

  const saveStateToStorage = (storageKey: string | null) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ content, history, chatMessages, pdfText, pdfName }));
  };

  const persistGuestState = () => {
    saveStateToStorage(getStorageKey('guest'));
    userKeyRef.current = getStorageKey('guest');
  };

  const clearContentState = () => {
    setContent(null);
    setHistory([]);
    setChatMessages([]);
    setPdfText('');
    setPdfName('');
  };

  useEffect(() => {
    if (authLoading) {
      console.log("[ContentContext] authLoading is true, skipping load");
      return;
    }

    const storageKey = user
      ? getStorageKey(user._id || user.id || user.email || 'guest')
      : getStorageKey('guest');
    userKeyRef.current = storageKey;

    if (!user) {
      console.log("[ContentContext] No user logged in, loading guest state from", storageKey);
    }

    const saved = localStorage.getItem(storageKey);
    console.log("[ContentContext] Loading from localStorage key:", storageKey, "Saved data exists:", !!saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed && Array.isArray(parsed.history)) {
          setHistory(parsed.history);
          setContent(parsed.content ?? parsed.history[parsed.history.length - 1] ?? null);
          setChatMessages(parsed.chatMessages ?? []);
          setPdfText(parsed.pdfText ?? '');
          setPdfName(parsed.pdfName ?? '');
          console.log("[ContentContext] Successfully loaded history array of length:", parsed.history.length);
        } else if (parsed && typeof parsed === 'object') {
          setHistory(parsed.content ? [parsed.content] : []);
          setContent(parsed.content ?? null);
          setChatMessages(parsed.chatMessages ?? []);
          setPdfText(parsed.pdfText ?? '');
          setPdfName(parsed.pdfName ?? '');
          console.log("[ContentContext] Successfully loaded single content object");
        }
      } catch (error) {
        console.error('[ContentContext] Failed to parse saved content:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!userKeyRef.current) {
      console.log("[ContentContext] Skipping save: userKeyRef.current is null");
      return;
    }

    console.log("[ContentContext] Writing to localStorage key:", userKeyRef.current, "History length:", history.length);
    localStorage.setItem(userKeyRef.current, JSON.stringify({ content, history, chatMessages, pdfText, pdfName }));
  }, [content, history, chatMessages, pdfText, pdfName]);

  const appendContent = (newContent: GeneratedContent) => {
    setHistory((prev) => [...prev, newContent]);
    setContent(newContent);
  };

  const appendChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const setPdfData = (text: string, filename: string) => {
    setPdfText(text);
    setPdfName(filename);
  };

  const removeContentField = (field: keyof GeneratedContent) => {
    setContent((prev) => {
      if (!prev) return null;
      const updated = { ...prev } as GeneratedContent;
      delete updated[field];
      return Object.keys(updated).length > 0 ? updated : null;
    });
  };

  const clearSummary = () => removeContentField('summary');
  const clearFlashcards = () => removeContentField('flashcards');
  const clearQuiz = () => removeContentField('quiz');
  const clearStudyPlan = () => removeContentField('studyPlan');

  const clearContent = () => {
    if (userKeyRef.current) {
      localStorage.removeItem(userKeyRef.current);
    }
    clearContentState();
    userKeyRef.current = null;
  };

  const value = {
    content,
    history,
    chatMessages,
    pdfText,
    pdfName,
    setContent,
    appendContent,
    setChatMessages,
    appendChatMessage,
    setPdfData,
    clearContent,
    clearSummary,
    clearFlashcards,
    clearQuiz,
    clearStudyPlan,
    persistGuestState,
    isLoading,
    setIsLoading,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};