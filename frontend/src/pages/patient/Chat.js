import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { chatAPI, appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { format } from "date-fns";
import toast from "react-hot-toast";

const Chat = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [msgsRes, apptRes] = await Promise.all([
          chatAPI.getMessages(appointmentId),
          appointmentAPI.getById(appointmentId),
        ]);
        setMessages(msgsRes.data.data);
        setAppointment(apptRes.data.data);
      } catch { toast.error("Failed to load chat"); }
      finally { setLoading(false); }
    };
    load();
  }, [appointmentId]);

  useEffect(() => {
    if (socket) {
      socket.emit("join_chat", appointmentId);
      socket.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
      return () => socket.off("receive_message");
    }
  }, [socket, appointmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await chatAPI.sendMessage(appointmentId, { message: text });
      socket?.emit("send_message", { appointmentId, ...data.data });
      setMessages((prev) => [...prev, data.data]);
      setText("");
    } catch { toast.error("Failed to send message"); }
  };

  const other = user?.role === "patient" ? appointment?.doctor : appointment?.patient;

  return (
    <DashboardLayout title="Chat">
      <div className="max-w-3xl mx-auto">
        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-white">
            {other?.profilePhoto ? (
              <img src={other.profilePhoto} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {other?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 text-sm">{user?.role === "patient" ? `Dr. ${other?.name}` : other?.name}</p>
              <p className="text-xs text-emerald-500 font-medium">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No messages yet</p>
                <p className="text-slate-400 text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary-600 text-white rounded-br-md" : "bg-white text-slate-800 border border-slate-100 rounded-bl-md shadow-sm"}`}>
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-primary-200" : "text-slate-400"}`}>
                        {msg.createdAt ? format(new Date(msg.createdAt), "hh:mm a") : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-100 bg-white flex items-center gap-3">
            <input type="text" className="input-field flex-1 py-2.5"
              placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" disabled={!text.trim()} className="btn-primary p-2.5 aspect-square flex items-center justify-center disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
