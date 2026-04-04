import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Upload, FileText, Layers, HelpCircle,
  CalendarDays, Menu, X, Sparkles, LogOut
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  
  { label: "Summary", icon: FileText, path: "/summary" },
  { label: "Flashcards", icon: Layers, path: "/flashcards" },
  { label: "Quiz", icon: HelpCircle, path: "/quiz" },
  { label: "Study Planner", icon: CalendarDays, path: "/planner" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

const handleLogout = () => {
  console.log("Before:", localStorage.getItem("token"));

  localStorage.removeItem("token");

  console.log("After:", localStorage.getItem("token"));

  navigate("/");
};

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 left-0 z-30">
        <SidebarContent currentPath={location.pathname} />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-secondary">
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
              <SidebarContent currentPath={location.pathname} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || "StudyGenie AI"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
  onClick={handleLogout}
  className="p-2 rounded-lg hover:bg-secondary transition-colors"
  title="Log out"
>
  <LogOut className="h-5 w-5 text-muted-foreground"/>
</button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">StudyGenie</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-xl gradient-hero border border-border">
        <p className="text-sm font-medium text-foreground">Upgrade to Pro</p>
        <p className="text-xs text-muted-foreground mt-1">Unlock unlimited AI features</p>
        <button className="mt-3 w-full py-2 text-xs font-semibold rounded-lg gradient-primary text-primary-foreground">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
