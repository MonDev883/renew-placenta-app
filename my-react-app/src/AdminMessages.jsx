import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Mail, MailOpen, Trash2, Send } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function AdminMessages(){
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);

  function loadMessages(){
    fetch(`${API}/api/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setMessages);
  }

  useEffect(() => { loadMessages(); }, []);

  async function markRead(id){
    await fetch(`${API}/api/admin/messages/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadMessages();
  }

  async function handleDelete(id){
    if (!confirm("Delete this message?")) return;
    await fetch(`${API}/api/admin/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadMessages();
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Navigation */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Contact Messages</h1>
          <Link
            to="/admin"
            className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
          >
            <LayoutDashboard size={16}/>
            Back to dashboard
          </Link>
        </div>

        {/* Empty State Banner */}
        {messages.length === 0 && (
          <div className="bg-brand-paper border border-brand-green/30 rounded-lg p-10 text-center text-brand-green/70">
            <Mail className="mx-auto mb-3 opacity-50" size={28} />
            <p className="font-medium">No contact messages received yet.</p>
            <p className="text-xs opacity-70 mt-1">Customer inquiries from the public site will appear here.</p>
          </div>
        )}

        {/* Message List */}
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m._id} className={`border rounded p-4 ${m.read ? "bg-brand-paper border-brand-line" : "bg-white border-brand-green"}`}>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name} 
                    {/* Responsive email drop for small mobile screens */}
                    <span className="font-normal opacity-60 text-sm block sm:inline"> — {m.email}</span>
                  </p>
                  <p className="text-xs opacity-60">{new Date(m.createdAt).toLocaleString()}</p>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent("Re: Inquiry regarding Renew Placenta")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Reply via Gmail"
                    className="flex items-center gap-1 text-xs font-medium text-brand-green bg-brand-green/10 hover:bg-brand-green hover:text-white px-2.5 py-1.5 rounded transition-colors"
                  >
                    <Send size={14} />
                    Reply
                  </a>

                  {!m.read && (
                    <button onClick={() => markRead(m._id)} title="Mark as read" className="text-brand-green hover:text-brand-green-deep p-1">
                      <MailOpen size={18}/>
                    </button>
                  )}
                  {m.read && <Mail size={18} className="opacity-30 p-1"/>}
                  
                  <button onClick={() => handleDelete(m._id)} title="Delete" className="text-brand-red hover:text-brand-red-dark p-1">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-brand-ink">{m.message}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminMessages;