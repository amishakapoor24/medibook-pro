import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Stethoscope } from "lucide-react";
import { authAPI } from "../../services/api";

const specializations = [
  "General Physician", "Dermatologist", "Cardiologist", "Orthopedic",
  "Pediatrician", "Neurologist", "Dentist", "Gynecologist",
  "Ophthalmologist", "Psychiatrist", "ENT Specialist", "Other"
];

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    fees: "",
    city: "",
    state: "",
    clinic: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      };

      if (role === "doctor") {
        payload.specialization = form.specialization;
        payload.experience = form.experience;
        payload.fees = form.fees;
        payload.address = {
          city: form.city,
          state: form.state,
          clinic: form.clinic,
        };
      }

      const { data } = await authAPI.register(payload);
      toast.success("OTP sent to your email!");
      // Store in localStorage as backup for state persistence
      localStorage.setItem("tempUserId", data.userId);
      localStorage.setItem("tempRole", role);
      navigate("/verify-otp", { state: { userId: data.userId, role } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">MediBook Pro</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">Create account</h1>
        <p className="text-slate-500 mb-6">Join thousands of patients and doctors</p>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          {["patient", "doctor"].map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${role === r ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"}`}>
              {r === "patient" ? "Patient" : "Doctor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
            <input type="text" className="input-field" placeholder="John Doe"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone</label>
              <input type="tel" className="input-field" placeholder="10-digit number"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} className="input-field pr-10"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Doctor Only Fields */}
          {role === "doctor" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Specialization</label>
                <select className="input-field" value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })} required>
                  <option value="">Select specialization</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Experience (years)</label>
                  <input type="number" className="input-field" placeholder="e.g. 5"
                    value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Consultation Fees (₹)</label>
                  <input type="number" className="input-field" placeholder="e.g. 500"
                    value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">City</label>
                  <input type="text" className="input-field" placeholder="e.g. Mumbai"
                    value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">State</label>
                  <input type="text" className="input-field" placeholder="e.g. Maharashtra"
                    value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Clinic Name (optional)</label>
                <input type="text" className="input-field" placeholder="e.g. City Care Clinic"
                  value={form.clinic} onChange={(e) => setForm({ ...form, clinic: e.target.value })} />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;