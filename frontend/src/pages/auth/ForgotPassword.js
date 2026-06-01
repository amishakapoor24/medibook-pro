import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../../services/api";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email, role });
      toast.success("OTP sent to your email");
      navigate("/reset-password", { state: { userId: data.userId, role } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card">
          <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Forgot password?</h1>
          <p className="text-slate-500 mb-6 text-sm">Enter your email and we'll send you an OTP to reset your password.</p>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            {["patient", "doctor"].map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${role === r ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"}`}>
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {};
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ userId, ...form, role });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset password</h1>
          <p className="text-slate-500 mb-6 text-sm">Enter the OTP sent to your email and your new password.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">OTP Code</label>
              <input type="text" maxLength={6} className="input-field" placeholder="6-digit OTP"
                value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">New Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters"
                value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};