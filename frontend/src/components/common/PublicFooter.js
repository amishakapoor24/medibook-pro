import { Link } from "react-router-dom";
import { Stethoscope, HeartPulse, PhoneCall, ShieldCheck, Mail, MapPin } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Alert Banner */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-red-950/50 border border-red-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-200">Experiencing a medical emergency?</p>
              <p className="text-xs text-red-300/80">
                MediBook Pro is for scheduled appointments. For immediate emergencies, please call emergency services right away.
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-lg shadow-red-900/40"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Emergency Hotline: 108 / 112
          </a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MediBook Pro</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering patients and certified doctors with effortless scheduling, verified medical profiles, and next-generation AI health assistance.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Certified Doctors
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                Encrypted Records
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Patient Portal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/#doctors" className="hover:text-primary-400 transition-colors">Find a Doctor</Link></li>
              <li><Link to="/#specialties" className="hover:text-primary-400 transition-colors">Browse Specialties</Link></li>
              <li><Link to="/#ai-assistant" className="hover:text-primary-400 transition-colors">AI Health Assistant</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Patient Sign In</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Create Patient Account</Link></li>
            </ul>
          </div>

          {/* Doctors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">For Practitioners</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Join as a Doctor</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Doctor Portal Login</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-primary-400 transition-colors">Verification Process</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Admin Access</Link></li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Support & Contact</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="truncate">support@medibook.pro</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 1800 200 4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Healthcare Tech Hub, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediBook Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">HIPAA & Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
