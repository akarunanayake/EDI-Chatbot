import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJson } from "../api/client";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    const endpoint = mode === "login" ? "/login" : "/register";

    try {
      const data = await apiPostJson(endpoint, { username: username.trim(), password });
      if (!data.success) {
        setError(data.message || "Authentication failed.");
        return;
      }

      const user = { id: data.user_id, username: data.username };
      window.localStorage.setItem("edi_user", JSON.stringify(user));
      navigate("/chat", { state: { user } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-100 text-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to GenEDIt</h1>
        <p className="text-gray-600 mb-8">
          {mode === "login" ? "Sign in to continue to your EDI assistant." : "Create a new account to start using the chatbot."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              type="text"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              type="password"
              placeholder="Enter password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => { setMode("signup"); setError(""); }} className="font-semibold text-blue-600 hover:text-blue-700">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode("login"); setError(""); }} className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
