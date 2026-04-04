import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Layers, HelpCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  // ─────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  if (!stats) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  // ─────────────────────────────────────────
  // CARD COMPONENT
  // ─────────────────────────────────────────
  const Card = ({ title, value, subtitle, icon }: any) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 rounded-2xl border border-border bg-card flex justify-between items-center"
    >
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold text-foreground">{value}</h2>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-600/20">
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card
          title="PDFs Uploaded"
          value={stats.pdfsUploaded}
          subtitle="+ this week"
          icon={<FileText className="h-5 w-5 text-violet-400" />}
        />

        <Card
          title="Flashcards"
          value={stats.flashcards}
          subtitle="+ today"
          icon={<Layers className="h-5 w-5 text-emerald-400" />}
        />

        <Card
          title="Quizzes Taken"
          value={stats.quizzesTaken}
          subtitle={`${stats.avgScore}% avg score`}
          icon={<HelpCircle className="h-5 w-5 text-blue-400" />}
        />

        <Card
          title="Study Hours"
          value={stats.studyHours}
          subtitle="Total time"
          icon={<Clock className="h-5 w-5 text-amber-400" />}
        />

      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Summarize Notes",
            "Flashcards",
            "Take Quiz",
            "Plan Study",
          ].map((item) => (
            <div
              key={item}
              className="p-6 rounded-2xl border border-border bg-card text-center cursor-pointer hover:bg-secondary/50 transition"
            >
              <p className="text-sm font-medium text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {stats.recentActivity.length === 0 ? (
            <p className="p-5 text-muted-foreground text-sm">
              No activity yet
            </p>
          ) : (
            stats.recentActivity.map((item: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center px-5 py-4 text-sm"
              >
                <span className="text-foreground">{item.text}</span>
                <span className="text-muted-foreground text-xs">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}