import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileText, X, Sparkles, Loader2, Check, BookOpen, Brain, HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "../api/aiApi";
import { useContent } from "../context/ContentContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const contentTypes = [
  {
    id: 'summary',
    label: 'Summary',
    description: 'AI-generated summary of your document',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Interactive flashcards for quick learning',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    description: 'Multiple choice quiz to test your knowledge',
    icon: HelpCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { appendContent, setIsLoading, isLoading } = useContent();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") {
      setFile(f);
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const removeFile = () => {
    setFile(null);
  };

  const toggleContentType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerate = async () => {
    if (!file || selectedTypes.length === 0) return;

    setIsLoading(true);
    try {
      const result = await aiApi.generateContent(file, selectedTypes);

      // Store the generated content and preserve upload history
      appendContent(result);

      toast.success("Content generated successfully!");

      // Map content types to routes
      const routeMap: {[key: string]: string} = {
        'summary': '/summary',
        'flashcards': '/flashcards',
        'quiz': '/quiz',
        'study-plan': '/planner',
      };

      // Navigate based on selected types
      if (selectedTypes.length === 1) {
        navigate(routeMap[selectedTypes[0]] || `/${selectedTypes[0]}`);
      } else {
        navigate(routeMap[selectedTypes[0]] || `/${selectedTypes[0]}`);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = file && selectedTypes.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Upload PDF</h2>
        <p className="text-muted-foreground mt-2 text-lg">Transform your study materials into interactive learning content</p>
      </div>

      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xl font-semibold text-foreground">Step 1: Upload PDF</h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setFile(null);
              setSelectedTypes([]);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
              dragging
                ? "border-primary bg-accent scale-105"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
                <UploadIcon className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-lg">
                  Drop your PDF here or <span className="text-primary">browse</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Supports PDF files up to 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Content Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-foreground">Step 2: Choose Content Types</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedTypes.includes(type.id);

            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleContentType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`h-12 w-12 rounded-xl ${type.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{type.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTypes.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Selected: {selectedTypes.map(id => contentTypes.find(t => t.id === id)?.label).join(', ')}</span>
          </div>
        )}
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleGenerate}
          disabled={!isValid || isLoading}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Content...
            </>
          ) : isValid ? (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Content
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Select PDF and content types
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
