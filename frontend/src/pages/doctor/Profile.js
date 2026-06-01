import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/common/DashboardLayout";
import { doctorAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Camera, Save, Plus, Trash2, Upload } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const specializations = ["General Physician","Dermatologist","Cardiologist","Orthopedic","Pediatrician","Neurologist","Dentist","Gynecologist","Ophthalmologist","Psychiatrist","ENT Specialist","Other"];

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
    experience: user?.experience || "",
    fees: user?.fees || "",
    bio: user?.bio || "",
    availableDays: user?.availableDays || [],
    address: {
      clinic: user?.address?.clinic || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
    },
    qualifications: user?.qualifications || [],
    timeSlots: user?.timeSlots || [],
  });
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const addQualification = () => {
    setForm((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: "", institute: "", year: "" }],
    }));
  };

  const removeQualification = (i) => {
    setForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, idx) => idx !== i),
    }));
  };

  const addTimeSlot = () => {
    setForm((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { start: "09:00", end: "10:00" }],
    }));
  };

  const removeTimeSlot = (i) => {
    setForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, idx) => idx !== i),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await doctorAPI.updateProfile(form);
      updateUser(data.data);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocLoading(true);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);
      await doctorAPI.uploadDocument(formData);
      toast.success("Document uploaded successfully!");
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Verification Status */}
        {user?.verificationStatus === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-amber-700 text-sm font-medium">Your profile is under admin review. You'll be notified once approved.</p>
          </div>
        )}
        {user?.verificationStatus === "approved" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-emerald-700 text-sm font-medium">✓ Your profile is verified and visible to patients.</p>
          </div>
        )}

        {/* Photo */}
        <div className="card flex items-center gap-6">
          <div className="relative">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("photo", file);
                  try {
                    const { data } = await doctorAPI.uploadPhoto(formData);
                    updateUser({ profilePhoto: data.data.profilePhoto });
                    toast.success("Photo updated!");
                  } catch { toast.error("Failed to upload photo"); }
                }} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Dr. {user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-sm text-primary-600 font-medium mt-0.5">{user?.specialization}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">Basic Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                <input type="text" className="input-field" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone</label>
                <input type="tel" className="input-field" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Specialization</label>
                <select className="input-field" value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Experience (years)</label>
                <input type="number" className="input-field" value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Consultation Fees (₹)</label>
                <input type="number" className="input-field" value={form.fees}
                  onChange={(e) => setForm({ ...form, fees: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">City</label>
                <input type="text" className="input-field" value={form.address.city}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Clinic Name</label>
                <input type="text" className="input-field" value={form.address.clinic}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, clinic: e.target.value } })} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Bio</label>
                <textarea className="input-field resize-none" rows={3} value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell patients about yourself..." />
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Available Days</label>
              <div className="flex gap-2 flex-wrap">
                {days.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.availableDays.includes(day) ? "bg-primary-600 text-white border-primary-600" : "border-slate-200 text-slate-600 hover:border-primary-300"}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Time Slots</label>
                <button type="button" onClick={addTimeSlot}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:text-primary-700">
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </button>
              </div>
              <div className="space-y-2">
                {form.timeSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" className="input-field" value={slot.start}
                      onChange={(e) => {
                        const updated = [...form.timeSlots];
                        updated[i].start = e.target.value;
                        setForm({ ...form, timeSlots: updated });
                      }} />
                    <span className="text-slate-400 text-sm">to</span>
                    <input type="time" className="input-field" value={slot.end}
                      onChange={(e) => {
                        const updated = [...form.timeSlots];
                        updated[i].end = e.target.value;
                        setForm({ ...form, timeSlots: updated });
                      }} />
                    <button type="button" onClick={() => removeTimeSlot(i)}
                      className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Qualifications</label>
                <button type="button" onClick={addQualification}
                  className="text-xs text-primary-600 flex items-center gap-1 hover:text-primary-700">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {form.qualifications.map((q, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 items-center">
                    <input type="text" className="input-field" placeholder="Degree (e.g. MBBS)"
                      value={q.degree} onChange={(e) => {
                        const updated = [...form.qualifications];
                        updated[i].degree = e.target.value;
                        setForm({ ...form, qualifications: updated });
                      }} />
                    <input type="text" className="input-field" placeholder="Institute"
                      value={q.institute} onChange={(e) => {
                        const updated = [...form.qualifications];
                        updated[i].institute = e.target.value;
                        setForm({ ...form, qualifications: updated });
                      }} />
                    <div className="flex gap-2">
                      <input type="number" className="input-field" placeholder="Year"
                        value={q.year} onChange={(e) => {
                          const updated = [...form.qualifications];
                          updated[i].year = e.target.value;
                          setForm({ ...form, qualifications: updated });
                        }} />
                      <button type="button" onClick={() => removeQualification(i)}
                        className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Documents Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">Verification Documents</h3>
          <div className="space-y-4">
            {[
              { key: "idProof", label: "ID Proof", desc: "Aadhar, PAN, Passport" },
              { key: "medicalLicense", label: "Medical License", desc: "Valid medical registration" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2 px-3 py-2">
                  <Upload className="w-4 h-4" />
                  {docLoading ? "Uploading..." : "Upload"}
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleDocumentUpload(e, key)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;