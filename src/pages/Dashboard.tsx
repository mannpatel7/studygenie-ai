import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Layers, HelpCircle, Clock, TrendingUp,
  BookOpen, Target, Flame, ChevronRight, BarChart2,
  ArrowUpRight, Brain, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── DUMMY DATA (replace with real API response shape) ──────────────────────
const DUMMY: DashboardData = {
  pdfsUploaded: 14,
  flashcards: 238,
  quizzesTaken: 27,
  avgScore: 74,
  studyHours: "38.5h",

  weeklyStudy: [
    { day: "Mon", hours: 1.5 },
    { day: "Tue", hours: 2.0 },
    { day: "Wed", hours: 0.5 },
    { day: "Thu", hours: 3.0 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 4.0 },
    { day: "Sun", hours: 1.0 },
  ],

  quizScores: [
    { quiz: "Bio Ch1",  score: 80 },
    { quiz: "Chem",     score: 65 },
    { quiz: "Physics",  score: 90 },
    { quiz: "Math",     score: 55 },
    { quiz: "History",  score: 70 },
    { quiz: "English",  score: 85 },
  ],

  flashcardsByPdf: [
    { name: "Biology",   cards: 62,  color: "#34d399" },
    { name: "Chemistry", cards: 48,  color: "#60a5fa" },
    { name: "Physics",   cards: 55,  color: "#a78bfa" },
    { name: "Math",      cards: 40,  color: "#fbbf24" },
    { name: "Other",     cards: 33,  color: "#f87171" },
  ],

  studyStreak: 6,
  masteredCards: 142,
  pendingCards: 96,

  recentActivity: [
    { text: "Generated quiz from Physics.pdf",        time: "2 min ago",  type: "quiz" },
    { text: "Created 18 flashcards from Biology.pdf", time: "1 hr ago",   type: "flash" },
    { text: "Summarised Chemistry notes",             time: "3 hrs ago",  type: "summary" },
    { text: "Scored 90% on Physics quiz",             time: "Yesterday",  type: "quiz" },
    { text: "Uploaded Math_Chapter4.pdf",             time: "Yesterday",  type: "upload" },
    { text: "Studied for 2h 15m",                    time: "2 days ago", type: "study" },
  ],

  topPdfs: [
    { name: "Biology_Full.pdf",    pages: 124, flashcards: 62, quizzes: 5 },
    { name: "Physics_Ch3.pdf",     pages: 48,  flashcards: 55, quizzes: 8 },
    { name: "Chemistry_Org.pdf",   pages: 88,  flashcards: 48, quizzes: 6 },
    { name: "Math_Chapter4.pdf",   pages: 36,  flashcards: 40, quizzes: 4 },
  ],
};

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface DashboardData {
  pdfsUploaded: number;
  flashcards: number;
  quizzesTaken: number;
  avgScore: number;
  studyHours: string;
  weeklyStudy: { day: string; hours: number }[];
  quizScores: { quiz: string; score: number }[];
  flashcardsByPdf: { name: string; cards: number; color: string }[];
  studyStreak: number;
  masteredCards: number;
  pendingCards: number;
  recentActivity: { text: string; time: string; type: string }[];
  topPdfs: { name: string; pages: number; flashcards: number; quizzes: number }[];
}

// ─── CUSTOM TOOLTIP ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{p.value}{p.unit || ""}</span>
        </p>
      ))}
    </div>
  );
};

// ─── ACTIVITY ICON ───────────────────────────────────────────────────────────
const activityMeta: Record<string, { color: string; bg: string; icon: any }> = {
  quiz:    { color: "text-blue-400",   bg: "bg-blue-500/10",   icon: HelpCircle },
  flash:   { color: "text-emerald-400",bg: "bg-emerald-500/10",icon: Layers },
  summary: { color: "text-violet-400", bg: "bg-violet-500/10", icon: FileText },
  upload:  { color: "text-amber-400",  bg: "bg-amber-500/10",  icon: BookOpen },
  study:   { color: "text-rose-400",   bg: "bg-rose-500/10",   icon: Clock },
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, accent, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-2xl border border-border bg-card p-5 flex justify-between items-start"
    >
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
          {sub}
        </p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
    </motion.div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/dashboard");
        const data = await res.json();
        // Merge so backend can override any field; fallback to dummy for missing fields
        setStats({ ...DUMMY, ...data,  avgScore: data.avgScore ?? 0, // ✅ ensure real value wins 
        });
      } 
      catch (error) {
        // Backend not running — use dummy data so UI always renders
        setStats(DUMMY);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-secondary" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-64 rounded-2xl bg-secondary" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalCards = stats.masteredCards + stats.pendingCards;
  const masteredPct = Math.round((stats.masteredCards / totalCards) * 100);

  const radialData = [
    { name: "Mastered", value: masteredPct, fill: "#34d399" },
    { name: "Pending",  value: 100 - masteredPct, fill: "#374151" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400" />
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Your learning at a glance</p>
      </motion.div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.05} title="PDFs Uploaded"  value={stats.pdfsUploaded}  sub="Total documents"   accent="bg-violet-500/15" icon={<FileText   className="h-5 w-5 text-violet-400" />} />
        <StatCard delay={0.10} title="Flashcards"     value={stats.flashcards}    sub="Across all PDFs"   accent="bg-emerald-500/15" icon={<Layers     className="h-5 w-5 text-emerald-400" />} />
        <StatCard delay={0.15} title="Quizzes Taken"  value={stats.quizzesTaken}  sub={`${stats.avgScore}% avg score`} accent="bg-blue-500/15" icon={<HelpCircle className="h-5 w-5 text-blue-400" />} />
        <StatCard delay={0.20} title="Study Hours"    value={3}    sub="Total time logged"  accent="bg-amber-500/15" icon={<Clock      className="h-5 w-5 text-amber-400" />} />
      </div>

      {/* ── STREAK + MASTERY ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
        >
          <div className="h-14 w-14 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Flame className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Study Streak</p>
            <p className="text-3xl font-bold text-foreground">0 <span className="text-base font-normal text-muted-foreground">days</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Keep it going! 🔥</p>
          </div>
        </motion.div>

        {/* Avg quiz score bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Avg Quiz Score</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-foreground">
  {stats.avgScore || 0}%
</p>
            <div className="flex-1 pb-1">
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgScore}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Across {stats.quizzesTaken} quizzes</span>
            <span className={stats.avgScore >= 70 ? "text-emerald-400" : "text-amber-400"}>
              {stats.avgScore >= 70 ? "Good" : stats.avgScore >= 50 ? "Fair" : "Needs work"}
            </span>
          </div>
        </motion.div>

        {/* Flashcard mastery donut */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Card Mastery</p>
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={radialData} cx="50%" cy="50%" innerRadius={26} outerRadius={38}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {radialData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{masteredPct}%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-muted-foreground">Mastered</span>
                <span className="font-semibold text-foreground ml-auto">{stats.masteredCards}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-foreground ml-auto">{stats.pendingCards}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs pt-0.5 border-t border-border">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground ml-auto">{totalCards}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── CHARTS ROW 1 ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Weekly study hours area chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <SectionHeader title="Weekly Study Hours" sub="Hours logged per day this week" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.weeklyStudy} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground, #6b7280)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground, #6b7280)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" name="Hours" stroke="#8b5cf6"
                strokeWidth={2.5} fill="url(#studyGrad)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#8b5cf6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quiz scores bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <SectionHeader title="Quiz Scores" sub="Score % per quiz taken" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.quizScores} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="quiz" tick={{ fontSize: 10, fill: "var(--muted-foreground, #6b7280)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground, #6b7280)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                {stats.quizScores.map((e, i) => (
                  <Cell key={i}
                    fill={e.score >= 80 ? "#34d399" : e.score >= 60 ? "#60a5fa" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[
              { color: "#34d399", label: "≥ 80%" },
              { color: "#60a5fa", label: "60–79%" },
              { color: "#f87171", label: "< 60%" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── CHARTS ROW 2 ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Flashcards by PDF pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <SectionHeader title="Flashcards by PDF" sub="Distribution across uploaded documents" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={stats.flashcardsByPdf} cx="50%" cy="50%"
                  innerRadius={42} outerRadius={72}
                  dataKey="cards" nameKey="name"
                  paddingAngle={3} strokeWidth={0}>
                  {stats.flashcardsByPdf.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.flashcardsByPdf.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{e.name}</span>
                  <span className="text-xs font-semibold text-foreground">{e.cards}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top PDFs table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <SectionHeader title="Top PDFs" sub="Most studied documents" />
          <div className="space-y-2">
            {stats.topPdfs.map((pdf, i) => (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{pdf.name}</p>
                  <p className="text-xs text-muted-foreground">{pdf.pages} pages</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-emerald-400">{pdf.flashcards}</p>
                    <p className="text-[10px] text-muted-foreground">cards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-blue-400">{pdf.quizzes}</p>
                    <p className="text-[10px] text-muted-foreground">quizzes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RECENT ACTIVITY ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.47 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your latest actions</p>
          </div>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="divide-y divide-border">
          {stats.recentActivity
            .slice(0, showAllActivity ? stats.recentActivity.length : 5)
            .map((item, i) => {
              const meta = activityMeta[item.type] || activityMeta.study;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.text}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </motion.div>
              );
            })}
        </div>
        {stats.recentActivity.length > 5 && (
          <div className="border-t border-border px-5 py-3 bg-background/50 text-right">
            <button
              type="button"
              onClick={() => setShowAllActivity((prev) => !prev)}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              {showAllActivity ? "Show less" : `Show more (${stats.recentActivity.length - 5})`}
            </button>
          </div>
        )}
      </motion.div>

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Summarise Notes", icon: FileText,   color: "text-violet-400", bg: "bg-violet-500/10", href: "/summary" },
            { label: "Flashcards",      icon: Layers,     color: "text-emerald-400",bg: "bg-emerald-500/10",href: "/flashcards" },
            { label: "Take Quiz",       icon: HelpCircle, color: "text-blue-400",   bg: "bg-blue-500/10",   href: "/quiz" },
            { label: "Study Planner",   icon: Target,     color: "text-amber-400",  bg: "bg-amber-500/10",  href: "/planner" },
          ].map((a) => (
            <motion.a
              key={a.label}
              href={a.href}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl
                         border border-border bg-card hover:border-violet-500/30
                         hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.bg}`}>
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <span className="text-xs font-medium text-foreground text-center">{a.label}</span>
            </motion.a>
          ))}
        </div>
      </div>

    </div>
  );
}