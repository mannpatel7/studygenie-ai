import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "../api/aiApi";

export default function Summary() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if summary data was passed from upload page
    if (location.state?.summary) {
      setSummary(location.state.summary);
    }
  }, [location.state]);

  const handleGenerateFromText = async () => {
    if (!location.state?.extractedText) {
      toast.error("No text available to generate summary");
      return;
    }

    setLoading(true);
    try {
      const result = await aiApi.generateSummary({
        text: location.state.extractedText,
        title: location.state.filename?.replace('.pdf', '') || 'Summary',
      });
      setSummary(result);
      toast.success("Summary regenerated!");
    } catch (error) {
      toast.error(error as string);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary?.content) {
      navigator.clipboard.writeText(summary.content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">AI Summary</h2>
          <p className="text-muted-foreground mt-1">
            {summary?.title ? `Summary of ${summary.title}` : "Intelligent summary of your document"}
          </p>
        </div>
        {location.state?.extractedText && (
          <button
            onClick={handleGenerateFromText}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Regenerate
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded"></div>
              <div className="h-4 bg-secondary rounded w-5/6"></div>
              <div className="h-4 bg-secondary rounded"></div>
              <div className="h-4 bg-secondary rounded w-4/5"></div>
            </div>
          </div>
        </div>
      ) : summary ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{summary.title || "Document Summary"}</h3>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap leading-relaxed">{summary.content}</p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No summary available</p>
          <p className="text-sm text-muted-foreground mt-1">Upload a PDF to generate a summary</p>
        </div>
      )}
    </div>
  );
}
