import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bot, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/common/DashboardLayout";
import { assistantAPI } from "../../services/api";

const prompts = [
  "What is paracetamol used for?",
  "First aid for a minor burn",
  "What are common side effects of cetirizine?",
  "How do I book an appointment?",
];

const Assistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const history = nextMessages.map((message) => ({
      role: message.role,
      content: message.role === "assistant" && message.reply?.type === "emergency"
        ? "(Emergency instructions were shown.)"
        : message.role === "assistant" ? message.reply?.answer || message.content : message.content,
    }));

    try {
      const { data } = await assistantAPI.chat(history.slice(-8));
      const reply = data.data;
      setMessages((current) => [...current, {
        role: "assistant",
        content: reply.type === "emergency" ? "(Emergency instructions were shown.)" : reply.answer,
        reply,
      }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  return (
    <DashboardLayout title="Health Assistant">
      <div className="max-w-4xl mx-auto space-y-5">
        <section className="card bg-gradient-to-br from-primary-50 via-white to-cyan-50 border-primary-100">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg text-slate-800">Ask about medicines, symptoms, first aid or how to use MediBook.</h2>
              <p className="text-sm text-slate-500 mt-1">
                I give general information, not a diagnosis. In an emergency call {" "}
                <a href="tel:112" className="font-semibold text-red-600 hover:text-red-700">112 right away.</a>
              </p>
            </div>
          </div>
        </section>

        <section className="card p-4 sm:p-6">
          <div className="max-h-[55vh] min-h-[220px] overflow-y-auto space-y-4" aria-live="polite">
            {messages.length === 0 ? (
              <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
                <Bot className="w-10 h-10 text-primary-200 mb-3" />
                <p className="text-sm font-semibold text-slate-600">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {prompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => send(prompt)} className="btn-secondary text-sm px-3 py-2">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "user" ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-600 text-white px-4 py-3 text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  ) : (
                    <AssistantReply reply={message.reply} />
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-500 animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <textarea
              aria-label="Your question"
              maxLength={600}
              rows={2}
              className="input-field resize-none"
              placeholder="Ask a health question..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center justify-between gap-3 mt-3">
              {messages.length > 0 && (
                <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={() => setMessages([])}>
                  <Trash2 className="w-4 h-4 inline-block mr-1.5" />
                  Clear
                </button>
              )}
              <button type="button" className="btn-primary ml-auto flex items-center gap-2" disabled={loading || !input.trim()} onClick={() => send(input)}>
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const AssistantReply = ({ reply }) => {
  if (reply?.type === "emergency") {
    return (
      <div role="alert" className="max-w-[92%] bg-red-50 border border-red-200 rounded-2xl rounded-bl-md p-4 text-sm text-red-900">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertTriangle className="w-5 h-5" />
          {reply.title}
        </div>
        <ol className="list-decimal pl-5 mt-3 space-y-2">
          {reply.steps?.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <div className="flex flex-wrap gap-2 mt-4">
          {reply.numbers?.map(({ number, label }) => (
            <a key={number} href={`tel:${number}`} className="btn-danger text-xs px-3 py-2">
              Call {number} <span className="font-normal opacity-90">{label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[92%] bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md p-4 text-sm text-slate-700">
      <p className="whitespace-pre-wrap">{reply?.answer}</p>
      <div className="flex items-center gap-2 mt-3">
        {reply?.urgency === "routine" ? <span className="badge-confirmed">Routine</span> : <span className="badge-pending">See a doctor soon</span>}
      </div>
      {reply?.doseNote && <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3">{reply.doseNote}</div>}
      {reply?.suggestion && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="font-semibold text-slate-700">A {reply.suggestion.specialization} can help</p>
          {reply.suggestion.doctors?.length ? (
            <div className="space-y-2 mt-2">
              {reply.suggestion.doctors.map((doctor) => (
                <Link key={doctor._id} to={`/patient/doctors/${doctor._id}`} className="block rounded-lg bg-slate-50 hover:bg-primary-50 px-3 py-2 transition-colors">
                  <span className="font-medium text-primary-700">Dr. {doctor.name}</span>
                  <span className="block text-xs text-slate-500">{doctor.experience} yrs · ₹{doctor.fees}</span>
                </Link>
              ))}
            </div>
          ) : (
            <Link to="/patient/doctors" className="inline-block mt-2 text-primary-600 font-medium hover:text-primary-700">Browse doctors</Link>
          )}
        </div>
      )}
      <p className="text-xs text-slate-400 mt-4">{reply?.disclaimer}</p>
    </div>
  );
};

export default Assistant;