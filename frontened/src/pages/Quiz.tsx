import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { Button } from "../components/ui/button";

export default function Quiz() {
  const { content, isLoading } = useContent();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions = content?.quiz || [];
  const q = questions[current];
  const isAnswered = selected !== null;
  const correctAnswerText = q?.correctAnswer?.trim() ?? '';
  const correctIndex = q
    ? q.options.findIndex(
        (opt: string) => opt?.trim().toLowerCase() === correctAnswerText.toLowerCase()
      )
    : -1;
  const isCorrect = selected === correctIndex;
  const fallbackCorrectAnswer = correctIndex >= 0 ? q?.options[correctIndex] : q?.correctAnswer;

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

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  const score = answers.filter((a, i) => a === questions[i].options.indexOf(questions[i].correctAnswer)).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quiz</h2>
          <p className="text-muted-foreground mt-1">Generating quiz...</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quiz</h2>
          <p className="text-muted-foreground mt-1">No quiz available</p>
          <p className="text-sm text-muted-foreground mt-2">Upload a PDF to generate a quiz</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">Here's how you performed</p>

          <div className="bg-card rounded-2xl border p-8 mb-6">
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-muted-foreground">
              You got {score} out of {questions.length} questions correct
            </p>
          </div>

          <Button onClick={handleRestart} size="lg" className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Take Quiz Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Quiz</h2>
        <p className="text-muted-foreground mt-1">Test your knowledge</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {current + 1}/{questions.length}
        </span>
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
            {q.options.map((opt: string, i: number) => {
              let styles = "border-border bg-card hover:border-primary/50";
              if (isAnswered) {
                if (i === correctIndex) styles = "border-success bg-success/10";
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
                  {isAnswered && i === correctIndex && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                  {isAnswered && i === selected && i !== correctIndex && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>
          {isAnswered && correctIndex === -1 && fallbackCorrectAnswer && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground">
              Correct answer: <strong>{fallbackCorrectAnswer}</strong>
            </div>
          )}
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
