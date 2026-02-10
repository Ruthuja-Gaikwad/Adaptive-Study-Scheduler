import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { GraduationCap, Lock, Mail, User, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const gradeOptions = Array.from({ length: 10 }, (_, index) => `Class ${index + 1}`);

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const forceAuth = location.state?.forceAuth === true;
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    grade: gradeOptions[0],
  });
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const isLogin = mode === "login";

  useEffect(() => {
    const modeFromQuery = new URLSearchParams(location.search).get("mode");
    const modeFromPath = location.pathname === "/signup" ? "signup" : location.pathname === "/login" ? "login" : null;
    const nextMode = modeFromQuery === "signup" || modeFromQuery === "login" ? modeFromQuery : modeFromPath;

    if (nextMode && nextMode !== mode) {
      setMode(nextMode);
      setStatus({ type: "idle", message: "" });
    }
  }, [location.pathname, location.search, mode]);

  useEffect(() => {
    let isMounted = true;

    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (data?.session && !forceAuth) {
        navigate("/dashboard", { replace: true });
      }
    };

    ensureSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && !forceAuth) {
          navigate("/dashboard", { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [forceAuth, navigate]);

  const heading = useMemo(() => {
    return isLogin ? "Welcome back, Scholar!" : "Start Your Learning Journey";
  }, [isLogin]);

  const updateField = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const validateForm = () => {
    const nextErrors = { fullName: "", email: "", password: "" };
    if (!formState.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.email)) nextErrors.email = "Enter a valid email.";
    
    if (!formState.password.trim()) nextErrors.password = "Password is required.";
    else if (formState.password.length < 6) nextErrors.password = "Min 6 characters required.";

    if (!isLogin && !formState.fullName.trim()) nextErrors.fullName = "Full name is required.";

    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((v) => v === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setStatus({ type: "loading", message: "" });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) throw error;
      } else {
        // Convert "Class 5" -> 5 for the Backend ML/DB
        const numericGrade = parseInt(formState.grade.replace("Class ", ""));
        
        const { data, error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              full_name: formState.fullName,
              grade: numericGrade,
            },
          },
        });

        if (error) throw error;

        if (!data?.session) {
          setStatus({ type: "success", message: "Check your email for a confirmation link!" });
          return;
        }
      }

      navigate("/dashboard");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-12 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Toggle Switch */}
        <div className="flex w-full items-center rounded-full bg-[#1E293B]/80 p-1 shadow-lg">
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${isLogin ? "bg-indigo-600 text-white" : "text-slate-300"}`}
            onClick={() => setMode("login")}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${!isLogin ? "bg-indigo-600 text-white" : "text-slate-300"}`}
            onClick={() => setMode("signup")}
          >
            New Student
          </button>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl bg-[#1E293B] p-8 shadow-2xl border border-slate-800">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">{heading}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isLogin ? "Step back into your study flow." : "Create your student profile in seconds."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
                  <User className="h-4 w-4 text-indigo-400" />
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={updateField("fullName")}
                    placeholder="Enter your name"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
                <Mail className="h-4 w-4 text-indigo-400" />
                <input
                  type="email"
                  value={formState.email}
                  onChange={updateField("email")}
                  placeholder="scholar@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
                <Lock className="h-4 w-4 text-indigo-400" />
                <input
                  type="password"
                  value={formState.password}
                  onChange={updateField("password")}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Class Level</label>
                <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 focus-within:border-indigo-500 transition-colors">
                  <GraduationCap className="h-4 w-4 text-indigo-400" />
                  <select
                    value={formState.grade}
                    onChange={updateField("grade")}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g} className="bg-slate-900">{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {status.message && (
              <div className={`rounded-xl px-4 py-2 text-xs border ${status.type === 'error' ? 'bg-rose-500/10 border-rose-500/50 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.type === "loading"
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Start Learning"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}