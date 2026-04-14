import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/SkeletonCard";

const mockSummaries = [
  {
    title: "Chapter 1: Introduction to Biology",
    points: [
      "Biology is the study of living organisms and their interactions",
      "The cell is the basic unit of life",
      "All living things share common characteristics like growth and reproduction",
      "Homeostasis is the maintenance of a stable internal environment",
    ],
  },
  {
    title: "Chapter 2: Cell Structure",
    points: [
      "Prokaryotic cells lack a nucleus, eukaryotic cells have one",
      "The cell membrane controls what enters and leaves the cell",
      "Mitochondria are the powerhouse of the cell",
      "The endoplasmic reticulum helps in protein synthesis",
    ],
  },
  {
    title: "Chapter 3: Genetics",
    points: [
      "DNA carries genetic information in all living organisms",
      "Genes are segments of DNA that code for proteins",
      "Mutations can lead to genetic variation",
      "Mendelian genetics explains inheritance patterns",
    ],
  },
];

export default function Summary() {
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState(mockSummaries);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    setSummaries([]);
    setTimeout(() => {
      setSummaries(mockSummaries);
      setLoading(false);
      toast.success("Summaries generated!");
    }, 2000);
  };

  const handleCopy = (index: number) => {
    const text = summaries[index].points.join("\n• ");
    navigator.clipboard.writeText(`• ${text}`);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">AI Summaries</h2>
          <p className="text-muted-foreground mt-1">Key points extracted from your documents</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Regenerate
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No summaries yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload a PDF to generate summaries</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {summaries.map((s, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground leading-tight">{s.title}</h3>
                <button
                  onClick={() => handleCopy(i)}
                  className="p-1.5 rounded-lg hover:bg-secondary shrink-0 ml-2"
                >
                  {copiedIndex === i ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <ul className="space-y-2">
                {s.points.map((p, j) => (
                  <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
