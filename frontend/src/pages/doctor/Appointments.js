import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MessageSquare, CheckCircle } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { appointmentAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusConfig = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  rejected: "badge-rejected",
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    appointmentAPI.getDoctorAppointments().then(({ data }) => setAppointments(data.data)).finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    const meetingInfo = window.prompt("Enter meeting info for patient:", "Please visit the clinic at the scheduled time.");
    if (meetingInfo === null) return;
    try {
      await appointmentAPI.accept(id, { meetingInfo });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "confirmed", isChatEnabled: true, meetingInfo } : a));
      toast.success("Appointment confirmed & patient notified!");
    } catch { toast.error("Failed to confirm"); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await appointmentAPI.reject(id, { reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "rejected", rejectionReason: reason } : a));
      toast.success("Appointment rejected");
    } catch { toast.error("Failed to reject"); }
  };

  const handleComplete = async (id) => {
    const prescription = window.prompt("Add prescription (optional):");
    try {
      await appointmentAPI.complete(id, { prescription: prescription || "" });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: "completed" } : a));
      toast.success("Appointment marked as completed");
    } catch { toast.error("Failed to complete"); }
  };

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout title="Appointments">
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", "pending", "confirmed", "completed", "cancelled", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${filter === f ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt._id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                {appt.patient?.profilePhoto ? (
                  <img src={appt.patient.profilePhoto} alt={appt.patient.name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                    {appt.patient?.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800">{appt.patient?.name}</h3>
                      <p className="text-xs text-slate-400">{appt.patient?.phone} • {appt.patient?.bloodGroup}</p>
                    </div>
                    <span className={statusConfig[appt.status]}>{appt.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(appt.appointmentDate), "dd MMM yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.timeSlot?.start}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg px-3 py-2">{appt.reason}</p>
                  <div className="flex gap-2 flex-wrap">
                    {appt.status === "pending" && (
                      <>
                        <button onClick={() => handleAccept(appt._id)} className="btn-success text-xs px-3 py-1.5">✓ Accept</button>
                        <button onClick={() => handleReject(appt._id)} className="btn-danger text-xs px-3 py-1.5">✗ Reject</button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <>
                        <button onClick={() => handleComplete(appt._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                        </button>
                        <Link to={`/doctor/chat/${appt._id}`} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointments;
