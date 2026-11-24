import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Filter, Star, MapPin, Clock, ChevronRight, Lock } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import PublicNavbar from "../../components/common/PublicNavbar";
import PublicFooter from "../../components/common/PublicFooter";
import AuthModal from "../../components/common/AuthModal";
import { doctorAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const specializations = [
  "All",
  "General Physician",
  "Dermatologist",
  "Cardiologist",
  "Orthopedic",
  "Pediatrician",
  "Neurologist",
  "Dentist",
  "Gynecologist",
  "Ophthalmologist",
  "Psychiatrist",
  "ENT Specialist",
];

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
  },
];

const FindDoctors = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");
  const [sort, setSort] = useState("");

  const isDashboard = Boolean(user && location.pathname.startsWith("/patient"));

  const fetchDoctors = () => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (spec !== "All") params.specialization = spec;
    if (sort) params.sort = sort;

    doctorAPI
      .getAll(params)
      .then(({ data }) => {
        if (data.data && data.data.length > 0) {
          setDoctors(data.data);
        } else {
          fallbackFilter(spec, search, sort);
        }
      })
      .catch(() => {
        fallbackFilter(spec, search, sort);
      })
      .finally(() => setLoading(false));
  };

  const fallbackFilter = (specFilter, searchTxt, sortOpt) => {
    let list = [...fallbackDoctorsList];
    if (specFilter !== "All") {
      list = list.filter((d) => d.specialization.toLowerCase() === specFilter.toLowerCase());
    }
    if (searchTxt) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTxt.toLowerCase()) ||
          d.specialization.toLowerCase().includes(searchTxt.toLowerCase())
      );
    }
    if (sortOpt === "fees_asc") list.sort((a, b) => a.fees - b.fees);
    else if (sortOpt === "fees_desc") list.sort((a, b) => b.fees - a.fees);
    else if (sortOpt === "experience") list.sort((a, b) => b.experience - a.experience);
    else list.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));

    setDoctors(list);
  };

  useEffect(() => {
    fetchDoctors();
  }, [spec, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const content = (
    <div>
      {/* Top Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find Certified Doctors</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore specialists, view profiles and schedules, and book your consultation
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input-field pl-10 text-sm"
            placeholder="Search doctors by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-44 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="rating">Top Rated</option>
          <option value="experience">Experience</option>
          <option value="fees_asc">Fees: Low to High</option>
          <option value="fees_desc">Fees: High to Low</option>
        </select>
        <button type="submit" className="btn-primary px-6 text-sm">
          Search
        </button>
      </form>

      {/* Specialization Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {specializations.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              spec === s
                ? "bg-primary-600 text-white border-primary-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 card">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">No doctors found</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search keywords</p>
          <button
            onClick={() => { setSpec("All"); setSearch(""); setSort(""); }}
            className="btn-primary text-xs mt-4 !py-2 !px-4"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <Link
              key={doctor._id}
              to={`/doctors/${doctor._id}`}
              className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4 mb-4">
                  {doctor.profilePhoto ? (
                    <img
                      src={doctor.profilePhoto}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                      {doctor.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-bold text-slate-900 truncate">Dr. {doctor.name}</h3>
                      <span className="text-emerald-500 text-xs font-bold">✓</span>
                    </div>
                    <p className="text-xs text-primary-600 font-semibold">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-700 font-bold">
                        {doctor.rating?.average?.toFixed(1) || "4.8"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({doctor.rating?.count || 40} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  {doctor.address?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">
                        {doctor.address.clinic ? `${doctor.address.clinic}, ` : ""}
                        {doctor.address.city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900 text-sm">
                  ₹{doctor.fees || 500}{" "}
                  <span className="text-[11px] font-normal text-slate-400">/ consult</span>
                </span>
                <span className="text-primary-600 text-xs font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  View Profile & Book <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  if (isDashboard) {
    return <DashboardLayout title="Find Doctors">{content}</DashboardLayout>;
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

export default FindDoctors;
