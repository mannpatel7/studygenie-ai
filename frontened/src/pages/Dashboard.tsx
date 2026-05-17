import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Layers, HelpCircle, CalendarDays, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { billingApi } from "../api/billingApi";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";

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
  const { content, history } = useContent();
  const { user, refreshUser } = useAuth();
  const [cancelling, setCancelling] = useState(false);

  const stats = useMemo(() => {
    const flashcardsCount = history.reduce((sum, item) => sum + (item.flashcards?.length ?? 0), 0);
    const quizCount = history.reduce((sum, item) => sum + (item.quiz?.length ?? 0), 0);
    const studyHours = history.reduce((sum, item) => {
      const scheduleHours = item.studyPlan?.schedule?.reduce((dayTotal, day) => dayTotal + (Number(day.hours) || 0), 0) ?? 0;
      return sum + scheduleHours;
    }, 0);
    const pdfCount = history.length;

    return [
      {
        label: "PDFs Uploaded",
        value: `${pdfCount}`,
        icon: FileText,
        change: pdfCount > 0 ? "Upload history saved" : "Upload a PDF to begin",
      },
      {
        label: "Flashcards",
        value: `${flashcardsCount}`,
        icon: Layers,
        change: flashcardsCount > 0 ? "Flashcards generated" : "Generate flashcards",
      },
      {
        label: "Quiz Questions",
        value: `${quizCount}`,
        icon: HelpCircle,
        change: quizCount > 0 ? "Quiz content ready" : "Generate a quiz",
      },
      {
        label: "Study Hours",
        value: `${studyHours}`,
        icon: Clock,
        change: studyHours > 0 ? "Planned in your schedule" : "Create a study plan",
      },
    ];
  }, [history]);

  const recentActivity = useMemo(() => {
    if (history.length === 0) {
      return [{ text: "No activity yet", time: "Upload a PDF to start generating content" }];
    }

    const activities: Array<{ text: string; time: string }> = [];

    history.forEach((item, itemIndex) => {
      const source = item.filename ? `from ${item.filename}` : `from upload #${itemIndex + 1}`;
      const timeLabel = item.summary?.createdAt || item.studyPlan?.createdAt ? "Earlier" : "Recent";

      if (item.summary) {
        activities.push({ text: `Generated summary ${source}`, time: timeLabel });
      }

      if (item.flashcards?.length) {
        activities.push({ text: `Created ${item.flashcards.length} flashcards ${source}`, time: timeLabel });
      }

      if (item.quiz?.length) {
        activities.push({ text: `Prepared ${item.quiz.length} quiz questions ${source}`, time: timeLabel });
      }

      if (item.studyPlan?.schedule?.length) {
        activities.push({ text: `Generated study plan with ${item.studyPlan.schedule.length} days ${source}`, time: timeLabel });
      }
    });

    const visibleActivities = activities.slice(-6).reverse();
    return visibleActivities.length
      ? visibleActivities
      : [{ text: "Your content history is ready", time: "Recent" }];
  }, [history]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back! 👋</h2>
        <p className="text-muted-foreground mt-1">Here's your study overview</p>
        {user?.isPremium && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-foreground">
              <Sparkles className="h-4 w-4 text-success" />
              Premium member
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Cancel Premium
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel premium membership?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to Study Planner and AI Chat, and premium features will be disabled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Premium</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setCancelling(true);
                      try {
                        await billingApi.cancelPremium();
                        await refreshUser();
                        toast.success('Your premium membership has been canceled.');
                      } catch (error) {
                        toast.error(error as string);
                      } finally {
                        setCancelling(false);
                      }
                    }}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Canceling...' : 'Confirm Cancel'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
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
          {recentActivity.map((a, i) => (
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
