import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, MapPin, Clock, Calendar, Award, ChevronLeft, ShieldCheck, Lock } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import PublicNavbar from "../../components/common/PublicNavbar";
import PublicFooter from "../../components/common/PublicFooter";
import AuthModal from "../../components/common/AuthModal";
import { doctorAPI, appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format, addDays } from "date-fns";

const fallbackDoctorsList = [
  {
    _id: "doc-1",
    name: "Aarav Sharma",
    specialization: "Cardiologist",
    experience: 14,
    fees: 800,
    profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.9, count: 124 },
    address: { clinic: "Apollo Heart Center", city: "Mumbai", state: "Maharashtra" },
    bio: "Senior Consultant Interventional Cardiologist specializing in cardiovascular wellness, heart failure management, and preventive clinical cardiology.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    qualifications: [
      { degree: "MBBS", institute: "AIIMS New Delhi", year: 2008 },
      { degree: "MD - Medicine", institute: "KEM Hospital Mumbai", year: 2012 },
      { degree: "DM - Cardiology", institute: "SCTIMST", year: 2016 },
    ],
    timeSlots: [{ start: "09:00", end: "09:30" }, { start: "11:30", end: "12:00" }, { start: "16:00", end: "16:30" }],
  },
  {
    _id: "doc-2",
    name: "Priya Nair",
    specialization: "Dermatologist",
    experience: 9,
    fees: 600,
    profilePhoto: "https://images.unsplash.com/photo-1594824813626-d62f3f4c6e94?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.8, count: 98 },
    address: { clinic: "Glow Skin & Laser Clinic", city: "Bengaluru", state: "Karnataka" },
    bio: "Board-certified clinical and cosmetic dermatologist with expertise in acne therapies, laser treatments, eczema, and skin rejuvenation.",
    availableDays: ["Monday", "Wednesday", "Thursday", "Friday"],
    qualifications: [
      { degree: "MBBS", institute: "Bangalore Medical College", year: 2013 },
      { degree: "MD - Dermatology", institute: "JIPMER Puducherry", year: 2017 },
    ],
    timeSlots: [{ start: "10:00", end: "10:30" }, { start: "15:00", end: "15:30" }],
  },
  {
    _id: "doc-3",
    name: "Rajesh Kulkarni",
    specialization: "General Physician",
    experience: 18,
    fees: 500,
    profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.9, count: 215 },
    address: { clinic: "Kulkarni Care Polyclinic", city: "Pune", state: "Maharashtra" },
    bio: "Senior physician dedicated to holistic family medicine, lifestyle disorder prevention, hypertension, and diabetes management.",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    qualifications: [
      { degree: "MBBS", institute: "BJ Government Medical College", year: 2004 },
      { degree: "MD - General Medicine", institute: "Grant Medical College Mumbai", year: 2008 },
    ],
    timeSlots: [{ start: "08:30", end: "09:00" }, { start: "16:00", end: "16:30" }],
  },
  {
    _id: "doc-4",
    name: "Ananya Mukherjee",
    specialization: "Pediatrician",
    experience: 11,
    fees: 550,
    profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.9, count: 142 },
    address: { clinic: "Little Stars Child Clinic", city: "Kolkata", state: "West Bengal" },
    bio: "Compassionate child specialist focusing on newborn care, developmental milestones, pediatric allergies, and child immunization.",
    availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    qualifications: [
      { degree: "MBBS", institute: "Medical College Kolkata", year: 2011 },
      { degree: "DCH & DNB - Pediatrics", institute: "Child Health Trust", year: 2015 },
    ],
    timeSlots: [{ start: "10:00", end: "10:30" }, { start: "16:00", end: "16:30" }],
  },
  {
    _id: "doc-5",
    name: "Vikram Singhania",
    specialization: "Orthopedic",
    experience: 15,
    fees: 750,
    profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.7, count: 87 },
    address: { clinic: "Singhania Bone & Joint Hospital", city: "Delhi", state: "Delhi" },
    bio: "Orthopedic surgeon specializing in arthroscopy, joint replacement, sports injury rehab, and spine disorders.",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    qualifications: [
      { degree: "MBBS", institute: "Maulana Azad Medical College", year: 2007 },
      { degree: "MS - Orthopedics", institute: "Safdarjung Hospital", year: 2011 },
    ],
    timeSlots: [{ start: "09:30", end: "10:00" }, { start: "14:30", end: "15:00" }],
  },
  {
    _id: "doc-6",
    name: "Sneha Reddy",
    specialization: "Neurologist",
    experience: 12,
    fees: 900,
    profilePhoto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&auto=format&fit=crop&q=80",
    rating: { average: 4.9, count: 76 },
    address: { clinic: "NeuroWellness Center", city: "Hyderabad", state: "Telangana" },
    bio: "Specialist in headaches, epilepsy, neuromuscular conditions, and stroke management with advanced neuro-diagnostic protocols.",
    availableDays: ["Monday", "Wednesday", "Friday"],
    qualifications: [
      { degree: "MBBS", institute: "Osmania Medical College", year: 2010 },
      { degree: "DM - Neurology", institute: "NIMHANS Bengaluru", year: 2018 },
    ],
    timeSlots: [{ start: "10:30", end: "11:00" }, { start: "15:30", end: "16:00" }],
  },
];

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isDashboardView = Boolean(user && location.pathname.startsWith("/patient"));

  useEffect(() => {
    doctorAPI
      .getById(id)
      .then(({ data }) => setDoctor(data.data))
      .catch(() => {
        const found = fallbackDoctorsList.find((d) => d._id === id);
        if (found) {
          setDoctor(found);
        } else {
          toast.error("Doctor profile not found");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const next7Days = [...Array(7)].map((_, i) => addDays(new Date(), i + 1));

  const proceedBooking = async (activeUser) => {
    const currentUser = activeUser || user;
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (currentUser.role !== "patient") {
      return toast.error("Only registered patient accounts can book appointments.");
    }

    if (!selectedDate || !selectedSlot || !reason.trim()) {
      return toast.error("Please select a date, time slot, and enter your reason for visit.");
    }

    setBooking(true);
    try {
      await appointmentAPI.book({
        doctorId: id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason,
      });
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const handleBook = () => {
    if (!user) {
      if (!selectedDate || !selectedSlot || !reason.trim()) {
        toast("Please choose your date & slot first, then sign in to confirm.", { icon: "ℹ️" });
      }
      setAuthModalOpen(true);
      return;
    }
    proceedBooking(user);
  };

  const content = (
    <div className="animate-fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {!user && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-primary-50/70 border border-primary-100 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-primary-600" />
            <span>Browsing public doctor credentials. Sign in required to confirm booking.</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-56 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
        </div>
      ) : !doctor ? (
        <div className="card text-center py-16">
          <h3 className="text-base font-bold text-slate-700">Doctor not found</h3>
          <p className="text-xs text-slate-400 mt-1">
            The requested doctor profile might have moved or is inactive.
          </p>
          <Link to="/" className="btn-primary text-xs mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {doctor.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt={doctor.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shadow-sm">
                    {doctor.name?.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-900">Dr. {doctor.name}</h2>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Specialist
                    </span>
                  </div>

                  <p className="text-primary-600 font-semibold mb-2">{doctor.specialization}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800">
                        {doctor.rating?.average?.toFixed(1) || "4.9"}
                      </span>
                      <span>({doctor.rating?.count || 48} reviews)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{doctor.experience} years experience</span>
                    </div>

                    {doctor.address?.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>
                          {doctor.address.clinic ? `${doctor.address.clinic}, ` : ""}
                          {doctor.address.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">About the Doctor</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </div>

            {/* Qualifications */}
            {doctor.qualifications?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" />
                  <span>Medical Education & Credentials</span>
                </h3>
                <div className="space-y-2.5">
                  {doctor.qualifications.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                      <span className="font-bold text-slate-800">{q.degree}</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-slate-600">
                        {q.institute}, {q.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Days */}
            <div className="card">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <span>Weekly Clinic Schedule</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const full = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i];
                  const avail = doctor.availableDays?.includes(full);
                  return (
                    <span
                      key={day}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                        avail
                          ? "bg-primary-100 text-primary-700 border border-primary-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {day} {avail && "✓"}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="space-y-4">
            <div className="card sticky top-24 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Schedule Consultation</h3>
                  <p className="text-[11px] text-slate-400">30 min slot • Instant confirmation</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase">Fee</span>
                  <span className="text-xl font-extrabold text-primary-600">
                    ₹{doctor.fees || 500}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Date Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">1. Select Appointment Date</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {next7Days.map((date) => {
                      const dayName = format(date, "EEE");
                      const dateStr = format(date, "yyyy-MM-dd");
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex flex-col items-center p-2 rounded-xl text-xs transition-all border ${
                            isSelected
                              ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:border-primary-300"
                          }`}
                        >
                          <span className="font-medium text-[11px]">{dayName}</span>
                          <span className="font-bold text-sm">{format(date, "d")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Slot Picker */}
                {doctor.timeSlots?.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">2. Choose Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {doctor.timeSlots.map((slot, i) => {
                        const isSelected =
                          selectedSlot &&
                          selectedSlot.start === slot.start &&
                          selectedSlot.end === slot.end;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                                : "border-slate-200 text-slate-600 hover:border-primary-300 bg-white"
                            }`}
                          >
                            {slot.start} - {slot.end}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reason Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">3. Reason for Visit</label>
                  <textarea
                    className="input-field resize-none text-xs"
                    rows={3}
                    placeholder="Briefly describe your symptoms (e.g. fever, headache, checkup)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                {/* Book Action Button */}
                <button
                  type="button"
                  onClick={handleBook}
                  disabled={booking}
                  className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  {booking ? (
                    "Booking Appointment..."
                  ) : !user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Book Appointment</span>
                    </>
                  ) : (
                    "Confirm Appointment Booking"
                  )}
                </button>

                {!user && (
                  <p className="text-[11px] text-slate-400 text-center leading-snug">
                    You can select your preferred slot now. Clicking will prompt quick sign in / sign up to finish booking.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal when booking without authorization */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setAuthModalOpen(false);
          proceedBooking(loggedUser);
        }}
        title="Patient Authorization Required"
        subtitle={`Please sign in or create an account to finalize your booking with Dr. ${doctor?.name || "the specialist"}.`}
      />
    </div>
  );

  if (isDashboardView) {
    return <DashboardLayout title="Doctor Profile">{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {content}
      </main>
      <PublicFooter />
    </div>
  );
};

export default DoctorProfile;
