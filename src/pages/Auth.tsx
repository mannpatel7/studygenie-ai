import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";



export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const baseUrl = "http://localhost:5000/api/auth";

  // ✅ ADD THIS HERE
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        localStorage.setItem("token", data.token);
        navigate("/dashboard", { replace: true });
        
      } else {
        // SIGNUP
        const res = await fetch(`${baseUrl}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert("Signup successful");
        setIsLogin(true);
      }

    } catch (err: any) {
      alert(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Signup"}
        </button>
      </form>

      <br />

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create account" : "Already have account"}
      </button>
    </div>
  );
}