import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Calendar } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { appointmentAPI } from "../../services/api";
import { format } from "date-fns";

const PatientMessages = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getMyAppointments()
      .then(({ data }) => {
        const chatEnabled = data.data.filter((a) => a.isChatEnabled);
        setAppointments(chatEnabled);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Messages">
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 card">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No active chats</p>
          <p className="text-slate-400 text-sm">Chats open after a doctor confirms your appointment</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {appointments.map((appt) => (
            <Link key={appt._id} to={`/patient/chat/${appt._id}`}
              className="card flex items-center gap-4 hover:shadow-card-hover transition-all group">
              {appt.doctor?.profilePhoto ? (
                <img src={appt.doctor.profilePhoto} alt={appt.doctor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {appt.doctor?.name?.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">Dr. {appt.doctor?.name}</p>
                <p className="text-xs text-slate-400">{appt.doctor?.specialization}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(appt.appointmentDate), "dd MMM yyyy")}
                </p>
              </div>
              <span className="text-primary-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientMessages;