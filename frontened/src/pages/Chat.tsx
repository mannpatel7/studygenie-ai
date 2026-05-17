import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Upload, FileText, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";
import { aiApi } from "../api/aiApi";
import { pdfApi } from "../api/pdfApi";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";

export default function Chat() {
  const { user } = useAuth();
  const { chatMessages, appendChatMessage, setChatMessages, pdfText, pdfName, setPdfData } = useContent();
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    try {
      const result = await pdfApi.uploadPDF(file);
      setPdfData(result.text, result.filename);
      toast.success("PDF uploaded and text extracted successfully!");
    } catch (error) {
      toast.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: "user", content: inputMessage };
    appendChatMessage(userMessage);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await aiApi.chatWithAI({
        message: inputMessage,
        context: pdfText || null,
      });

      const aiMessage = { role: "assistant", content: response.response };
      appendChatMessage(aiMessage);
    } catch (error) {
      toast.error(error);
      // Remove the user message if API failed
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const handleRemovePdf = () => {
    setPdfData('', '');
  };

  if (user && !user.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6 text-center">
          <div className="rounded-3xl border border-border bg-card p-10 shadow-card">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mt-4">AI Chat is Premium</h1>
            <p className="text-muted-foreground mt-2">
              AI Chat access is included with premium membership. Upgrade to ask study questions and get smart responses.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link to="/upgrade">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Study Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ask questions and get help with your studies. Upload a PDF to get context-aware answers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                PDF Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <div className="text-center">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploading ? "Processing..." : "Click to upload PDF"}
                      </p>
                    </div>
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>

                {pdfName && (
                  <div className="flex flex-col gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300 truncate">
                        {pdfName}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemovePdf}>
                      Remove PDF
                    </Button>
                  </div>
                )}

                {pdfText && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Context loaded ({pdfText.length} characters)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat
              </CardTitle>
              {chatMessages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearChat}>
                  Clear Chat
                </Button>
              )}
            </div>
          </CardHeader>
            <CardContent>
              <div className="flex flex-col h-96">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation! Upload a PDF for context-aware answers.</p>
                      </div>
                    )}
                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-2 mt-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim()}
                    size="icon"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}