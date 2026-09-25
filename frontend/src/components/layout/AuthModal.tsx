"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore, useUIStore } from "@/store";
import { authService } from "@/services/authService";
import { userService } from "@/services";
import { parseApiError, setAuthToken } from "@/lib/axios";
import { useScrollLock } from "@/hooks";
import api from "@/lib/axios";

// ─── Floating Label Input ─────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const floated = focused || !!value;

  return (
    <div className="floating-label-group relative">
      <input
        id={id}
        type={isPassword && showPassword ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        required={required}
        className="w-full bg-[#333] border-2 border-transparent rounded text-white text-[15px] outline-none transition-[border-color] duration-200 pr-12"
        style={{
          borderColor: focused ? "#fff" : "transparent",
          padding: "22px 16px 8px",
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200 text-text-secondary"
        style={{
          top: floated ? "6px" : "14px",
          fontSize: floated ? "11px" : "14px",
          letterSpacing: floated ? "0.05em" : "0",
          textTransform: floated ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

export function AuthModal() {
  const { authModalOpen, authMode, closeAuthModal, toggleAuthMode } = useUIStore();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    userEmail: "",
  });

  useScrollLock(authModalOpen);

  const isLogin = authMode === "login";

  const setField = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const reset = () =>
    setForm({ username: "", password: "", firstName: "", lastName: "", userEmail: "" });

  useEffect(() => {
    if (!authModalOpen) reset();
  }, [authModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let token: string;

      if (isLogin) {
        token = await authService.login({
          userName: form.username,
          password: form.password,
        });
      } else {
        token = await authService.signup({
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          userEmail: form.userEmail,
        });
      }

      const decoded = authService.decodeToken(token);

if (decoded?.sub && decoded?.userId) {
  setAuth(
    {
      userId: decoded.userId,
      username: decoded.sub,
      firstName: form.firstName || decoded.sub,
      lastName: form.lastName || "",
      userEmail: form.userEmail || "",
      userStatus: "ACTIVE",
      userRole: (decoded.ROLES?.[0]?.authority as any) || "ROLE_USER",
      userCreatedAt: new Date().toISOString(),
      userUpdatedAt: new Date().toISOString(),
    },
    token
  );
}

      toast.success(
        isLogin
          ? `Welcome back! 🎬`
          : `Account created! Welcome to Wonderlight 🎉`
      );
      closeAuthModal();
    } catch (error) {
      toast.error(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 z-modal flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeAuthModal()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-surface rounded-lg p-12 w-full max-w-md relative shadow-modal"
          >
            {/* Close */}
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
            >
              <X size={22} />
            </button>

            {/* Logo */}
            <div className="font-display text-2xl text-primary tracking-widest mb-6">
              WONDERLIGHT
            </div>

            {/* Title */}
            <h2 className="font-display text-5xl tracking-wide mb-2">
              {isLogin ? "SIGN IN" : "JOIN NOW"}
            </h2>
            <p className="text-text-secondary text-sm mb-8">
              {isLogin
                ? "Welcome back to Wonderlight"
                : "Create your free account today"}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatingInput
                id="username"
                label="Username"
                value={form.username}
                onChange={setField("username")}
              />
              <FloatingInput
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={setField("password")}
              />

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex gap-3">
                      <FloatingInput
                        id="firstName"
                        label="First Name"
                        value={form.firstName}
                        onChange={setField("firstName")}
                      />
                      <FloatingInput
                        id="lastName"
                        label="Last Name"
                        value={form.lastName}
                        onChange={setField("lastName")}
                      />
                    </div>
                    <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={form.userEmail}
                      onChange={setField("userEmail")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded text-base font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-6 text-sm text-text-secondary">
              {isLogin ? (
                <>
                  New to Wonderlight?{" "}
                  <button
                    onClick={toggleAuthMode}
                    className="text-white hover:underline font-medium"
                  >
                    Sign up now
                  </button>
                </>
              ) : (
                <>
                  Already a member?{" "}
                  <button
                    onClick={toggleAuthMode}
                    className="text-white hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
