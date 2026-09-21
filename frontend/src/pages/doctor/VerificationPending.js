import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";

const VerificationPending = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(false);

  const checkStatus = async (showMessage = false) => {
    setChecking(true);
    try {
      const { data } = await authAPI.getMe();
      updateUser(data.data);
      if (data.data.verificationStatus === "approved") {
        toast.success("Your profile has been approved!");
        navigate("/doctor/dashboard", { replace: true });
      } else if (showMessage) {
        toast("Your profile is still under review.");
      }
    } catch {
      toast.error("Unable to check verification status");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user?.verificationStatus === "approved") {
      navigate("/doctor/dashboard", { replace: true });
      return undefined;
    }

    const interval = setInterval(() => checkStatus(), 10000);
    return () => clearInterval(interval);
  }, [user?.verificationStatus, navigate, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="card p-8 sm:p-10">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Doctor verification</p>
          <h1 className="text-3xl font-bold text-slate-800 mt-2">Your profile is under verification</h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Thanks for registering, Dr. {user?.name?.split(" ")[0] || "Doctor"}. Our admin team is reviewing your professional details and documents.
          </p>

          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm text-emerald-800">Registration received</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-800">Admin review in progress</span>
            </div>
          </div>

          <p className="text-sm text-slate-400 mt-6">
            You will be able to appear in Find Doctors and receive appointments after approval.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button type="button" onClick={() => checkStatus(true)} disabled={checking} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking..." : "Check status"}
            </button>
            <button type="button" onClick={handleLogout} className="btn-secondary flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
