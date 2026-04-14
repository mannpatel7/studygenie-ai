import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileText, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") {
      setFile(f);
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleGenerate = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Content generated successfully!");
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Upload PDF</h2>
        <p className="text-muted-foreground mt-1">Upload your study material to generate AI content</p>
      </div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors cursor-pointer ${
          dragging
            ? "border-primary bg-accent"
            : "border-border bg-card hover:border-primary/50"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
            <UploadIcon className="h-8 w-8 text-accent-foreground" />
          </div>
          <div>
            <p className="text-foreground font-semibold">
              Drop your PDF here or <span className="text-primary">browse</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">Supports PDF files up to 50MB</p>
          </div>
        </div>
      </motion.div>

      {/* File preview */}
      {file && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="p-2 rounded-lg hover:bg-secondary shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!file || loading}
        className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Content
          </>
        )}
      </button>
    </div>
  );
}
