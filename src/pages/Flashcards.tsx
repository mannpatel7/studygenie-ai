import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";
export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
const handleClear = () => {
  setCards([]);
  setFile(null);

  // ✅ clear storage
  localStorage.removeItem("flashcards");
  localStorage.removeItem("fileName");
};
  // 🚀 GENERATE FLASHCARDS
  const generateFlashcards = async () => {
    if (!file) {
      toast.error("Upload a PDF first");
      return;
    }

    try {
      setLoading(true);
      setCards([]);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "http://localhost:5000/api/pdf-flashcards",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 🔥 PARSE Q/A FORMAT
      const parsedCards = data.flashcards
        .split("\n")
        .reduce((acc, line) => {
          if (line.startsWith("Q:")) {
            acc.push({
              front: line.replace("Q:", "").trim(),
              back: "",
            });
          } else if (line.startsWith("A:") && acc.length > 0) {
            acc[acc.length - 1].back = line
              .replace("A:", "")
              .trim();
          }
          return acc;
        }, [])
        .filter((c) => c.front && c.back); // ✅ remove empty cards

      setCards(parsedCards);
      setCards(parsedCards);

// ✅ SAVE
localStorage.setItem("flashcards", JSON.stringify(parsedCards));
localStorage.setItem("fileName", file.name);
      setIndex(0);
      setFlipped(false);

      toast.success("Flashcards generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const savedCards = localStorage.getItem("flashcards");
  const savedFile = localStorage.getItem("fileName");

  if (savedCards) setCards(JSON.parse(savedCards));
  if (savedFile) setFile(savedFile); // just for display
}, []);

  // NAVIGATION
  const next = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Flashcards</h2>
        <p className="text-gray-400 mt-1">
          Upload PDF and generate flashcards
        </p>
      </div>

      {/* 📄 UPLOAD BOX */}
      <div
        className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer"
        onClick={() => document.getElementById("pdfUpload").click()}
      >
        <input
          id="pdfUpload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
  const selectedFile = e.target.files[0];
  setFile(selectedFile);

  // ✅ SAVE instantly
  localStorage.setItem("fileName", selectedFile.name);
}}
        />

        <Upload className="mx-auto mb-2 text-gray-400" />

        <p className="text-sm text-gray-400">
          {file ? file.name : "Click to upload PDF"}
        </p>
      </div>
      {file && (
  <p className="text-sm text-gray-400 text-center">
  {file?.name || localStorage.getItem("fileName") || "No file uploaded"}
</p>
)}

      {/* BUTTON */}
      <button
        onClick={generateFlashcards}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl"
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Generate Flashcards
      </button>

     {cards.length > 0 && (
  <button
    onClick={handleClear}
    className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl hover:opacity-90 transition"
  >
    <Trash2 className="h-4 w-4" />
    Clear
  </button>
)}

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400">
          Generating flashcards...
        </p>
      )}

      {/* EMPTY */}
      {!loading && cards.length === 0 && (
        <p className="text-center text-gray-500">
          No flashcards yet
        </p>
      )}

      {/* FLASHCARD */}
      {cards.length > 0 && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-700 rounded-full">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                animate={{
                  width: `${((index + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-300">
              {index + 1}/{cards.length}
            </span>
          </div>

          {/* CARD */}
          <div
            className="perspective-[1200px]"
            onClick={() => setFlipped(!flipped)}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full aspect-[4/3] cursor-pointer"
            >
              {/* FRONT */}
              <div
                className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center p-6"
                style={{ backfaceVisibility: "hidden" }}
              >
                <p className="text-lg font-semibold text-white text-center">
                  {cards[index].front}
                </p>
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center p-6"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <p className="text-md text-gray-200 text-center">
                  {cards[index].back}
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-center text-xs text-gray-500">
            Click card to flip
          </p>

          {/* CONTROLS */}
          <div className="flex justify-center gap-3">
            <button
              onClick={prev}
              disabled={index === 0}
              className="px-4 py-2 border border-gray-600 rounded text-white"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() => {
                setIndex(0);
                setFlipped(false);
              }}
              className="px-4 py-2 border border-gray-600 rounded flex items-center gap-2 text-white"
            >
              <RotateCcw size={16} /> Reset
            </button>

            <button
              onClick={next}
              disabled={index === cards.length - 1}
              className="px-4 py-2 border border-gray-600 rounded text-white"
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}