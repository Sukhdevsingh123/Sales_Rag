import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, AlertCircle, Moon, Sun } from "lucide-react";
import { useStore } from "../store/store";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const store = useStore();
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await store.login(email, password);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }

    setLoading(false);
  };

  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="theme-page flex h-screen w-full items-center justify-center px-4">
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-input theme-hover absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
      >
        <ThemeIcon className="h-4 w-4" />
        {theme === "dark" ? "Light" : "Dark"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-panel theme-card-shadow w-full max-w-md rounded-2xl border border-[var(--border)] p-8 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
            <Zap className="h-6 w-6 text-white" fill="white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Sales RAG</h1>
            <p className="theme-muted text-xs">Knowledge Base Login</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div className="text-xs text-blue-700 dark:text-blue-200">
              <p className="font-semibold">Demo Credentials:</p>
              <p>Admin: admin@example.com / admin123</p>
              <p>User: user@example.com / user123</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium theme-muted">Email</label>
            <div className="relative">
              <Mail className="theme-subtle absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="theme-input w-full rounded-lg border py-3 pl-10 pr-4 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium theme-muted">Password</label>
            <div className="relative">
              <Lock className="theme-subtle absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="theme-input w-full rounded-lg border py-3 pl-10 pr-4 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="theme-subtle mt-6 text-center text-xs">Sales RAG System • Powered by AI</p>
      </motion.div>
    </div>
  );
}
