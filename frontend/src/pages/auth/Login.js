import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Eye, EyeOff, Stethoscope } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "patient" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      const redirectMap = { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
      navigate(redirectMap[data.user.role]);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (err.response?.data?.userId) {
        toast.error("Please verify your email first");
        navigate("/verify-otp", { state: { userId: err.response.data.userId, role: form.role } });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const { data } = await authAPI.googleAuth({ token: credentialResponse.credential, role: form.role });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome, ${data.user.name}!`);
      const redirectMap = { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
      navigate(redirectMap[data.user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MediBook Pro</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">Your Health,<br />Our Priority</h2>
          <p className="text-primary-200 text-lg">Book appointments with verified doctors, manage your health journey, and stay connected with your care team.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[["500+", "Verified Doctors"], ["10k+", "Happy Patients"], ["98%", "Satisfaction Rate"], ["24/7", "Support"]].map(([num, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-primary-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediBook Pro</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue</p>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {["patient", "doctor"].map((role) => (
              <button key={role} onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.role === role ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} className="input-field pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="flex justify-center">
            {form.role === "admin" ? (
              <p className="text-xs text-slate-400">Administrators sign in with email and password.</p>
            ) : (
              <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error("Google login failed")} shape="pill" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, role: "admin" })}
            className="block mx-auto mt-4 text-xs text-slate-400 hover:text-primary-600 transition-colors"
          >
            Admin sign in
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
