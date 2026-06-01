import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/common/DashboardLayout";
import { doctorAPI } from "../../services/api";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Camera, Save } from "lucide-react";

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth?.slice(0, 10) || "",
    gender: user?.gender || "",
    bloodGroup: user?.bloodGroup || "",
    address: {
      city: user?.address?.city || "",
      state: user?.address?.state || "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.getMe();
      updateUser(form);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      toast.success("Photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Photo Section */}
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
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">Personal Information</h3>
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
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Date of Birth</label>
                <input type="date" className="input-field" value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Gender</label>
                <select className="input-field" value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Blood Group</label>
                <select className="input-field" value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">City</label>
                <input type="text" className="input-field" value={form.address.city}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">State</label>
                <input type="text" className="input-field" value={form.address.state}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;