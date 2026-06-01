import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, MapPin, Clock, ChevronRight } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { doctorAPI } from "../../services/api";

const specializations = ["All", "General Physician", "Dermatologist", "Cardiologist", "Orthopedic", "Pediatrician", "Neurologist", "Dentist", "Gynecologist", "Ophthalmologist", "Psychiatrist", "ENT Specialist"];

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");
  const [sort, setSort] = useState("");

  const fetchDoctors = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (spec !== "All") params.specialization = spec;
    if (sort) params.sort = sort;
    doctorAPI.getAll(params).then(({ data }) => setDoctors(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, [spec, sort]);

  const handleSearch = (e) => { e.preventDefault(); fetchDoctors(); };

  return (
    <DashboardLayout title="Find Doctors">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" className="input-field pl-10" placeholder="Search doctors by name..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-44" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="rating">Top Rated</option>
          <option value="experience">Experience</option>
          <option value="fees_asc">Fees: Low to High</option>
          <option value="fees_desc">Fees: High to Low</option>
        </select>
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Specialization Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {specializations.map((s) => (
          <button key={s} onClick={() => setSpec(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${spec === s ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4 mb-4">
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
          <p className="text-slate-500 font-medium">No doctors found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Link key={doctor._id} to={`/patient/doctors/${doctor._id}`}
              className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex gap-4 mb-4">
                {doctor.profilePhoto ? (
                  <img src={doctor.profilePhoto} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                    {doctor.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-semibold text-slate-800 truncate">Dr. {doctor.name}</h3>
                    <span className="text-emerald-500 text-xs font-medium">✓</span>
                  </div>
                  <p className="text-sm text-primary-600 font-medium">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-600 font-medium">{doctor.rating?.average?.toFixed(1) || "New"}</span>
                    <span className="text-xs text-slate-400">({doctor.rating?.count || 0} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.experience} years experience</span>
                </div>
                {doctor.address?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.address.city}, {doctor.address.state}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-semibold text-slate-800">₹{doctor.fees} <span className="text-xs font-normal text-slate-400">/ consultation</span></span>
                <span className="text-primary-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Book Now <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FindDoctors;
