import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContent } from "../context/ContentContext";
import { Button } from "../components/ui/button";

export default function Summary() {
  const { content, isLoading } = useContent();
  const [copied, setCopied] = useState(false);

  const summary = content?.summary;

  const handleCopy = () => {
    if (summary?.content) {
      navigator.clipboard.writeText(summary.content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Summary</h2>
          <p className="text-muted-foreground mt-1">Generating summary...</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Summary</h2>
          <p className="text-muted-foreground mt-1">No summary available</p>
          <p className="text-sm text-muted-foreground mt-2">Upload a PDF to generate a summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Summary</h2>
        <p className="text-muted-foreground mt-1">{summary.title}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Generated Summary</h3>
              <p className="text-sm text-muted-foreground">
                Created from {content.filename}
              </p>
            </div>
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-foreground" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3 text-foreground" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-foreground leading-7" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 ml-4" {...props} />,
              li: ({node, ...props}) => <li className="text-foreground" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20" {...props} />
              ),
              code: ({node, inline, ...props}: any) => 
                inline ? (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props} />
                ) : (
                  <code className="block bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono text-foreground" {...props} />
                ),
              pre: ({node, ...props}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />,
              table: ({node, ...props}) => <table className="w-full border-collapse my-4 border border-border" {...props} />,
              thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
              tbody: ({node, ...props}) => <tbody {...props} />,
              tr: ({node, ...props}) => <tr className="border-b border-border" {...props} />,
              th: ({node, ...props}) => <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />,
              td: ({node, ...props}) => <td className="border border-border px-4 py-2" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
              em: ({node, ...props}) => <em className="italic text-foreground" {...props} />,
            }}
          >
            {summary.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}
