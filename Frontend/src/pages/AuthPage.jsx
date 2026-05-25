import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Sparkles, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { authAPI } from "../apis";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear errors instantly on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Frontend validation safety matching your backend constraints
    if (!isLogin && formData.username.trim().length < 4) {
      setError("Username must be at least 4 characters long.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      let data;

      if (isLogin) {
        data = await authAPI.login({
          phone: formData.phone.trim(),
          password: formData.password,
        });
      } else {
        data = await authAPI.register({
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        });
      }
      if (data?.success) {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/feed");
      } else {
        throw new Error("Authentication failed. Invalid server response.");
      }

    } catch (err) {
      setError(err?.message || "Connection refused. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-card border border-border rounded-[2rem] p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Logo/Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-light tracking-tight sm:text-3xl">
            {isLogin ? "Welcome back to" : "Create account on"}{" "}
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Moodiary</span>
          </h2>
          <p className="text-xs text-muted-foreground font-light mt-1.5 max-w-[280px]">
            {isLogin
              ? "Log in to synchronize your emotional milestones."
              : "Start documenting your patterns and connect with close friends."}
          </p>
        </div>

        {/* Global Error Banner Panel */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 text-center font-light overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Interaction Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Dynamic Sign-Up Mode Field: Only renders if toggled */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="yugank_tripathi"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-muted/40 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">Phone Number</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                required
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-muted/40 border border-border rounded-xl py-3 pl-10 pr-4 text-sm font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-muted/40 border border-border rounded-xl py-3 pl-10 pr-10 text-sm font-light text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 rounded-md text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl text-sm mt-2 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 group hover:opacity-95 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Register Account"}{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Dynamic Mode Switcher Footer Links */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-xs font-light text-muted-foreground">
            {isLogin ? "New to our ecosystem?" : "Already possess an active profile?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-primary font-medium hover:underline focus:outline-none ml-0.5"
            >
              {isLogin ? "Create an account" : "Log in here"}
            </button>
          </p>
        </div>

      </motion.div>
    </div>
  );
}