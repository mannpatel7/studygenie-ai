import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, FileText, Loader2, Upload, X, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// ─── Skeleton Card (uses your existing theme tokens) ────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-36 rounded-full bg-secondary" />
        <div className="h-7 w-7 rounded-full bg-secondary" />
      </div>
      <div className="h-px bg-border" />
      <div className="space-y-2.5 pt-1">
        {[88, 72, 80, 55, 75].map((w, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
            <div className="h-3 rounded-full bg-secondary" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ACCENT_DOTS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",  "bg-cyan-500",
];

export default function Summary() {
  const [loading, setLoading]           = useState(false);
  const [summaries, setSummaries]       = useState<{ title: string; points: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem("summaries");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load summaries", e);
      return [];
    }
  });
  const [copiedIndex, setCopiedIndex]   = useState<number | null>(null);
  const [file, setFile]                 = useState<File | null>(() => {
    try {
      const saved = localStorage.getItem("summaryFile");
      if (saved) {
        const { name, size, type } = JSON.parse(saved);
        return new File([new ArrayBuffer(0)], name, { type });
      }
    } catch (e) {
      console.error("Failed to load file", e);
    }
    return null;
  });
  const [dragOver, setDragOver]         = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Save summaries to localStorage
  useEffect(() => {
    localStorage.setItem("summaries", JSON.stringify(summaries));
  }, [summaries]);

  // Save file name/metadata to localStorage
  useEffect(() => {
    if (file) {
      localStorage.setItem(
        "summaryFile",
        JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
        })
      );
    } else {
      localStorage.removeItem("summaryFile");
    }
  }, [file]);

  const handleClear = () => {
    setFile(null);
    setSummaries([]);
    localStorage.removeItem("summaryFile");
    localStorage.removeItem("summaries");
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { toast.error("Only PDF files are supported"); return; }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleGenerate = async () => {
    if (!file) { toast.error("Please upload a PDF first"); return; }
    try {
      setLoading(true);
      setSummaries([]);
      const formData = new FormData();
      formData.append("file", file);
      const res  = await fetch("http://localhost:5000/api/pdf-summary", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const points = data.summary.split("\n").filter((p: string) => p.trim() !== "");
      setSummaries([{ title: "Generated Summary", points }]);
      toast.success("Summary generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (index: number) => {
    const text = summaries[index].points.join("\n• ");
    navigator.clipboard.writeText(`• ${text}`);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">AI Summaries</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a PDF and let StudyGenie distil it into key points
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={loading || !file}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-violet-600 hover:bg-violet-500 text-white
                       disabled:opacity-40 disabled:cursor-not-allowed
                       shadow-lg shadow-violet-600/20 transition-colors"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate Summary"}
          </motion.button>
          {(file || summaries.length > 0) && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClear}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-neutral-600 hover:bg-neutral-500 text-white
                         shadow-lg shadow-neutral-600/20 transition-colors"
            >
              Clear
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* UPLOAD ZONE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && document.getElementById("pdf-input")?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200
          flex flex-col items-center justify-center gap-3 py-10 px-6 cursor-pointer
          ${dragOver
            ? "border-violet-500 bg-violet-500/10"
            : file
              ? "border-violet-500/40 bg-violet-500/5 cursor-default"
              : "border-border hover:border-violet-500/50 bg-card hover:bg-secondary/50"
          }`}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB · PDF
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-2 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground
                         hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your PDF here, or{" "}
                <span className="text-violet-400 hover:text-violet-300 transition-colors">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Supports PDF up to 20 MB</p>
            </div>
          </>
        )}
      </motion.div>

      {/* CONTENT STATES */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </motion.div>
        )}

        {/* Empty */}
        {!loading && summaries.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">No summaries yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a PDF and click Generate Summary to begin
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {!loading && summaries.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {summaries.map((s, i) => {
              const isExpanded    = expandedCard === i;
              const visiblePoints = isExpanded ? s.points : s.points.slice(0, 5);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-border bg-card
                             shadow-sm hover:shadow-md hover:border-violet-500/30
                             transition-all duration-200 overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-violet-600/20 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
                    </div>
                    <button
                      onClick={() => handleCopy(i)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground
                                 hover:text-foreground transition-colors"
                      title="Copy summary"
                    >
                      <AnimatePresence mode="wait">
                        {copiedIndex === i
                          ? <motion.div key="check" initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                              <Check className="h-4 w-4 text-emerald-500" />
                            </motion.div>
                          : <motion.div key="copy" initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                              <Copy className="h-4 w-4" />
                            </motion.div>}
                      </AnimatePresence>
                    </button>
                  </div>

                  <div className="h-px bg-border mx-5" />

                  {/* Points list */}
                  <ul className="px-5 py-4 space-y-2.5">
                    <AnimatePresence>
                      {visiblePoints.map((p, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.04 }}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${ACCENT_DOTS[j % ACCENT_DOTS.length]}`}
                          />
                          {p.replace(/^[•\-\*]\s*/, "")}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* Expand / collapse */}
                  {s.points.length > 5 && (
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : i)}
                      className="w-full flex items-center justify-center gap-1.5
                                 py-3 text-xs font-medium text-violet-400 hover:text-violet-300
                                 border-t border-border bg-secondary/30 hover:bg-secondary/60
                                 transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.div>
                      {isExpanded ? "Show less" : `+${s.points.length - 5} more points`}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}