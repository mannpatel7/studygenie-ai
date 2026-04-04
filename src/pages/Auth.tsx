import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const navigate = useNavigate();
  const baseUrl = "http://localhost:5000/api/auth";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleInitialized = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const initGoogleSignIn = () => {
    if (!(window as any).google || !googleClientId || googleInitialized.current) return;

    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleSuccess,
    });

    if (googleButtonRef.current) {
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_blue",
        size: "large",
        text: "signin_with",
      });
    }

    googleInitialized.current = true;
    setGoogleReady(true);
  };

  const promptGoogleSignIn = () => {
    if (!(window as any).google || !googleInitialized.current) return;

    try {
      (window as any).google.accounts.id.prompt();
    } catch (error) {
      console.error("Google prompt error:", error);
      toast.error("Google sign-in is not available right now.");
    }
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogleSignIn;
    document.head.appendChild(script);

    if ((window as any).google) {
      initGoogleSignIn();
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem("token", data.token);
        navigate("/dashboard", { replace: true });
      } else {
        const res = await fetch(`${baseUrl}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success("Signup successful");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      toast.success("Logged in with Google!");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "✦", label: "Smart Summaries" },
    { icon: "◈", label: "AI Quizzes" },
    { icon: "⬡", label: "Flashcards" },
    { icon: "⟡", label: "Study Plans" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sg-root {
          min-height: 100vh;
          background: #080b14;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          color: #e8e4dc;
          overflow: hidden;
          position: relative;
        }

        /* Animated background orbs */
        .sg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: orbFloat 14s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .sg-orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #4f8ef7, transparent);
          top: -120px; left: -80px;
          animation-delay: 0s;
        }
        .sg-orb-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #a78bfa, transparent);
          bottom: -60px; right: 30%;
          animation-delay: -5s;
        }
        .sg-orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, #34d399, transparent);
          top: 40%; right: 10%;
          animation-delay: -9s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.97); }
        }

        /* Grid texture */
        .sg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
          pointer-events: none;
        }

        /* Left panel */
        .sg-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          position: relative;
          z-index: 1;
        }

        .sg-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 72px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.1s;
        }
        .sg-logo-mark {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #4f8ef7, #a78bfa);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 24px rgba(79,142,247,0.4);
        }
        .sg-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          letter-spacing: 0.01em;
          color: #f0ece4;
        }
        .sg-logo-text span {
          color: #6fa3ff;
        }

        .sg-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6fa3ff;
          background: rgba(79,142,247,0.1);
          border: 1px solid rgba(79,142,247,0.2);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.2s;
          width: fit-content;
        }
        .sg-hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          background: #6fa3ff;
          border-radius: 50%;
          box-shadow: 0 0 8px #6fa3ff;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .sg-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.12;
          font-weight: 700;
          color: #f5f1ea;
          margin-bottom: 20px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.3s;
        }
        .sg-headline em {
          font-style: italic;
          color: #a78bfa;
        }

        .sg-subtext {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.7;
          color: #8a8a9a;
          max-width: 420px;
          margin-bottom: 52px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.4s;
        }

        .sg-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.5s;
        }
        .sg-feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .sg-feature-icon {
          width: 36px; height: 36px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #a78bfa;
          background: rgba(167,139,250,0.06);
          flex-shrink: 0;
        }
        .sg-feature-label {
          font-size: 14px;
          color: #9090a0;
          font-weight: 400;
        }

        /* About Section */
        .sg-about {
          margin-top: 64px;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.7s;
        }
        .sg-about-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #f0ece4;
          margin-bottom: 16px;
        }
        .sg-about-text {
          font-size: 13px;
          line-height: 1.6;
          color: #7a7a8a;
          max-width: 380px;
        }
        .sg-about-highlight {
          color: #a78bfa;
          font-weight: 500;
        }

        /* Divider */
        .sg-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        /* Right panel */
        .sg-right {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 48px;
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.015);
        }

        .sg-card {
          width: 100%;
          opacity: 0;
          animation: fadeUp 0.7s ease forwards;
          animation-delay: 0.3s;
        }

        .sg-card-header {
          margin-bottom: 36px;
        }
        .sg-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0ece4;
          margin-bottom: 8px;
        }
        .sg-card-sub {
          font-size: 14px;
          color: #5a5a6e;
          font-weight: 300;
        }

        /* Tabs */
        .sg-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 32px;
        }
        .sg-tab {
          flex: 1;
          padding: 10px;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #5a5a6e;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .sg-tab.active {
          background: linear-gradient(135deg, rgba(79,142,247,0.2), rgba(167,139,250,0.15));
          color: #c8c4f0;
          border: 1px solid rgba(79,142,247,0.25);
          box-shadow: 0 2px 12px rgba(79,142,247,0.1);
        }

        /* Form */
        .sg-form { display: flex; flex-direction: column; gap: 16px; }

        .sg-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .sg-field:nth-child(1) { animation-delay: 0.4s; }
        .sg-field:nth-child(2) { animation-delay: 0.5s; }
        .sg-field:nth-child(3) { animation-delay: 0.55s; }

        .sg-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4e4e62;
        }

        .sg-input-wrap {
          position: relative;
        }
        .sg-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          color: #e8e4dc;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .sg-input::placeholder { color: #3a3a50; }
        .sg-input:focus {
          border-color: rgba(79,142,247,0.4);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.08), inset 0 0 20px rgba(79,142,247,0.03);
          background: rgba(79,142,247,0.04);
        }

        .sg-submit {
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #4f8ef7, #7c6af5);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.04em;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(79,142,247,0.3);
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.65s;
        }
        .sg-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .sg-submit:hover::before { opacity: 1; }
        .sg-submit:hover {
          box-shadow: 0 6px 28px rgba(79,142,247,0.45);
          transform: translateY(-1px);
        }
        .sg-submit:active { transform: translateY(0); }
        .sg-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .sg-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sg-footer {
          margin-top: 24px;
          text-align: center;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.75s;
        }
        .sg-footer-text {
          font-size: 13px;
          color: #3e3e52;
        }
        .sg-footer-link {
          background: none;
          border: none;
          color: #6fa3ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .sg-footer-link:hover { color: #a78bfa; }

        .sg-divider-text {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.6s;
        }
        .sg-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .sg-divider-label {
          font-size: 11px;
          color: #3a3a50;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sg-terms {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 11px;
          color: #2e2e40;
          text-align: center;
          line-height: 1.6;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.85s;
        }
        .sg-terms a {
          color: #3e3e56;
          text-decoration: none;
        }
        .sg-terms a:hover { color: #6fa3ff; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .sg-left { display: none; }
          .sg-divider { display: none; }
          .sg-right {
            width: 100%;
            background: transparent;
            padding: 40px 24px;
          }
        }
      `}</style>

      <div className="sg-root">
        <div className="sg-grid" />
        <div className="sg-orb sg-orb-1" />
        <div className="sg-orb sg-orb-2" />
        <div className="sg-orb sg-orb-3" />

        {/* Left Brand Panel */}
        <div className="sg-left">
          <div className="sg-logo">
            <div className="sg-logo-mark">✦</div>
            <span className="sg-logo-text">Study<span>Genie</span></span>
          </div>

          <div className="sg-hero-tag">AI-Powered Learning</div>

          <h1 className="sg-headline">
            Learn <em>smarter,</em><br />
            not harder.
          </h1>

          <p className="sg-subtext">
            Upload any document, lecture, or topic — StudyGenie transforms it into summaries, quizzes, flashcards, and personalized study plans in seconds.
          </p>

          <div className="sg-features">
            {features.map((f, i) => (
              <div
                className="sg-feature-item"
                key={f.label}
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              >
                <div className="sg-feature-icon">{f.icon}</div>
                <span className="sg-feature-label">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="sg-about">
            <div className="sg-about-title">About StudyGenie</div>
            <p className="sg-about-text">
              StudyGenie is your <span className="sg-about-highlight">AI-powered study companion</span> designed to revolutionize the way you learn.
              Whether you're a student preparing for exams, a professional upskilling, or someone passionate about lifelong learning,
              our platform transforms complex information into digestible, interactive study materials.
            </p>
            <p className="sg-about-text" style={{ marginTop: '12px' }}>
              Join thousands of learners who have already discovered a smarter way to study with our
              <span className="sg-about-highlight"> intelligent content processing</span> and personalized learning experience.
            </p>
          </div>
        </div>

        <div className="sg-divider" />

        {/* Right Auth Panel */}
        <div className="sg-right">
          <div className="sg-card">
            <div className="sg-card-header">
              <div className="sg-card-title">
                {isLogin ? "Welcome back" : "Create account"}
              </div>
              <div className="sg-card-sub">
                {isLogin
                  ? "Sign in to continue your studies"
                  : "Start learning smarter today"}
              </div>
            </div>

            {/* Tabs */}
            <div className="sg-tabs">
              <button
                className={`sg-tab ${isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(true)}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`sg-tab ${!isLogin ? "active" : ""}`}
                onClick={() => setIsLogin(false)}
                type="button"
              >
                Sign Up
              </button>
            </div>

            <form className="sg-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="sg-field">
                  <label className="sg-label">Full Name</label>
                  <div className="sg-input-wrap">
                    <input
                      className="sg-input"
                      type="text"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="sg-field">
                <label className="sg-label">Email</label>
                <div className="sg-input-wrap">
                  <input
                    className="sg-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sg-field">
                <label className="sg-label">Password</label>
                <div className="sg-input-wrap">
                  <input
                    className="sg-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="sg-submit" type="submit" disabled={loading}>
                {loading && <span className="sg-spinner" />}
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In →"
                  : "Create Account →"}
              </button>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #3a3a3a' }}>
                <p style={{ fontSize: '12px', color: '#a89968', marginBottom: '12px', textAlign: 'center' }}>Or continue with Google</p>
                <div
                  ref={googleButtonRef}
                  style={{ width: '100%', minHeight: '52px', display: googleReady ? 'block' : 'none' }}
                />
                {googleClientId && !googleReady && (
                  <div style={{ width: '100%', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a89968', fontSize: '13px' }}>
                    Loading Google sign-in…
                  </div>
                )}
                {!googleClientId && (
                  <p style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '12px' }}>
                    Google Client ID is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in your project .env.
                  </p>
                )}
              </div>
            </form>

            <div className="sg-footer">
              <span className="sg-footer-text">
                {isLogin ? "New to StudyGenie?" : "Already have an account?"}
              </span>
              <button
                className="sg-footer-link"
                onClick={() => setIsLogin(!isLogin)}
                type="button"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>

            <div className="sg-terms">
              By continuing, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}