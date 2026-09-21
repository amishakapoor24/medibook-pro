import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Stethoscope, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

const statusConfig = {
  pending: { class: "badge-pending", icon: AlertCircle, color: "text-amber-500" },
  confirmed: { class: "badge-confirmed", icon: CheckCircle, color: "text-emerald-500" },
  completed: { class: "badge-completed", icon: CheckCircle, color: "text-blue-500" },
  cancelled: { class: "badge-cancelled", icon: XCircle, color: "text-slate-400" },
  rejected: { class: "badge-rejected", icon: XCircle, color: "text-red-500" },
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getMyAppointments().then(({ data }) => {
      setAppointments(data.data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const recent = appointments.slice(0, 5);

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Good morning, {user?.name?.split(" ")[0]}! 👋</h2>
          <p className="text-primary-200 text-sm">Here's an overview of your health appointments.</p>
          <Link to="/patient/doctors" className="mt-4 inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
            <Stethoscope className="w-4 h-4" /> Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Appointments" value={stats.total} icon={Calendar} color="primary" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={Clock} color="emerald" />
        <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="amber" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="purple" />
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">Recent Appointments</h3>
          <Link to="/patient/appointments" className="text-sm text-primary-600 font-medium hover:text-primary-700">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No appointments yet</p>
            <p className="text-slate-400 text-sm mb-4">Book your first appointment with a verified doctor</p>
            <Link to="/patient/doctors" className="btn-primary text-sm">Find Doctors</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((appt) => {
              const cfg = statusConfig[appt.status] || statusConfig.pending;
              return (
                <Link key={appt._id} to={`/patient/appointments`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
                  {appt.doctor?.profilePhoto ? (
                    <img src={appt.doctor.profilePhoto} alt={appt.doctor.name} className="w-11 h-11 rounded-full object-cover border-2 border-slate-100" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {appt.doctor?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">Dr. {appt.doctor?.name}</p>
                    <p className="text-xs text-slate-400">{appt.doctor?.specialization} • {format(new Date(appt.appointmentDate), "dd MMM yyyy")} • {appt.timeSlot?.start}</p>
                  </div>
                  <span className={cfg.class}>{appt.status}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
