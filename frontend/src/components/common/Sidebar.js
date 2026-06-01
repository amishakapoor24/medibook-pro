import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Calendar, Users, UserCheck, Settings,
  LogOut, Stethoscope, Bell, MessageSquare, ClipboardList, Shield,
} from "lucide-react";

const patientLinks = [
  { to: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patient/doctors", icon: Stethoscope, label: "Find Doctors" },
  { to: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { to: "/patient/chat", icon: MessageSquare, label: "Messages" },
  { to: "/patient/profile", icon: Settings, label: "Profile" },
];

const doctorLinks = [
  { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: Calendar, label: "Appointments" },
  { to: "/doctor/patients", icon: Users, label: "Patients" },
  { to: "/doctor/chat", icon: MessageSquare, label: "Messages" },
  { to: "/doctor/profile", icon: Settings, label: "Profile" },
];

const adminLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/doctors", icon: UserCheck, label: "Doctors" },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/appointments", icon: ClipboardList, label: "Appointments" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === "patient" ? patientLinks : user?.role === "doctor" ? doctorLinks : adminLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-none">MediBook</h1>
            <p className="text-xs text-slate-400 mt-0.5">Pro</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-100" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role === "patient" ? "Patient" : user?.role === "doctor" ? `Dr. • ${user?.specialization || "Doctor"}` : "Administrator"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>

        {user?.role === "admin" && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">System</p>
            <NavLink to="/admin/verification" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Shield className="w-4 h-4" />
              Verification Queue
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
