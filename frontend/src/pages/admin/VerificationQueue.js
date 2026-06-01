import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

const VerificationQueue = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    adminAPI.getAllDoctors().then(({ data }) => setDoctors(data.data)).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      setDoctors((prev) => prev.map((d) => d._id === id ? { ...d, verificationStatus: "approved" } : d));
      setSelected(null);
      toast.success("Doctor approved & email sent!");
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await adminAPI.rejectDoctor(id, { reason });
      setDoctors((prev) => prev.map((d) => d._id === id ? { ...d, verificationStatus: "rejected" } : d));
      setSelected(null);
      toast.success("Doctor rejected & email sent");
    } catch { toast.error("Failed to reject"); }
  };

  const filtered = doctors.filter((d) => filter === "all" ? true : d.verificationStatus === filter);

  return (
    <DashboardLayout title="Doctor Verification Queue">
      <div className="flex gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize border transition-all ${filter === f ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-16 card">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No doctors found</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc._id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                {doc.profilePhoto ? (
                  <img src={doc.profilePhoto} alt={doc.name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {doc.name?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-800">Dr. {doc.name}</h3>
                    <span className={`badge-${doc.verificationStatus === "approved" ? "confirmed" : doc.verificationStatus === "rejected" ? "rejected" : "pending"}`}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-sm text-primary-600 font-medium">{doc.specialization}</p>
                  <p className="text-xs text-slate-400">{doc.email} • {doc.experience} yrs experience</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setSelected(doc)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                    {doc.verificationStatus === "pending" && (
                      <>
                        <button onClick={() => handleApprove(doc._id)} className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleReject(doc._id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-5">
              {selected.profilePhoto ? (
                <img src={selected.profilePhoto} alt={selected.name} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                  {selected.name?.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-800">Dr. {selected.name}</h2>
                <p className="text-primary-600 font-medium">{selected.specialization}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[["Email", selected.email], ["Phone", selected.phone], ["Experience", `${selected.experience} years`], ["Fees", `₹${selected.fees}`], ["City", selected.address?.city]].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value || "—"}</span>
                </div>
              ))}
              {selected.qualifications?.length > 0 && (
                <div className="py-2">
                  <p className="text-slate-500 mb-2">Qualifications</p>
                  {selected.qualifications.map((q, i) => (
                    <p key={i} className="font-medium text-slate-800 text-xs">{q.degree} — {q.institute} ({q.year})</p>
                  ))}
                </div>
              )}
              {selected.documents?.medicalLicense && (
                <a href={selected.documents.medicalLicense} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                  <FileText className="w-4 h-4" /> View Medical License
                </a>
              )}
            </div>
            {selected.verificationStatus === "pending" && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleApprove(selected._id)} className="btn-success flex-1">Approve Doctor</button>
                <button onClick={() => handleReject(selected._id)} className="btn-danger flex-1">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VerificationQueue;
