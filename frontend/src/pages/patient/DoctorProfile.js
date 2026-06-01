import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, MapPin, Clock, Calendar, Award, ChevronLeft } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { doctorAPI, appointmentAPI } from "../../services/api";
import { format, addDays } from "date-fns";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    doctorAPI.getById(id).then(({ data }) => setDoctor(data.data)).catch(() => toast.error("Doctor not found")).finally(() => setLoading(false));
  }, [id]);

  const next7Days = [...Array(7)].map((_, i) => addDays(new Date(), i + 1));

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !reason.trim()) {
      return toast.error("Please fill all fields");
    }
    setBooking(true);
    try {
      await appointmentAPI.book({ doctorId: id, appointmentDate: selectedDate, timeSlot: selectedSlot, reason });
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Doctor Profile">
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  if (!doctor) return <DashboardLayout title="Doctor Profile"><div className="text-center py-10 text-slate-500">Doctor not found</div></DashboardLayout>;

  return (
    <DashboardLayout title="Doctor Profile">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5">
        <ChevronLeft className="w-4 h-4" /> Back to Doctors
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex gap-5 items-start">
              {doctor.profilePhoto ? (
                <img src={doctor.profilePhoto} alt={doctor.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl">
                  {doctor.name?.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-slate-800">Dr. {doctor.name}</h2>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">✓ Verified</span>
                </div>
                <p className="text-primary-600 font-medium mb-2">{doctor.specialization}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-medium text-slate-700">{doctor.rating?.average?.toFixed(1) || "New"}</span><span>({doctor.rating?.count || 0} reviews)</span></div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /><span>{doctor.experience} yrs experience</span></div>
                  {doctor.address?.city && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /><span>{doctor.address.city}</span></div>}
                </div>
              </div>
            </div>
            {doctor.bio && <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{doctor.bio}</p>}
          </div>

          {/* Qualifications */}
          {doctor.qualifications?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-primary-500" /> Qualifications</h3>
              <div className="space-y-2">
                {doctor.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{q.degree}</span>
                    <span className="text-slate-400">—</span>
                    <span className="text-slate-500">{q.institute}, {q.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Days */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" /> Available Days</h3>
            <div className="flex gap-2 flex-wrap">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const full = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i];
                const avail = doctor.availableDays?.includes(full);
                return <span key={day} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${avail ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-400"}`}>{day}</span>;
              })}
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="space-y-4">
          <div className="card sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Book Appointment</h3>
              <span className="text-lg font-bold text-primary-600">₹{doctor.fees}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Select Date</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {next7Days.map((date) => {
                    const dayName = format(date, "EEE");
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center p-2 rounded-xl text-xs transition-all border ${isSelected ? "bg-primary-600 text-white border-primary-600" : "bg-white border-slate-200 text-slate-600 hover:border-primary-300"}`}>
                        <span className="font-medium">{dayName}</span>
                        <span className="font-bold text-sm">{format(date, "d")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {doctor.timeSlots?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {doctor.timeSlots.map((slot, i) => (
                      <button key={i} onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl text-xs font-medium border transition-all ${JSON.stringify(selectedSlot) === JSON.stringify(slot) ? "bg-primary-600 text-white border-primary-600" : "border-slate-200 text-slate-600 hover:border-primary-300"}`}>
                        {slot.start} - {slot.end}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Reason for Visit</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Briefly describe your symptoms..."
                  value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <button onClick={handleBook} disabled={booking} className="btn-primary w-full py-3">
                {booking ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
