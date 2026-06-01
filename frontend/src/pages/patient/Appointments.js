import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MessageSquare, X, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { appointmentAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusConfig = {
  pending: { class: "badge-pending", label: "Pending" },
  confirmed: { class: "badge-confirmed", label: "Confirmed" },
  completed: { class: "badge-completed", label: "Completed" },
  cancelled: { class: "badge-cancelled", label: "Cancelled" },
  rejected: { class: "badge-rejected", label: "Rejected" },
};

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    appointmentAPI.getMyAppointments().then(({ data }) => setAppointments(data.data)).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentAPI.cancel(id);
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "cancelled" } : a));
      toast.success("Appointment cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout title="My Appointments">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", "pending", "confirmed", "completed", "cancelled", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${filter === f ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const cfg = statusConfig[appt.status] || statusConfig.pending;
            return (
              <div key={appt._id} className="card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start gap-4">
                  {appt.doctor?.profilePhoto ? (
                    <img src={appt.doctor.profilePhoto} alt={appt.doctor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                      {appt.doctor?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-800">Dr. {appt.doctor?.name}</h3>
                        <p className="text-sm text-slate-500">{appt.doctor?.specialization}</p>
                      </div>
                      <span className={cfg.class}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(appt.appointmentDate), "dd MMM yyyy")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.timeSlot?.start} - {appt.timeSlot?.end}</span>
                      <span className="font-medium text-slate-700">₹{appt.fees}</span>
                    </div>
                    {appt.status === "confirmed" && appt.meetingInfo && (
                      <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                        📍 {appt.meetingInfo}
                      </div>
                    )}
                    {appt.status === "rejected" && appt.rejectionReason && (
                      <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-600">
                        ❌ {appt.rejectionReason}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      {appt.isChatEnabled && (
                        <Link to={`/patient/chat/${appt._id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Chat with Doctor
                        </Link>
                      )}
                      {appt.status === "pending" && (
                        <button onClick={() => handleCancel(appt._id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientAppointments;
