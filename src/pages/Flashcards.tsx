import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const cards = [
  { front: "What is the powerhouse of the cell?", back: "Mitochondria — responsible for producing ATP through cellular respiration." },
  { front: "What is DNA?", back: "Deoxyribonucleic acid — a molecule that carries genetic instructions for life." },
  { front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy (glucose)." },
  { front: "What is osmosis?", back: "The movement of water molecules through a semipermeable membrane from low to high solute concentration." },
  { front: "What are enzymes?", back: "Biological catalysts that speed up chemical reactions in living organisms." },
];

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const next = () => { setFlipped(false); setIndex((i) => Math.min(i + 1, cards.length - 1)); };
  const prev = () => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Flashcards</h2>
        <p className="text-muted-foreground mt-1">Tap the card to flip it</p>
      </div>

      {/* Progress */}
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

      {/* Card */}
      <div className="perspective-[1200px]" onClick={() => setFlipped(!flipped)}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full aspect-[4/3] cursor-pointer"
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-card shadow-elevated p-6 sm:p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-medium text-primary mb-4 uppercase tracking-wider">Question</span>
            <p className="text-lg sm:text-xl font-semibold text-foreground text-center leading-relaxed">
              {cards[index].front}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-accent shadow-elevated p-6 sm:p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-xs font-medium text-accent-foreground mb-4 uppercase tracking-wider">Answer</span>
            <p className="text-base sm:text-lg text-foreground text-center leading-relaxed">
              {cards[index].back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={() => { setIndex(0); setFlipped(false); }}
          className="h-12 px-5 rounded-xl border border-border bg-card flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
        >
          <RotateCcw className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">Reset</span>
        </button>
        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </div>
  );
}
