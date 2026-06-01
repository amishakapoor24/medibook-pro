import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Stethoscope, Mail } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const stateUserId = location.state?.userId;
  const stateRole = location.state?.role;
  const [userId, setUserId] = useState(stateUserId || localStorage.getItem("tempUserId"));
  const [role, setRole] = useState(stateRole || localStorage.getItem("tempRole"));
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!userId) {
      toast.error("Session expired. Please register again.");
      navigate("/register");
    }
    const timer = setInterval(() => setResendTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [userId, navigate]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Please enter the complete OTP");
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ userId, otp: code, role });
      login(data.user, data.accessToken, data.refreshToken);
      // Clear temporary data
      localStorage.removeItem("tempUserId");
      localStorage.removeItem("tempRole");
      toast.success("Email verified successfully!");
      const redirectMap = { patient: "/patient/dashboard", doctor: "/doctor/dashboard" };
      navigate(redirectMap[data.user.role] || "/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.resendOTP({ userId, role });
      toast.success("OTP resent to your email");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify your email</h1>
          <p className="text-slate-500 mb-8 text-sm">We've sent a 6-digit OTP to your email address. Enter it below to verify your account.</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-slate-50"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mb-4">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button onClick={handleResend} disabled={resendTimer > 0}
            className={`text-sm font-medium transition-colors ${resendTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-primary-600 hover:text-primary-700 cursor-pointer"}`}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
