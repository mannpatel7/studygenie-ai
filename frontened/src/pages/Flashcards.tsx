import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Loader2, Trash2 } from "lucide-react";
import { useContent } from "../context/ContentContext";

const formatFlashcardText = (text: string) => {
  if (!text) return text;

  let formatted = text.trim();
  formatted = formatted.replace(/([a-z0-9])\(/gi, "$1 (");
  formatted = formatted.replace(/\)([a-zA-Z0-9])/g, ") $1");
  formatted = formatted.replace(/,\s*/g, ", ");
  formatted = formatted.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  formatted = formatted.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  formatted = formatted.replace(/\s{2,}/g, " ");

  const commonFixes: Array<[RegExp, string]> = [
    [/searchandmatch/gi, "search and match"],
    [/findall/gi, "find all"],
    [/replacepartofastring/gi, "replace part of a string"],
    [/breakstringintoasubstrings/gi, "break string into a substrings"],
    [/aregularexpression/gi, "a regular expression"],
    [/isasequenceofcharacters/gi, "is a sequence of characters"],
  ];

  commonFixes.forEach(([pattern, replacement]) => {
    formatted = formatted.replace(pattern, replacement);
  });

  return formatted.trim();
};

export default function Flashcards() {
  const { content, isLoading, clearFlashcards } = useContent();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = content?.flashcards || [];

  const next = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const reset = () => {
    setFlipped(false);
    setIndex(0);
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Flashcards</h2>
          <p className="text-muted-foreground mt-1">Generating flashcards...</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Flashcards</h2>
          <p className="text-muted-foreground mt-1">No flashcards available</p>
          <p className="text-sm text-muted-foreground mt-2">Upload a PDF to generate flashcards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Flashcards</h2>
        <p className="text-muted-foreground mt-1">Tap the card to flip it</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {index + 1}/{cards.length}
        </span>
      </div>

      <div className="perspective-[1200px]" onClick={() => setFlipped(!flipped)}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-80 cursor-pointer"
        >
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col justify-center items-center text-white shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Question</h3>
              <p className="text-lg leading-relaxed">{formatFlashcardText(cards[index].question)}</p>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 flex flex-col justify-center items-center text-white shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Answer</h3>
              <p className="text-lg leading-relaxed">{formatFlashcardText(cards[index].answer)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button
          onClick={() => clearFlashcards()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
