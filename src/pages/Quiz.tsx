import { useState, useEffect, useRef } from "react";
import { ChevronRight, FileText, Clock, AlertCircle, Zap, X, RotateCcw, Upload } from "lucide-react";

const LABELS = ["A", "B", "C", "D"];
const TIME_PER_QUESTION = 20;

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  .qz {
    font-family: 'Plus Jakarta Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Light ── */
  .qz {
    --bg:           #f5f6fa;
    --surface:      #ffffff;
    --card:         #ffffff;
    --hover:        #f0f1f8;
    --border:       rgba(0,0,0,0.08);
    --border-md:    rgba(0,0,0,0.13);
    --text:         #111827;
    --text-2:       #6b7280;
    --text-3:       #9ca3af;
    --accent:       #6d5ae0;
    --accent-soft:  rgba(109,90,224,0.10);
    --accent-glow:  rgba(109,90,224,0.22);
    --accent-text:  #6d5ae0;
    --green:        #16a34a;
    --green-soft:   rgba(22,163,74,0.10);
    --green-border: rgba(22,163,74,0.35);
    --red:          #dc2626;
    --red-soft:     rgba(220,38,38,0.09);
    --red-border:   rgba(220,38,38,0.35);
    --amber:        #d97706;
    --amber-soft:   rgba(217,119,6,0.10);
    --amber-border: rgba(217,119,6,0.35);
  }

  /* ── Dark — triggered by .dark on <html> ── */
  .dark .qz {
    --bg:           #0d0f18;
    --surface:      #13151f;
    --card:         #181a27;
    --hover:        #1f2132;
    --border:       rgba(255,255,255,0.07);
    --border-md:    rgba(255,255,255,0.12);
    --text:         #e8eaf6;
    --text-2:       #8b8fa8;
    --text-3:       #4b4f68;
    --accent:       #8b78f5;
    --accent-soft:  rgba(139,120,245,0.14);
    --accent-glow:  rgba(139,120,245,0.28);
    --accent-text:  #b3a6ff;
    --green:        #34d399;
    --green-soft:   rgba(52,211,153,0.12);
    --green-border: rgba(52,211,153,0.30);
    --red:          #f87171;
    --red-soft:     rgba(248,113,113,0.12);
    --red-border:   rgba(248,113,113,0.30);
    --amber:        #fbbf24;
    --amber-soft:   rgba(251,191,36,0.12);
    --amber-border: rgba(251,191,36,0.30);
  }

  .qz *, .qz *::before, .qz *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .qz-wrap { max-width: 560px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }

  /* ══ UPLOAD ══════════════════════════════════════════════════════════════ */
  .u-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 2rem;
    box-shadow: 0 2px 24px rgba(0,0,0,0.06);
  }
  .u-heading {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: var(--text);
    margin-bottom: 4px;
  }
  .u-sub {
    font-size: 13.5px; color: var(--text-2);
    margin-bottom: 1.25rem; line-height: 1.55;
  }
  .u-timer-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent-soft);
    border: 1px solid rgba(109,90,224,0.2);
    color: var(--accent-text);
    font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 99px;
    margin-bottom: 1.25rem; letter-spacing: .02em;
  }
  .dark .qz .u-timer-badge { border-color: rgba(139,120,245,0.25); }

  .u-drop {
    border: 1.5px dashed var(--border-md);
    border-radius: 16px;
    padding: 2.5rem 1.5rem;
    cursor: pointer;
    transition: border-color .18s, background .18s;
    margin-bottom: 1rem; text-align: center;
  }
  .u-drop:hover, .u-drop.over {
    background: var(--accent-soft);
    border-color: var(--accent);
  }
  .u-drop-icon {
    width: 54px; height: 54px;
    background: var(--accent-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; color: var(--accent);
  }
  .u-drop-title { font-size: 14.5px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .u-drop-sub   { font-size: 12.5px; color: var(--text-2); }
  .u-drop-link  { color: var(--accent-text); }

  .u-pill {
    display: flex; align-items: center; gap: 10px;
    background: var(--hover);
    border: 1px solid var(--border-md);
    border-radius: 12px; padding: 10px 13px;
    margin-bottom: 1rem;
  }
  .u-pill-icon {
    width: 34px; height: 34px;
    background: var(--accent-soft); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent); flex-shrink: 0;
  }
  .u-pill-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .u-pill-size { font-size: 12px; color: var(--text-2); margin-top: 1px; }
  .u-pill-rm {
    margin-left: auto; width: 28px; height: 28px;
    border: 1px solid var(--border-md); border-radius: 7px;
    background: transparent; cursor: pointer; color: var(--text-2);
    display: flex; align-items: center; justify-content: center;
    transition: all .14s; flex-shrink: 0;
  }
  .u-pill-rm:hover { background: var(--red-soft); color: var(--red); border-color: var(--red-border); }

  .gen-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #6d5ae0, #a78bfa);
    border: none; border-radius: 12px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 14.5px; font-weight: 700;
    letter-spacing: .03em; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity .15s, transform .12s, box-shadow .15s;
    box-shadow: 0 4px 20px var(--accent-glow);
  }
  .gen-btn:hover:not(:disabled) { opacity: .91; transform: translateY(-1px); box-shadow: 0 8px 28px var(--accent-glow); }
  .gen-btn:active:not(:disabled) { transform: translateY(0); }
  .gen-btn:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }

  .err-msg {
    margin-top: 10px; padding: 9px 13px;
    background: var(--red-soft); border: 1px solid var(--red-border);
    border-radius: 9px; font-size: 13px; color: var(--red);
  }

  /* ══ QUIZ ════════════════════════════════════════════════════════════════ */
  .q-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; }
  .q-count { font-size: 12.5px; font-weight: 600; color: var(--text-2); white-space: nowrap; }
  .q-ptrack { flex: 1; height: 5px; background: var(--hover); border-radius: 99px; overflow: hidden; }
  .q-pfill {
    height: 100%;
    background: linear-gradient(90deg, #6d5ae0, #a78bfa);
    border-radius: 99px;
    transition: width .38s cubic-bezier(.4,0,.2,1);
  }
  .q-timer {
    display: flex; align-items: center; gap: 5px;
    background: var(--hover); border: 1px solid var(--border-md);
    border-radius: 99px; padding: 5px 12px;
    font-size: 12.5px; font-weight: 600; color: var(--text-2);
    transition: all .2s; white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .q-timer.warn { color: var(--amber); border-color: var(--amber-border); background: var(--amber-soft); }
  .q-timer.urg  { color: var(--red); border-color: var(--red-border); background: var(--red-soft); animation: urg .55s ease-in-out infinite alternate; }
  @keyframes urg { to { box-shadow: 0 0 12px var(--red-soft); } }

  .q-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 18px; padding: 1.5rem; margin-bottom: 1rem;
  }
  .q-badge {
    display: inline-block;
    background: var(--accent-soft); color: var(--accent-text);
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 6px; letter-spacing: .07em; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .q-text { font-size: 15.5px; line-height: 1.65; font-weight: 500; color: var(--text); }

  .opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 1rem; }
  .opt {
    display: flex; align-items: center; gap: 12px;
    background: var(--card); border: 1px solid var(--border-md);
    border-radius: 13px; padding: 12px 14px;
    cursor: pointer; text-align: left; width: 100%;
    transition: border-color .14s, background .14s, transform .12s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: opt-in .18s ease both;
  }
  .opt:nth-child(1) { animation-delay: .02s }
  .opt:nth-child(2) { animation-delay: .06s }
  .opt:nth-child(3) { animation-delay: .10s }
  .opt:nth-child(4) { animation-delay: .14s }
  @keyframes opt-in { from { opacity:0; transform: translateX(-8px) } to { opacity:1; transform:none } }

  .opt:hover:not(:disabled) { background: var(--hover); border-color: var(--accent); transform: translateX(3px); }
  .opt:disabled { cursor: default; }

  .opt-lbl {
    width: 34px; height: 34px; flex-shrink: 0;
    border-radius: 9px; background: var(--hover); border: 1px solid var(--border-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 12.5px; font-weight: 700; color: var(--text-2);
    transition: all .14s;
  }
  .opt-txt { font-size: 13.5px; font-weight: 500; color: var(--text); line-height: 1.45; }

  .opt.correct { background: var(--green-soft); border-color: var(--green-border); }
  .opt.correct .opt-lbl { background: var(--green); color: #fff; border-color: transparent; }
  .opt.correct .opt-txt { color: var(--green); }

  .opt.wrong { background: var(--red-soft); border-color: var(--red-border); }
  .opt.wrong .opt-lbl { background: var(--red); color: #fff; border-color: transparent; }
  .opt.wrong .opt-txt { color: var(--red); }

  .opt.dim { opacity: .28; }

  .timeout-alert {
    display: flex; align-items: center; gap: 8px;
    background: var(--amber-soft); border: 1px solid var(--amber-border);
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; font-weight: 500; color: var(--amber);
    margin-bottom: 1rem;
  }

  .next-btn {
    width: 100%; padding: 13px;
    background: var(--card); border: 1px solid var(--border-md);
    border-radius: 12px; color: var(--text);
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: .02em; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: all .15s;
  }
  .next-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #6d5ae0, #a78bfa);
    border-color: transparent; color: #fff;
    box-shadow: 0 4px 18px var(--accent-glow);
    transform: translateY(-1px);
  }
  .next-btn:active:not(:disabled) { transform: translateY(0); }
  .next-btn:disabled { opacity: .3; cursor: not-allowed; }

  /* ══ RESULT ══════════════════════════════════════════════════════════════ */
  .r-hero {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 22px; padding: 2.5rem 2rem;
    text-align: center; margin-bottom: 1rem;
  }
  .r-ring {
    width: 112px; height: 112px; border-radius: 50%;
    border: 2.5px solid var(--accent); background: var(--accent-soft);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem;
    box-shadow: 0 0 32px var(--accent-glow);
  }
  .r-pct {
    font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800;
    color: var(--accent-text); line-height: 1;
  }
  .r-lbl { font-size: 11px; color: var(--text-2); margin-top: 3px; letter-spacing: .05em; text-transform: uppercase; }
  .r-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 5px; }
  .r-sub { font-size: 14px; color: var(--text-2); }

  .r-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 1rem; }
  .r-stat {
    background: var(--hover); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px 12px; text-align: center;
  }
  .r-stat-n { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 5px; }
  .r-stat-l { font-size: 12px; color: var(--text-2); font-weight: 500; }
  .r-stat.ok  .r-stat-n { color: var(--green); }
  .r-stat.bad .r-stat-n { color: var(--red); }
  .r-stat.tot .r-stat-n { color: var(--amber); }

  .retry-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #6d5ae0, #a78bfa);
    border: none; border-radius: 12px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 14.5px; font-weight: 700;
    letter-spacing: .03em; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity .15s, transform .12s, box-shadow .15s;
    box-shadow: 0 4px 20px var(--accent-glow);
    margin-bottom: 1.25rem;
  }
  .retry-btn:hover { opacity: .91; transform: translateY(-1px); box-shadow: 0 8px 28px var(--accent-glow); }
  .retry-btn:active { transform: translateY(0); }

  .rv-heading {
    font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    color: var(--text-3); margin-bottom: .75rem; padding: 0 2px;
  }
  .rv-list { display: flex; flex-direction: column; gap: 8px; }
  .rv-item {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 13px; padding: 13px 15px;
  }
  .rv-q { font-size: 12.5px; color: var(--text-2); margin-bottom: 7px; line-height: 1.5; font-weight: 500; }
  .rv-a { font-size: 13px; font-weight: 600; }
  .rv-a.ok  { color: var(--green); }
  .rv-a.bad { color: var(--red); }
  .rv-a.to  { color: var(--amber); }
  .rv-correct { font-size: 12px; color: var(--text-2); margin-top: 5px; font-weight: 500; }

  .spin {
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%;
    animation: _sp .65s linear infinite;
  }
  @keyframes _sp { to { transform: rotate(360deg) } }
`;

export default function Quiz() {
  const [phase, setPhase]       = useState<"upload" | "quiz" | "result">("upload");
  const [file, setFile]         = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [answers, setAnswers]   = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startTimer = () => {
    clearTimer();
    setTimeLeft(TIME_PER_QUESTION);
    setTimedOut(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearTimer(); setTimedOut(true); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phase === "quiz") startTimer();
    return clearTimer;
  }, [current, phase]);

  const handleFile = (f: File | null) => {
    if (!f || f.type !== "application/pdf") { setError("Only PDF files are supported."); return; }
    setFile(f); setError(null);
  };

  const generateQuiz = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("http://localhost:5000/api/pdf-quiz", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);


      setQuestions(data.quiz);
      setCurrent(0); setAnswers([]); setSelected(null);
      setPhase("quiz");
    } catch (e: any) {
      setError(e.message || "Failed to generate quiz. Is your server running?");
    } finally {
      setLoading(false);
    }
  };

  const revealed = selected !== null || timedOut;

  const handleSelect = (i: number) => {
    if (revealed) return;
    clearTimer(); setSelected(i);
  };

  const handleNext = () => {
    setAnswers(prev => [...prev, timedOut ? null : selected]);
    setSelected(null); setTimedOut(false);
    if (current + 1 >= questions.length) { clearTimer(); setPhase("result"); }
    else setCurrent(c => c + 1);
  };

  const reset = () => {
    clearTimer();
    setPhase("upload"); setFile(null); setQuestions([]);
    setCurrent(0); setSelected(null); setTimedOut(false);
    setAnswers([]); setTimeLeft(TIME_PER_QUESTION); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const score  = answers.filter((a, i) => a === questions[i]?.correct).length;
  const missed = answers.filter(a => a === null).length;
  const wrong  = answers.length - score - missed;
  const pct    = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const timerCls = `q-timer${timeLeft <= 5 ? " urg" : timeLeft <= 10 ? " warn" : ""}`;

  return (
    <div className="qz">
      <style>{css}</style>
      <div className="qz-wrap">

        {/* ══ UPLOAD ══ */}
        {phase === "upload" && (
          <div className="u-card">
            <h2 className="u-heading">Generate Quiz</h2>
            <p className="u-sub">Upload a PDF and StudyGenie builds a timed quiz from it</p>

            <div className="u-timer-badge">
              <Clock size={11} />
              {TIME_PER_QUESTION}s per question · auto-advance on timeout
            </div>

            <div
              className={`u-drop${dragOver ? " over" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
            >
              <div className="u-drop-icon"><Upload size={24} /></div>
              <div className="u-drop-title">
                Drop your PDF here, or <span className="u-drop-link">browse</span>
              </div>
              <div className="u-drop-sub">PDF only · up to 20 MB</div>
              <input ref={fileRef} type="file" accept="application/pdf" style={{ display:"none" }}
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </div>

            {file && (
              <div className="u-pill">
                <div className="u-pill-icon"><FileText size={16} /></div>
                <div>
                  <div className="u-pill-name">{file.name}</div>
                  <div className="u-pill-size">{(file.size / 1048576).toFixed(2)} MB · PDF</div>
                </div>
                <button className="u-pill-rm"
                  onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                  <X size={12} />
                </button>
              </div>
            )}

            <button className="gen-btn" onClick={generateQuiz} disabled={!file || loading}>
              {loading ? <><span className="spin" /> Generating…</> : <><Zap size={15} /> Generate Quiz</>}
            </button>

            {error && <div className="err-msg">{error}</div>}
          </div>
        )}

        {/* ══ QUIZ ══ */}
        {phase === "quiz" && questions.length > 0 && (() => {
          const q = questions[current];
          return (
            <>
              <div className="q-header">
                <span className="q-count">{current + 1} / {questions.length}</span>
                <div className="q-ptrack">
                  <div className="q-pfill" style={{ width: `${(current / questions.length) * 100}%` }} />
                </div>
                <div className={timerCls}>
                  <Clock size={11} /><span>{timeLeft}s</span>
                </div>
              </div>

              <div className="q-card">
                <div className="q-badge">Question {current + 1}</div>
                <div className="q-text">{q.question}</div>
              </div>

              <div className="opts">
                {q.options.map((opt, i) => {
                  let cls = "opt";
                  if (revealed) {
                    if (i === q.correct) cls += " correct";
                    else if (i === selected && i !== q.correct) cls += " wrong";
                    else cls += " dim";
                  }
                  return (
                    <button key={i} className={cls} disabled={revealed} onClick={() => handleSelect(i)}>
                      <span className="opt-lbl">{LABELS[i]}</span>
                      <span className="opt-txt">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {timedOut && (
                <div className="timeout-alert">
                  <AlertCircle size={14} />
                  Time's up — correct answer shown above.
                </div>
              )}

              <button className="next-btn" onClick={handleNext} disabled={!revealed}>
                {current + 1 >= questions.length ? "See results" : "Next question"}
                <ChevronRight size={15} />
              </button>
            </>
          );
        })()}

        {/* ══ RESULT ══ */}
        {phase === "result" && (
          <>
            <div className="r-hero">
              <div className="r-ring">
                <span className="r-pct">{pct}%</span>
                <span className="r-lbl">score</span>
              </div>
              <div className="r-title">
                {pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort!" : "Keep practising!"}
              </div>
              <div className="r-sub">{score} of {questions.length} correct</div>
            </div>

            <div className="r-stats">
              <div className="r-stat ok">
                <div className="r-stat-n">{score}</div>
                <div className="r-stat-l">Correct</div>
              </div>
              <div className="r-stat bad">
                <div className="r-stat-n">{wrong}</div>
                <div className="r-stat-l">Wrong</div>
              </div>
              <div className="r-stat tot">
                <div className="r-stat-n">{missed}</div>
                <div className="r-stat-l">Timed out</div>
              </div>
            </div>

            <button className="retry-btn" onClick={reset}>
              <RotateCcw size={15} /> Try again
            </button>

            <div className="rv-heading">Question breakdown</div>
            <div className="rv-list">
              {questions.map((q, i) => {
                const a    = answers[i];
                const ok   = a === q.correct;
                const tout = a === null;
                return (
                  <div key={i} className="rv-item">
                    <div className="rv-q">{i + 1}. {q.question}</div>
                    <div className={`rv-a ${ok ? "ok" : tout ? "to" : "bad"}`}>
                      {tout ? "⏱ Timed out"
                        : ok ? `✓  ${LABELS[a!]}. ${q.options[a!]}`
                             : `✕  ${LABELS[a!]}. ${q.options[a!]}`}
                    </div>
                    {!ok && !tout && (
                      <div className="rv-correct">
                        Correct: {LABELS[q.correct!]}. {q.options[q.correct!]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}