import { useState, useEffect } from "react";
import { User, Phone, Droplet } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { appointmentAPI } from "../../services/api";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getDoctorAppointments().then(({ data }) => {
      const unique = [];
      const seen = new Set();
      data.data.forEach((appt) => {
        if (appt.patient && !seen.has(appt.patient._id)) {
          seen.add(appt.patient._id);
          unique.push(appt.patient);
        }
      });
      setPatients(unique);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Patients">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 card">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No patients yet</p>
          <p className="text-slate-400 text-sm">Patients will appear after confirmed appointments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div key={patient._id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {patient.profilePhoto ? (
                  <img src={patient.profilePhoto} alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                    {patient.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-400">{patient.email}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-slate-500">
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.bloodGroup && (
                  <div className="flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-red-400" />
                    <span>Blood Group: {patient.bloodGroup}</span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.gender}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatients;