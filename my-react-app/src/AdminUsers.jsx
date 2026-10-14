import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import { useMe } from './useMe.js'

const ROLE_OPTIONS = [
  { value: "support", label: "Support: messages only" },
  { value: "editor", label: "Editor: products and messages" },
  { value: "owner", label: "Owner: full access" },
];

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Helper function to validate password requirements
function passwordProblem(password) {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  return null;
}

function AdminUsers(){
  const { token } = useAuth();
  const me = useMe();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "support" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Delete flow
  const [pendingDelete, setPendingDelete] = useState(null); // the admin waiting for confirmation
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text: "..." }

  function showNotice(type, text){
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  }

  function loadAdmins(){
    fetch(`${API}/api/auth/admins`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => setAdmins([]));
  }

  useEffect(() => { loadAdmins(); }, []);

  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setSuccess("");

    const problem = passwordProblem(form.password);
    if (problem) {
      setError(problem);
      return;
    }

    const res = await fetch(`${API}/api/auth/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || `Request failed (${res.status}).`);
      return;
    }
    setSuccess(`Admin "${data.username}" created successfully.`);
    setForm({ username: "", email: "", password: "", role: "support" });
    loadAdmins();
  }

  async function changeRole(admin, role){
    try {
      const res = await fetch(`${API}/api/auth/admins/${admin._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      showNotice("success", `${admin.username} is now ${role}.`);
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      loadAdmins();
    }
  }

  async function confirmDelete(){
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/auth/admins/${pendingDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status}).`);
      }
      showNotice("success", `Admin "${pendingDelete.username}" was deleted.`);
      loadAdmins();
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  if (me && me.role !== 'owner') {
    return (
      <div className="min-h-screen bg-brand-cream px-6 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-brand-red text-sm mb-4">Only owners can manage admin accounts.</p>
          <Link to="/admin" className="text-sm text-brand-green underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Admin Accounts</h1>
          
          <Link to="/admin" className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full">
            <LayoutDashboard size={16}/>
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-paper border border-brand-green rounded p-6 mb-8 space-y-3">
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            className="w-full border border-brand-green rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email (where login codes are sent)"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-brand-green rounded px-3 py-2 text-sm"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (at least 8 characters)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-brand-green rounded px-3 py-2 pr-10 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full border border-brand-green rounded px-3 py-2 text-sm bg-white"
          >
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {error && <p className="text-brand-red text-sm">{error}</p>}
          {success && <p className="text-brand-green text-sm">{success}</p>}
          <button type="submit" className="flex items-center gap-2 bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-5 py-2 rounded-sm transition-opacity">
            <UserPlus size={18}/>
            Create Admin
          </button>
        </form>

        {/* Result notice (disappears after 5 seconds) */}
        {notice && (
          <div
            className={`mb-4 flex items-start gap-2 p-3 rounded border text-sm ${
              notice.type === "success"
                ? "bg-brand-green/10 border-brand-green text-brand-green"
                : "bg-brand-red/10 border-brand-red text-brand-red"
            }`}
          >
            {notice.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0"/> : <AlertTriangle size={16} className="mt-0.5 shrink-0"/>}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Admin List */}
        <div className="space-y-2">
          {admins.map(a => {
            const isMe = me?.username === a.username;
            return (
              <div key={a._id} className="flex justify-between items-start sm:items-center gap-3 bg-brand-paper border border-brand-green rounded p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">
                    {a.username}
                    {isMe && <span className="font-normal opacity-60 text-xs"> (you)</span>}
                  </p>
                  <p className="opacity-70 text-xs sm:text-sm break-all">{a.email}</p>
                  <select
                    value={a.role || "support"}
                    onChange={e => changeRole(a, e.target.value)}
                    disabled={isMe}
                    title={isMe ? "You cannot change your own role" : "Change role"}
                    className="mt-1 border border-brand-green/40 rounded px-2 py-1 text-xs bg-white disabled:opacity-60"
                  >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button 
                  onClick={() => setPendingDelete(a)} 
                  className="text-brand-red hover:text-brand-red-dark shrink-0 p-1"
                  title="Delete Admin"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation popup */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-brand-paper border border-brand-green rounded-lg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-brand-red"/>
              <h2 className="font-display font-semibold text-lg">Delete admin account?</h2>
            </div>
            <p className="text-sm mb-1">
              You are about to delete <strong>{pendingDelete.username}</strong>
            </p>
            <p className="text-xs opacity-70 break-all mb-4">{pendingDelete.email}</p>
            <p className="text-sm text-brand-red mb-5">This cannot be undone. This person will no longer be able to log in.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-brand-green rounded text-brand-green hover:bg-brand-green/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-red text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Trash2 size={16}/>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;