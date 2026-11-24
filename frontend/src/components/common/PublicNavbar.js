import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, User, LogOut, LayoutDashboard, Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const PublicNavbar = ({ onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "doctor") return "/doctor/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/patient/dashboard";
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                  MediBook
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 tracking-wide uppercase">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Healthcare & Consultations</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollToSection("doctors")}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Find Doctors
            </button>
            <button
              onClick={() => scrollToSection("specialties")}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Specialties
            </button>
            <button
              onClick={() => scrollToSection("ai-assistant")}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Why MediBook
            </button>
          </nav>

          {/* Top-Side Auth & Profile Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm !py-2.5 !px-5 inline-flex items-center gap-2 shadow-sm shadow-primary-500/20"
                >
                  <span>Sign Up / Book</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors group"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <Link
                  to={getDashboardPath()}
                  className="btn-primary text-xs !py-2 !px-3.5 inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {!user ? (
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700"
              >
                Sign In
              </Link>
            ) : (
              <Link
                to={getDashboardPath()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-slide-up">
          <div className="space-y-1">
            <button
              onClick={() => scrollToSection("doctors")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Find Doctors
            </button>
            <button
              onClick={() => scrollToSection("specialties")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Medical Specialties
            </button>
            <button
              onClick={() => scrollToSection("ai-assistant")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>AI Health Assistant</span>
              <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">NEW</span>
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("why-us")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Why MediBook
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-sm py-2.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center text-sm py-2.5"
                >
                  Create Patient Account
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-center text-slate-400 hover:text-primary-600 pt-1"
                >
                  Are you a doctor? Join MediBook Pro
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-center text-sm py-2.5 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
