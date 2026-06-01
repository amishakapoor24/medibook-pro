import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, Calendar, Clock, Shield, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getAnalytics(), adminAPI.getPendingDoctors()])
      .then(([analyticsRes, pendingRes]) => {
        setAnalytics(analyticsRes.data.data);
        setPendingDoctors(pendingRes.data.data.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      setPendingDoctors((prev) => prev.filter((d) => d._id !== id));
      toast.success("Doctor approved & notified!");
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await adminAPI.rejectDoctor(id, { reason });
      setPendingDoctors((prev) => prev.filter((d) => d._id !== id));
      toast.success("Doctor rejected & notified");
    } catch { toast.error("Failed to reject"); }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients" value={loading ? "—" : analytics?.totalPatients} icon={Users} color="primary" />
        <StatCard title="Verified Doctors" value={loading ? "—" : analytics?.totalDoctors} icon={UserCheck} color="emerald" />
        <StatCard title="Total Appointments" value={loading ? "—" : analytics?.totalAppointments} icon={Calendar} color="purple" />
        <StatCard title="Pending Verification" value={loading ? "—" : analytics?.pendingDoctors} icon={Shield} color="amber" subtitle="Requires review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Doctor Verifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-800">Pending Verifications</h3>
            <Link to="/admin/verification" className="text-sm text-primary-600 font-medium hover:text-primary-700">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : pendingDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDoctors.map((doc) => (
                <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200">
                  {doc.profilePhoto ? (
                    <img src={doc.profilePhoto} alt={doc.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {doc.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">Dr. {doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.specialization} • {doc.experience} yrs</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(doc._id)} className="btn-success text-xs px-2.5 py-1.5">Approve</button>
                    <button onClick={() => handleReject(doc._id)} className="btn-danger text-xs px-2.5 py-1.5">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Appointment Overview
          </h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {analytics?.appointmentStats?.map(({ _id: status, count }) => {
                const colors = { pending: "bg-amber-500", confirmed: "bg-emerald-500", completed: "bg-blue-500", cancelled: "bg-slate-400", rejected: "bg-red-400" };
                const total = analytics.totalAppointments || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-600 capitalize">{status}</span>
                      <span className="text-sm font-semibold text-slate-800">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[status] || "bg-slate-400"} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Specialization Stats */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">Doctors by Specialization</h3>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {analytics?.specializationStats?.map(({ _id: spec, count }) => (
                <div key={spec} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-primary-600 mb-1">{count}</p>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{spec}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
