import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

const API = 'http://localhost:4000';

function AdminUsers(){
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function loadAdmins(){
    fetch(`${API}/api/auth/admins`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAdmins);
  }

  useEffect(() => { loadAdmins(); }, []);

  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch(`${API}/api/auth/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSuccess(`Admin "${data.username}" created.`);
    setForm({ username: "", email: "", password: "" });
    loadAdmins();
  }

  async function handleDelete(id){
    if (!confirm("Remove this admin account?")) return;
    await fetch(`${API}/api/auth/admins/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAdmins();
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
              placeholder="Password"
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
          {error && <p className="text-brand-red text-sm">{error}</p>}
          {success && <p className="text-brand-green text-sm">{success}</p>}
          <button type="submit" className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-deep text-brand-cream font-semibold px-5 py-2 rounded-sm transition-colors">
            <UserPlus size={18}/>
            Create Admin
          </button>
        </form>

        {/* Admin List with Responsive Text Wrapping & Shrink Protection */}
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a._id} className="flex justify-between items-start sm:items-center gap-3 bg-brand-paper border border-brand-green rounded p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{a.username}</p>
                <p className="opacity-70 text-xs sm:text-sm break-all">{a.email}</p>
              </div>
              <button 
                onClick={() => handleDelete(a._id)} 
                className="text-brand-red hover:text-brand-red-dark shrink-0 p-1"
                title="Delete Admin"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;