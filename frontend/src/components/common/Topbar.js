import { useState } from "react";
import { Bell, X, Menu } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { formatDistanceToNow } from "date-fns";

const Topbar = ({ title, setSidebarOpen }) => {
  const { notifications, clearNotification } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.length;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen && setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unread > 0 && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{unread} new</span>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No new notifications</div>
              ) : (
                notifications.map((notif, i) => (
                  <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3 group">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.type === "appointment" ? "bg-primary-500" : notif.type === "chat" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : "Just now"}</p>
                    </div>
                    <button onClick={() => clearNotification(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 transition-all">
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
