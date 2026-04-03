import { motion } from "framer-motion";
import { FileText, Layers, HelpCircle, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "PDFs Uploaded", value: "12", icon: FileText, change: "+3 this week" },
  { label: "Flashcards", value: "148", icon: Layers, change: "+24 today" },
  { label: "Quizzes Taken", value: "8", icon: HelpCircle, change: "85% avg score" },
  { label: "Study Hours", value: "26", icon: Clock, change: "+4.5 hrs" },
];

const quickActions = [
  { label: "Upload PDF", icon: FileText, path: "/upload", color: "gradient-primary" },
  { label: "Flashcards", icon: Layers, path: "/flashcards", color: "bg-success" },
  { label: "Take Quiz", icon: HelpCircle, path: "/quiz", color: "bg-destructive" },
  { label: "Plan Study", icon: CalendarDays, path: "/planner", color: "bg-accent" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back! 👋</h2>
        <p className="text-muted-foreground mt-1">Here's your study overview</p>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                <s.icon className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{s.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-muted-foreground">{s.change}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.path}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col items-center gap-3 hover:shadow-elevated transition-all hover:-translate-y-0.5"
            >
              <div className={`h-11 w-11 rounded-xl ${a.color} flex items-center justify-center`}>
                <a.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {[
            { text: "Generated summary for Biology Chapter 5", time: "2 hours ago" },
            { text: "Completed Quiz: Organic Chemistry", time: "5 hours ago" },
            { text: "Created 30 flashcards from Physics notes", time: "Yesterday" },
          ].map((a, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-foreground">{a.text}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
