import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, Clock, BookOpen, Target, Sparkles, Upload as UploadIcon, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "../api/aiApi";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface PlanItem {
  date: string;
  topics: string[];
  hours: number;
  description?: string;
}

export default function Planner() {
  const { content, isLoading: contextLoading, appendContent, setContent } = useContent();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [examDate, setExamDate] = useState("");

  const { user } = useAuth();
  const generatedPlan = content?.studyPlan;
  const schedule = Array.isArray(generatedPlan?.schedule) ? generatedPlan.schedule : [];

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

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }
    if (!startDate || !examDate) {
      toast.error("Please choose both start and exam dates");
      return;
    }

    setLoading(true);
    try {
      const result = await aiApi.generateContent(file, ['study-plan'], {
        startDate,
        examDate,
      });
      appendContent(result);
      toast.success("Study plan generated successfully!");
    } catch (error) {
      toast.error(error as string);
    } finally {
      setLoading(false);
    }
  };

  // Premium access required for Study Planner
  if (user && !user.isPremium) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <Sparkles className="mx-auto h-14 w-14 text-primary" />
        <h2 className="text-3xl font-bold text-foreground">Study Planner</h2>
        <p className="text-muted-foreground">This feature is available only for premium members.</p>
        <p className="text-sm text-muted-foreground">Upgrade to unlock personalized study schedules and AI-powered planning.</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/upgrade">Upgrade to Premium</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show generated plan if available
  if (generatedPlan && schedule.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Study Planner</h2>
          <p className="text-muted-foreground mt-1">{generatedPlan.title}</p>
        </div>

        {contextLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {schedule.map((p: any, i: number) => {
              const safeTopics = Array.isArray(p.topics)
                ? p.topics
                : typeof p.topics === 'string'
                ? [p.topics]
                : [];

              const safeDate = p.date ? new Date(p.date) : null;
              const dateLabel = safeDate?.toString() !== 'Invalid Date'
                ? safeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : `Day ${i + 1}`;

              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-sm">{dateLabel}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {p.hours ?? '-'}h
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mb-3 italic">{p.description}</p>
                  )}
                  <ul className="space-y-2">
                    {safeTopics.length > 0 ? (
                      safeTopics.map((t: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                          <Target className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted-foreground">No topics available</li>
                    )}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <Button
          onClick={() => {
            setFile(null);
            setContent(null);
          }}
          variant="outline"
          className="mt-6"
        >
          Upload New Syllabus
        </Button>
      </div>
    );
  }

  // Upload form
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Study Planner</h2>
        <p className="text-muted-foreground mt-2 text-lg">Upload your syllabus to generate an AI-powered study schedule</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Start Learning Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Exam Date</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-foreground">Upload Syllabus</h3>

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
                  Drop your syllabus here or <span className="text-primary">browse</span>
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

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleGenerate}
          disabled={!file || loading}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Study Plan
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
