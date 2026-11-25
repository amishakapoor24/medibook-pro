import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Star, MapPin, Clock, ChevronRight, ShieldCheck,
  Bot, Sparkles, HeartPulse, Award, Calendar, CheckCircle,
  MessageSquare, Users, ArrowRight, Activity, Stethoscope, Phone
} from "lucide-react";
import PublicNavbar from "../../components/common/PublicNavbar";
import PublicFooter from "../../components/common/PublicFooter";
import AuthModal from "../../components/common/AuthModal";
import { doctorAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const fallbackDoctors = [
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
    timeSlots: [{ start: "10:30", end: "11:00" }, { start: "15:30", end: "16:00" }],
  },
];

const specialtiesList = [
  { name: "General Physician", icon: Activity, desc: "Fever, cold, viral infections & family care", count: "12+ Doctors", color: "from-blue-500/10 to-blue-600/20 text-blue-600" },
  { name: "Cardiologist", icon: HeartPulse, desc: "Heart conditions, hypertension & chest care", count: "8+ Doctors", color: "from-red-500/10 to-red-600/20 text-red-600" },
  { name: "Dermatologist", icon: Sparkles, desc: "Skin health, acne, hair fall & allergies", count: "10+ Doctors", color: "from-amber-500/10 to-amber-600/20 text-amber-600" },
  { name: "Pediatrician", icon: Users, desc: "Infant & child health, vaccinations", count: "7+ Doctors", color: "from-emerald-500/10 to-emerald-600/20 text-emerald-600" },
  { name: "Orthopedic", icon: Award, desc: "Joint pain, bone fractures & arthritis", count: "9+ Doctors", color: "from-purple-500/10 to-purple-600/20 text-purple-600" },
  { name: "Neurologist", icon: Stethoscope, desc: "Brain, nerves, migraine & spine issues", count: "5+ Doctors", color: "from-cyan-500/10 to-cyan-600/20 text-cyan-600" },
];

const assistantDemoPrompts = [
  {
    q: "I have a throbbing headache and mild sensitivity to light. What should I do?",
    a: "A throbbing headache with light sensitivity could indicate a migraine or tension headache. Resting in a dark, quiet room, staying hydrated, and a cold compress may help. However, if accompanied by sudden neck stiffness, fever, or vision loss, seek urgent care. Would you like to schedule an appointment with a Neurologist?",
    specialist: "Neurologist"
  },
  {
    q: "My 4-year-old child has had a mild fever (100.2°F) since yesterday.",
    a: "Mild fevers in children often accompany common viral infections. Ensure regular hydration with fluids, dress them in light clothing, and monitor activity levels. If the fever exceeds 102°F, persists past 48 hours, or the child is unusually lethargic, consult a Pediatrician immediately.",
    specialist: "Pediatrician"
  },
  {
    q: "Sudden itchy red patches on my arm after eating seafood.",
    a: "This sounds like an acute allergic skin reaction (urticaria/hives). Avoid scratching, take a cool shower, and avoid allergen re-exposure. If you experience difficulty breathing, lip or throat swelling, seek emergency care immediately. For persistent skin reactions, consult a Dermatologist.",
    specialist: "Dermatologist"
  }
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Doctors & Search State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [sort, setSort] = useState("rating");

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalSubtitle, setAuthModalSubtitle] = useState("");
  const [pendingDoctorId, setPendingDoctorId] = useState(null);

  // AI Demo State
  const [activeDemoIdx, setActiveDemoIdx] = useState(0);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpec, sort]);

  const fetchDoctors = () => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (cityFilter.trim()) params.city = cityFilter.trim();
    if (selectedSpec !== "All") params.specialization = selectedSpec;
    if (sort) params.sort = sort;

    doctorAPI.getAll(params)
      .then(({ data }) => {
        if (data.data && data.data.length > 0) {
          setDoctors(data.data);
        } else {
          // If server returned 0 or filter has no match, filter fallback
          filterFallbackDoctors(selectedSpec, search, cityFilter, sort);
        }
      })
      .catch(() => {
        filterFallbackDoctors(selectedSpec, search, cityFilter, sort);
      })
      .finally(() => setLoading(false));
  };

  const filterFallbackDoctors = (spec, searchTxt, cityTxt, sortOpt) => {
    let list = [...fallbackDoctors];
    if (spec !== "All") {
      list = list.filter((d) => d.specialization.toLowerCase() === spec.toLowerCase());
    }
    if (searchTxt) {
      list = list.filter((d) => d.name.toLowerCase().includes(searchTxt.toLowerCase()) || d.specialization.toLowerCase().includes(searchTxt.toLowerCase()));
    }
    if (cityTxt) {
      list = list.filter((d) => d.address?.city?.toLowerCase().includes(cityTxt.toLowerCase()));
    }
    if (sortOpt === "fees_asc") list.sort((a, b) => a.fees - b.fees);
    else if (sortOpt === "fees_desc") list.sort((a, b) => b.fees - a.fees);
    else if (sortOpt === "experience") list.sort((a, b) => b.experience - a.experience);
    else list.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));

    setDoctors(list);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
    const elem = document.getElementById("doctors");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  const handleBookClick = (doctor) => {
    if (!user) {
      // User is not logged in: show the login/signup prompt screen modal
      setPendingDoctorId(doctor._id);
      setAuthModalSubtitle(`Sign in or create a patient account to book an appointment with Dr. ${doctor.name}.`);
      setAuthModalOpen(true);
    } else if (user.role !== "patient") {
      navigate(`/doctors/${doctor._id}`);
    } else {
      navigate(`/doctors/${doctor._id}`);
    }
  };

  const handleAssistantClick = () => {
    if (!user) {
      setAuthModalSubtitle("Sign in as a patient to start an interactive health consult with our AI Health Assistant.");
      setAuthModalOpen(true);
    } else if (user.role === "patient") {
      navigate("/patient/assistant");
    } else {
      navigate("/patient/assistant");
    }
  };

  const handleAuthSuccess = (loggedUser) => {
    if (pendingDoctorId) {
      navigate(`/doctors/${pendingDoctorId}`);
    } else if (loggedUser.role === "patient") {
      navigate("/patient/dashboard");
    } else {
      navigate("/doctor/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-800">
      {/* Top-Side Navigation */}
      <PublicNavbar onOpenAuthModal={() => { setAuthModalSubtitle(""); setAuthModalOpen(true); }} />

      {/* Auth Modal Triggered on Authorization Actions */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        subtitle={authModalSubtitle}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-spin-slow" />
              Verified Specialists & 24/7 Smart Health
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
              Healthcare at your fingertips.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
                Anytime, Anywhere.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Browse top verified doctors, consult in person or online, explore verified reviews, and get instant symptom triage from our AI Health Assistant.
            </p>
          </div>

          {/* Quick Doctor Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-slate-100 mb-12">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Doctor Search */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Doctor name or condition..."
                  className="input-field !py-3 pl-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Specialty Select */}
              <div className="md:col-span-3">
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="input-field !py-3 text-sm"
                >
                  <option value="All">All Specialties</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Gynecologist">Gynecologist</option>
                </select>
              </div>

              {/* City Input */}
              <div className="md:col-span-3 relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="City (e.g. Mumbai, Delhi)"
                  className="input-field !py-3 pl-10 text-sm"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>

              {/* Search Submit */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="btn-primary w-full !py-3 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2">
            {[
              { icon: ShieldCheck, title: "100% Verified", desc: "Licensed & screened doctors" },
              { icon: Calendar, title: "Instant Booking", desc: "No wait queues, pick your slot" },
              { icon: Bot, title: "AI Health Assistant", desc: "24/7 symptom guidance" },
              { icon: Star, title: "4.9/5 Rating", desc: "Trusted by 10,000+ patients" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3 hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Directory Section */}
      <section id="specialties" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Comprehensive Care</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Medical Specialties
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Find certified specialists across critical healthcare disciplines
              </p>
            </div>
            <button
              onClick={() => { setSelectedSpec("All"); const el = document.getElementById("doctors"); el?.scrollIntoView({ behavior: "smooth" }); }}
              className="mt-3 sm:mt-0 text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
            >
              View all doctors <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialtiesList.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setSelectedSpec(item.name);
                  const el = document.getElementById("doctors");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-card hover:border-primary-100 transition-all duration-200 cursor-pointer flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-primary-500">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                  <span className="text-xs font-semibold text-primary-600 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Book specialist <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Doctors Directory Section */}
      <section id="doctors" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Top Practitioners</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Verified Available Doctors
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Schedule your in-clinic or telemedicine consultation in seconds
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                className="input-field !py-2 !px-3 text-xs w-44 bg-white"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fees_asc">Fees: Low to High</option>
                <option value="fees_desc">Fees: High to Low</option>
              </select>

              <button
                onClick={() => { setSelectedSpec("All"); setSearch(""); setCityFilter(""); }}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Quick Specialty Pill Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {["All", "General Physician", "Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic", "Neurologist"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSpec(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedSpec === s
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="card text-center py-16">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No doctors match your criteria</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try selecting a different specialty or clearing your search term to see more specialists.
              </p>
              <button
                onClick={() => { setSelectedSpec("All"); setSearch(""); setCityFilter(""); }}
                className="btn-primary text-xs mt-4 !py-2 !px-4"
              >
                View All Doctors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group border border-slate-100"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex gap-4 mb-4">
                      {doctor.profilePhoto ? (
                        <img
                          src={doctor.profilePhoto}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-slate-100 group-hover:border-primary-200 transition-colors"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl flex-shrink-0 bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                          {doctor.name?.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="font-bold text-slate-900 truncate text-base">
                            Dr. {doctor.name}
                          </h3>
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ✓ Verified
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-primary-600">{doctor.specialization}</p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-800">
                            {doctor.rating?.average?.toFixed(1) || "4.8"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({doctor.rating?.count || 45} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{doctor.experience} years clinical experience</span>
                      </div>
                      {doctor.address?.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{doctor.address.clinic ? `${doctor.address.clinic}, ` : ""}{doctor.address.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio snippet */}
                    {doctor.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {doctor.bio}
                      </p>
                    )}
                  </div>

                  {/* Card Action & Pricing Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Consultation Fee</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{doctor.fees || 500}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/doctors/${doctor._id}`}
                        className="btn-secondary !py-2 !px-3 text-xs font-semibold"
                      >
                        Profile
                      </Link>

                      <button
                        onClick={() => handleBookClick(doctor)}
                        className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span>Book Slot</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Health Assistant Spotlight Section */}
      <section id="ai-assistant" className="py-20 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Info & Action */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4 text-primary-400" />
                Next-Gen Health Triage
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Not sure which doctor to see? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">
                  Ask our AI Health Assistant
                </span>
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Describe your symptoms in plain language. Our AI assistant analyzes clinical patterns to recommend suitable specialist care, immediate home triage, or prompt red-flag detection.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Immediate specialty and doctor recommendations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Red flag & emergency triage protocols</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Completely private, encrypted, and available 24/7</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAssistantClick}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-primary-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>{user ? "Open AI Health Assistant" : "Sign In to Consult Assistant"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  *Requires patient sign-in to ensure private & customized health assistance.
                </p>
              </div>
            </div>

            {/* Right Column: Live Interactive Demo Preview */}
            <div className="lg:col-span-7">
              <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Assistant Symptom Checker</h4>
                      <p className="text-[10px] text-emerald-400 font-medium">● Online & ready</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Interactive Demo</span>
                </div>

                {/* Prompt tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {assistantDemoPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDemoIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                        activeDemoIdx === idx
                          ? "bg-primary-600 text-white border-primary-500 shadow-xs"
                          : "bg-slate-700/60 text-slate-300 border-slate-600/60 hover:bg-slate-700"
                      }`}
                    >
                      Sample {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Chat Bubble - User */}
                <div className="flex justify-end">
                  <div className="bg-primary-600 text-white text-xs rounded-2xl rounded-tr-none px-4 py-3 max-w-md shadow-sm">
                    {assistantDemoPrompts[activeDemoIdx].q}
                  </div>
                </div>

                {/* Chat Bubble - Assistant */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-700/70 border border-slate-600/50 rounded-2xl rounded-tl-none p-4 text-xs text-slate-200 leading-relaxed max-w-lg space-y-3">
                    <p>{assistantDemoPrompts[activeDemoIdx].a}</p>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 font-medium">
                        Recommended: <strong className="text-cyan-300">{assistantDemoPrompts[activeDemoIdx].specialist}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSpec(assistantDemoPrompts[activeDemoIdx].specialist);
                          const el = document.getElementById("doctors");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-[10px] bg-primary-600 hover:bg-primary-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Find {assistantDemoPrompts[activeDemoIdx].specialist}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Simple 4-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              How MediBook Pro Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From choosing your specialist to completing your consultation — streamlined, fast, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Find Your Doctor",
                desc: "Search by specialty, location, or condition. Review credentials, fees, and patient reviews.",
                icon: Search,
              },
              {
                step: "02",
                title: "Choose Date & Slot",
                desc: "Pick an available date and 30-minute time slot that aligns perfectly with your schedule.",
                icon: Calendar,
              },
              {
                step: "03",
                title: "Instant Confirmation",
                desc: "Quickly sign in or register to lock in your appointment with zero booking fees.",
                icon: CheckCircle,
              },
              {
                step: "04",
                title: "Consult & Follow Up",
                desc: "Visit the clinic or chat directly with your doctor, receive prescriptions, and stay healthy.",
                icon: HeartPulse,
              },
            ].map((s, idx) => (
              <div key={idx} className="relative group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-card transition-all duration-200">
                <span className="text-3xl font-extrabold text-primary-200 group-hover:text-primary-400 transition-colors block mb-3">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">The MediBook Difference</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Why Patients Trust MediBook Pro
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              We eliminate healthcare guesswork with transparency, security, and verified clinical excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border border-slate-100 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rigorously Verified Doctors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every practitioner submits medical registration licenses, degrees, and clinic certifications verified manually by our medical administrators.
              </p>
            </div>

            <div className="card border border-slate-100 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Wait Time Appointments</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book guaranteed time slots with live doctor schedule synchronization. Say goodbye to standing in crowded hospital queues.
              </p>
            </div>

            <div className="card border border-slate-100 p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Encrypted Chat & Records</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access your medical appointment history, follow up with your doctor over real-time secure messaging, and keep health documents private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Patient Stories</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Loved by Patients Across the Country
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Rohan Deshmukh",
                location: "Mumbai",
                quote: "Finding an experienced cardiologist for my father was stressful until I used MediBook. We booked Dr. Sharma within 3 minutes and received outstanding care.",
                stars: 5,
              },
              {
                name: "Meera Krishnan",
                location: "Bengaluru",
                quote: "The AI health assistant helped me determine I needed a dermatologist rather than a general physician. Dr. Priya's treatment plan cleared my rash in a week!",
                stars: 5,
              },
              {
                name: "Amitabh Banerjee",
                location: "Kolkata",
                quote: "I love being able to see all doctor credentials and fees upfront before making an appointment. No surprises, smooth confirmation, and top notch service.",
                stars: 5,
              },
            ].map((t, idx) => (
              <div key={idx} className="card border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <span className="text-[10px] text-slate-400">{t.location}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded">
                    Verified Patient
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Take Control of Your Health Today
          </h2>
          <p className="text-primary-100 text-sm max-w-xl mx-auto">
            Join thousands of patients who book verified doctor consultations with total peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { const el = document.getElementById("doctors"); el?.scrollIntoView({ behavior: "smooth" }); }}
              className="btn-secondary !bg-white !text-primary-700 hover:!bg-primary-50 font-bold text-xs py-3 px-6 shadow-md"
            >
              Book an Appointment
            </button>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl border border-white/30 text-white text-xs font-bold hover:bg-white/10 transition-colors"
            >
              Are you a doctor? Join as Practitioner
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};

export default Home;
