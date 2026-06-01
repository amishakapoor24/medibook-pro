import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Shield } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import toast from "react-hot-toast";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getDoctorAppointments().then(({ data }) => setAppointments(data.data)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const pending = appointments.filter((a) => a.status === "pending").slice(0, 4);

  const handleAccept = async (id) => {
    try {
      await appointmentAPI.accept(id, { meetingInfo: "Please visit the clinic at the scheduled time. Bring all previous reports." });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "confirmed", isChatEnabled: true } : a));
      toast.success("Appointment confirmed!");
    } catch { toast.error("Failed to confirm"); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await appointmentAPI.reject(id, { reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "rejected" } : a));
      toast.success("Appointment rejected");
    } catch { toast.error("Failed to reject"); }
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Verification Banner */}
      {user?.verificationStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Profile under review</p>
            <p className="text-amber-600 text-xs">Your profile is being reviewed by our admin team. You'll be notified once approved.</p>
          </div>
        </div>
      )}

      {user?.verificationStatus === "approved" && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Welcome, Dr. {user?.name?.split(" ")[0]}! 👋</h2>
            <p className="text-primary-200 text-sm">You have <span className="text-white font-bold">{stats.pending}</span> pending appointment requests.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Appointments" value={stats.total} icon={Calendar} color="primary" />
        <StatCard title="Pending Requests" value={stats.pending} icon={AlertCircle} color="amber" />
        <StatCard title="Confirmed" value={stats.confirmed} icon={Clock} color="emerald" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="purple" />
      </div>

      {/* Pending Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">Pending Requests</h3>
          <Link to="/doctor/appointments" className="text-sm text-primary-600 font-medium hover:text-primary-700">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((appt) => (
              <div key={appt._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                {appt.patient?.profilePhoto ? (
                  <img src={appt.patient.profilePhoto} alt={appt.patient.name} className="w-11 h-11 rounded-full object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {appt.patient?.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{appt.patient?.name}</p>
                  <p className="text-xs text-slate-400">{format(new Date(appt.appointmentDate), "dd MMM yyyy")} • {appt.timeSlot?.start} • {appt.reason?.slice(0, 40)}...</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(appt._id)} className="btn-success text-xs px-3 py-1.5">Accept</button>
                  <button onClick={() => handleReject(appt._id)} className="btn-danger text-xs px-3 py-1.5">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
