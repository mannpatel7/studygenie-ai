import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, Clock, Target, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface PlanItem {
  day: string;
  tasks: string[];
  hours: number;
}

export default function Planner() {
  const [file, setFile] = useState<File | null>(() => {
    try {
      const saved = localStorage.getItem("plannerFile");
      if (saved) {
        const { name, size, type } = JSON.parse(saved);
        return new File([new ArrayBuffer(0)], name, { type });
      }
    } catch (e) {
      console.error("Failed to load file", e);
    }
    return null;
  });
  const [examDate, setExamDate] = useState(() => {
    try {
      return localStorage.getItem("plannerExamDate") || "";
    } catch (e) {
      return "";
    }
  });
  const [hoursPerDay, setHoursPerDay] = useState(() => {
    try {
      return localStorage.getItem("plannerHoursPerDay") || "";
    } catch (e) {
      return "";
    }
  });
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem("studyPlan");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load study plan", e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("studyPlan", JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    if (examDate) {
      localStorage.setItem("plannerExamDate", examDate);
    } else {
      localStorage.removeItem("plannerExamDate");
    }
  }, [examDate]);

  useEffect(() => {
    if (hoursPerDay) {
      localStorage.setItem("plannerHoursPerDay", hoursPerDay);
    } else {
      localStorage.removeItem("plannerHoursPerDay");
    }
  }, [hoursPerDay]);

  useEffect(() => {
    if (file) {
      localStorage.setItem(
        "plannerFile",
        JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
        })
      );
    } else {
      localStorage.removeItem("plannerFile");
    }
  }, [file]);

  const handleClear = () => {
    setFile(null);
    setExamDate("");
    setHoursPerDay("");
    setPlan([]);
    localStorage.removeItem("plannerFile");
    localStorage.removeItem("plannerExamDate");
    localStorage.removeItem("plannerHoursPerDay");
    localStorage.removeItem("studyPlan");
  };

  const handleFileChange = (fileInput: File | null) => {
    if (!fileInput) return;
    if (fileInput.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setFile(fileInput);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload your syllabus PDF");
      return;
    }

    if (!examDate) {
      toast.error("Please choose an exam date");
      return;
    }

    if (!hoursPerDay || Number(hoursPerDay) <= 0) {
      toast.error("Please enter a valid hours per day");
      return;
    }

    setLoading(true);
    setPlan([]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("examDate", examDate);
      formData.append("hoursPerDay", String(Number(hoursPerDay)));

      const response = await fetch("/api/study-plan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate study plan");
      }

      const data = await response.json();

      if (!data.plan || !Array.isArray(data.plan)) {
        throw new Error("Invalid plan data received from server");
      }

      setPlan(data.plan);
      toast.success("Study plan generated!");
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Unable to generate study plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Study Planner</h2>
          <p className="text-muted-foreground mt-1">AI-powered study schedule for your exams</p>
        </div>
        {(file || examDate || hoursPerDay || plan.length > 0) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white text-sm font-medium transition-colors"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Syllabus PDF</label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring p-2"
              />
            </div>
            {file ? (
              <p className="mt-2 text-sm text-muted-foreground">Selected file: {file.name}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Upload your syllabus PDF to generate a study plan.</p>
            )}
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
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Hours/Day</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="e.g. 3"
                min="1"
                max="12"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full sm:w-auto px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate Plan
        </button>
      </form>

      {/* Plan Output */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : plan.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {plan.map((p, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{p.day}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {p.hours}h
                </div>
              </div>
              <ul className="space-y-2">
                {p.tasks.map((t, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}
