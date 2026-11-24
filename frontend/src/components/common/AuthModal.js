import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { X, Eye, EyeOff, Stethoscope, Lock, Mail, User, Phone, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AuthModal = ({ isOpen, onClose, onSuccess, title, subtitle, prefillRole = "patient" }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: prefillRole,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(loginForm);
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (onSuccess) {
        onSuccess(data.user);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (err.response?.data?.userId) {
        toast.error("Please verify your email first");
        navigate("/verify-otp", { state: { userId: err.response.data.userId, role: loginForm.role } });
        onClose();
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    setLoading(true);
    try {
      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        phone: registerForm.phone.trim() || undefined,
        role: "patient",
      };

      const { data } = await authAPI.register(payload);
      toast.success("OTP sent to your email!");
      localStorage.setItem("tempUserId", data.userId);
      localStorage.setItem("tempRole", "patient");
      onClose();
      navigate("/verify-otp", { state: { userId: data.userId, role: "patient" } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await authAPI.googleAuth({
        token: credentialResponse.credential,
        role: "patient",
      });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome, ${data.user.name}!`);
      if (onSuccess) {
        onSuccess(data.user);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {title || (mode === "login" ? "Sign In to Continue" : "Create Patient Account")}
            </h3>
            <p className="text-xs text-slate-500">MediBook Pro Healthcare</p>
          </div>
        </div>

        {subtitle && (
          <div className="mb-5 p-3 rounded-xl bg-primary-50 border border-primary-100 text-xs text-primary-800 leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
            <span>{subtitle}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            New Patient Sign Up
          </button>
        </div>

        {/* Mode = Login */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  className="input-field !py-2.5 pl-10 text-xs"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-[11px] text-primary-600 hover:underline font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field !py-2.5 pl-10 pr-10 text-xs"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing In..." : "Sign In & Proceed"}
            </button>

            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
                shape="pill"
                size="medium"
              />
            </div>
          </form>
        ) : (
          /* Mode = Register */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="input-field !py-2.5 pl-10 text-xs"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="input-field !py-2.5 pl-10 text-xs"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className="input-field !py-2.5 pl-10 text-xs"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Min 8 chars"
                    className="input-field !py-2.5 pl-10 pr-8 text-xs"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account & Continue"}
            </button>
          </form>
        )}

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Need practitioner access?{" "}
            <Link
              to="/login"
              onClick={onClose}
              className="text-primary-600 font-semibold hover:underline"
            >
              Doctor / Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
