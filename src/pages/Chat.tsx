import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, FileText, X, CheckCircle } from "lucide-react";
import { usePdfContext } from "@/contexts/PdfContext";

export type Role = "user" | "assistant";

export interface MessageReply {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

const ChatBubble: React.FC<{ role: Role; content: string }> = ({
  role,
  content,
}) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`mb-3 flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] px-4 py-2 text-[14px] font-semibold shadow-sm transition-colors duration-200 sm:max-w-[80%] sm:px-5 sm:py-2.5 sm:text-[15px] ${
          isUser
            ? "rounded-[16px] rounded-br-[4px] border border-neutral-100 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            : "rounded-[16px] rounded-bl-[4px] border border-sky-400/20 bg-[#1DA1F2] text-white shadow-sky-500/10 dark:bg-sky-600"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
};

interface AiInputBarProps {
  onSend: (msg: string) => void;
  onPdfUpload: (file: File) => void;
  isLoading: boolean;
  isUploading: boolean;
  placeholderText: string;
}

const AiInputBar: React.FC<AiInputBarProps> = ({
  onSend,
  onPdfUpload,
  isLoading,
  isUploading,
  placeholderText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue.trim());
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onPdfUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-[700px] px-3 pb-4 sm:px-4 sm:pb-24">
      <motion.div
        layout
        className="relative flex items-center rounded-2xl border border-neutral-100/50 bg-white p-1.5 shadow-sm transition-colors duration-200 sm:rounded-[28px] sm:p-2 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          title="upload pdf"
          type="button"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-300" />
          ) : (
            <Plus size={20} className="sm:size-[22px]" strokeWidth={2.5} />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholderText}
          className="flex-1 bg-transparent px-3 py-2 text-[15px] text-neutral-700 transition-colors outline-none placeholder:text-neutral-400 sm:px-4 sm:py-3 sm:text-[17px] dark:text-neutral-200 dark:placeholder:text-neutral-500"
          disabled={isLoading}
        />

        <div className="mr-1">
          <button
            title="send"
            onClick={handleSubmit}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-black/70 transition-colors hover:bg-neutral-100 sm:h-12 sm:w-12 sm:rounded-2xl dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <motion.div
              animate={{ rotate: inputValue.length > 0 ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ArrowLeft size={20} className="sm:size-[22px]" strokeWidth={2.5} />
            </motion.div>
          </button>
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/60 backdrop-blur-[1px] dark:bg-neutral-900/60"
          />
        )}
      </motion.div>
    </div>
  );
};

const fetchAiResponse = async (message: string, context?: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      context: context || undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to get response from AI");
  }

  const data = await response.json();
  return data.response as string;
};

export default function Chat() {
  const { pdfText, fileName, pdfDocuments, activePdfId, addPdfDocument, removePdfDocument, setActivePdf, isUploading, setIsUploading } = usePdfContext();
  
  const [messages, setMessages] = useState<MessageReply[]>(() => {
    try {
      const saved = localStorage.getItem("chatMessages");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (e) {
      console.error("Failed to load chat messages", e);
    }
    return [
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your AI study tutor. Upload a PDF or ask me anything, and I'll help you learn effectively.",
        timestamp: new Date(),
      },
    ];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your AI study tutor. Upload a PDF or ask me anything, and I'll help you learn effectively.",
        timestamp: new Date(),
      },
    ]);
    localStorage.removeItem("chatMessages");
  };

  const handlePdfUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const extractedText = await extractPdfText(file);
      addPdfDocument(extractedText, file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload PDF"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    // Send PDF to backend for text extraction
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract-pdf-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract PDF text");
    }

    const data = await response.json();
    // Return the full extracted text for use as chat context
    return data.text;
  };

  const handleSend = async (content: string) => {
    setError("");
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const reply = await fetchAiResponse(content, pdfText || undefined);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: message,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#F8F9FA] transition-colors duration-300 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4">
        <div className="mb-4 flex flex-col gap-2 rounded-[32px] border border-neutral-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/80 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              AI Study Tutor {pdfDocuments.length > 0 && `(${pdfDocuments.length} PDF${pdfDocuments.length !== 1 ? 's' : ''})`}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {pdfDocuments.length > 0 
                ? `Using: ${fileName}` 
                : 'Upload a PDF and ask questions about it, or just chat normally.'}
            </p>
          </div>
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Clear Chat
          </button>
          {pdfDocuments.length > 0 && (
            <button
              onClick={() => setShowPdfPanel(!showPdfPanel)}
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              <FileText size={16} />
              {showPdfPanel ? 'Hide' : 'Show'} Documents
            </button>
          )}
        </div>

        {/* PDF Documents Panel */}
        <AnimatePresence>
          {showPdfPanel && pdfDocuments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2 rounded-[32px] border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                📚 Your Uploaded Documents
              </p>
              <div className="space-y-2">
                {pdfDocuments.map((pdf) => (
                  <div
                    key={pdf.id}
                    onClick={() => {
                      setActivePdf(pdf.id);
                      setShowPdfPanel(false);
                    }}
                    className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-3 transition ${
                      activePdfId === pdf.id
                        ? 'border-blue-500 bg-white dark:border-blue-400 dark:bg-blue-900/40'
                        : 'border-transparent bg-white/60 hover:border-blue-300 dark:bg-neutral-800/60 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {activePdfId === pdf.id && (
                          <CheckCircle size={16} className="flex-shrink-0 text-green-600 dark:text-green-400" />
                        )}
                        <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                          {pdf.fileName}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {(pdf.size / 1000).toFixed(1)}KB • {pdf.uploadedAt.toLocaleDateString()} {pdf.uploadedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePdfDocument(pdf.id);
                      }}
                      className="flex-shrink-0 rounded-lg p-1.5 text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-900/30"
                      title="Remove PDF"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-3 sm:px-4">
        <div className="mx-auto w-full max-w-2xl pb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatBubble key={message.id} {...message} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex justify-center px-3 sm:px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        </div>
      )}

      <div className="mb-0 flex items-center justify-center sm:mb-6">
        <AiInputBar
          onSend={handleSend}
          onPdfUpload={handlePdfUpload}
          isLoading={isLoading}
          isUploading={isUploading}
          placeholderText="Ask me anything..."
        />
      </div>
    </div>
  );
}
