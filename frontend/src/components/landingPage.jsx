import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJson } from "../api/client";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const isLogin = mode === "login";
    const isForgot = mode === "forgot";

    if (isForgot) {
      if (!username.trim() || !email.trim() || !password) {
        setError("Username, email, and new password are required.");
        return;
      }

      setLoading(true);
      try {
        const data = await apiPostJson("/forgot-password", {
          username: username.trim(),
          email: email.trim(),
          new_password: password,
        });
        setMessage(data.message || "Password reset successful. You can sign in with your new password.");
        setMode("login");
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reset password. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    if (!isLogin && (!name.trim() || !email.trim() || !institution.trim())) {
      setError("Name, email, and institution are required for registration.");
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin
      ? { username: username.trim(), password }
      : {
          username: username.trim(),
          password,
          name: name.trim(),
          email: email.trim(),
          institution: institution.trim(),
        };

    try {
      const data = await apiPostJson(endpoint, payload);
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
          {mode === "login"
            ? "Sign in to continue to your EDI assistant."
            : mode === "forgot"
              ? "Verify your username and email, then set a new password."
              : "Create a new account to start using the chatbot."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  type="text"
                  placeholder="Enter full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  type="email"
                  placeholder="Enter email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">Institution</label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  type="text"
                  placeholder="Enter institution"
                  autoComplete="organization"
                />
              </div>
            </>
          )}

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

           {mode === "forgot" && (
            <div>
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                type="email"
                placeholder="Enter your registered email"
                autoComplete="email"
              />
            </div>
          )}

          <div>
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              {mode === "forgot" ? "New Password" : "Password"}
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              type="password"
              placeholder={mode === "forgot" ? "Enter new password" : "Enter password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>


          
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Working..." : mode === "login" ? "Sign In" : mode === "forgot" ? "Reset Password" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          {mode === "login" ? (
            <>
              <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="mb-3 block w-full font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
              Don&apos;t have an account?{' '}
              <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="font-semibold text-blue-600 hover:text-blue-700">
                Create one
              </button>
            </>
          ) : mode === "forgot" ? (
            <>
              Remembered your password?{' '}
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="font-semibold text-blue-600 hover:text-blue-700">
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
