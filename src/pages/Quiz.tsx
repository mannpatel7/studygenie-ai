import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

const questions = [
  {
    question: "What is the basic unit of life?",
    options: ["Atom", "Cell", "Molecule", "Organ"],
    correct: 1,
  },
  {
    question: "Which organelle is responsible for energy production?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
    correct: 2,
  },
  {
    question: "What type of bond holds water molecules together?",
    options: ["Ionic", "Covalent", "Hydrogen", "Metallic"],
    correct: 2,
  },
  {
    question: "DNA stands for?",
    options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nucleotide", "Dynamic Nucleic Acid"],
    correct: 0,
  },
  {
    question: "What is the process of cell division called?",
    options: ["Osmosis", "Mitosis", "Photosynthesis", "Diffusion"],
    correct: 1,
  },
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  const q = questions[current];
  const isAnswered = selected !== null;
  const isCorrect = selected === q?.correct;

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    setSelected(i);
  };

  const handleNext = () => {
    setAnswers([...answers, selected]);
    setSelected(null);
    if (current + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const score = answers.filter((a, i) => a === questions[i].correct).length;

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="h-20 w-20 mx-auto rounded-full gradient-primary flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">{pct}%</h2>
          <p className="text-muted-foreground mt-1">You scored {score} out of {questions.length}</p>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quiz</h2>
        <p className="text-muted-foreground mt-1">Test your knowledge</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{current + 1}/{questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <p className="text-lg font-semibold text-foreground">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let styles = "border-border bg-card hover:border-primary/50";
              if (isAnswered) {
                if (i === q.correct) styles = "border-success bg-success/10";
                else if (i === selected) styles = "border-destructive bg-destructive/10";
              } else if (i === selected) {
                styles = "border-primary bg-accent";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium text-foreground transition-colors flex items-center justify-between ${styles}`}
                >
                  <span>{opt}</span>
                  {isAnswered && i === q.correct && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                  {isAnswered && i === selected && i !== q.correct && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handleNext}
        disabled={!isAnswered}
        className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {current + 1 >= questions.length ? "See Results" : "Next Question"}
      </button>
    </div>
  );
}
