import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, Clock, BookOpen, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PlanItem {
  day: string;
  tasks: string[];
  hours: number;
}

const mockPlan: PlanItem[] = [
  { day: "Monday", tasks: ["Biology Ch.1-3 Review", "Flashcard Practice"], hours: 3 },
  { day: "Tuesday", tasks: ["Chemistry Lab Notes", "Practice Problems Set A"], hours: 2.5 },
  { day: "Wednesday", tasks: ["Physics Equations Review", "Take Practice Quiz"], hours: 3 },
  { day: "Thursday", tasks: ["Organic Chemistry Mechanisms", "Group Study Session"], hours: 4 },
  { day: "Friday", tasks: ["Review Weak Areas", "Timed Practice Test"], hours: 2 },
  { day: "Saturday", tasks: ["Full Mock Exam", "Analyze Mistakes"], hours: 5 },
  { day: "Sunday", tasks: ["Light Review", "Rest & Recharge"], hours: 1 },
];

export default function Planner() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [plan, setPlan] = useState<PlanItem[]>(mockPlan);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) { toast.error("Please enter a subject"); return; }
    setLoading(true);
    setPlan([]);
    setTimeout(() => {
      setPlan(mockPlan);
      setLoading(false);
      toast.success("Study plan generated!");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Study Planner</h2>
        <p className="text-muted-foreground mt-1">AI-powered study schedule for your exams</p>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
