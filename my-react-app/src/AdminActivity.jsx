import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import { useMe } from './useMe.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const LABELS = {
  'login': 'Logged in',
  'login.failed': 'Failed login attempt',
  'password.change': 'Changed password',
  'password.reset': 'Reset password',
  'admin.create': 'Created admin account',
  'admin.delete': 'Deleted admin account',
  'admin.role': 'Changed admin role',
  'product.create': 'Added product',
  'product.update': 'Edited product',
  'product.delete': 'Deleted product',
  'product.reorder': 'Reordered products',
  'message.read': 'Marked message as read',
  'message.delete': 'Deleted message',
};

function AdminActivity(){
  const { token } = useAuth();
  const me = useMe();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadLogs(){
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/activity?limit=150`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(); }, []);

  const backLink = (
    <Link
      to="/admin"
      className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
    >
      <LayoutDashboard size={16}/>
      Back to dashboard
    </Link>
  );

  if (me && me.role !== 'owner') {
    return (
      <div className="min-h-screen bg-brand-cream px-6 py-10">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display font-semibold text-2xl">Activity Log</h1>
            {backLink}
          </div>
          <p className="text-brand-red text-sm">Only owners can view the activity log.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Activity Log</h1>
          {backLink}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs opacity-70">Showing the latest {logs.length} actions. Entries are kept for 1 year.</p>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-green bg-brand-green/10 hover:bg-brand-green hover:text-white px-2.5 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
            Refresh
          </button>
        </div>

        {error && <p className="text-brand-red text-sm mb-4">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <div className="bg-brand-paper border border-brand-green/30 rounded-lg p-10 text-center text-brand-green/70">
            No activity recorded yet.
          </div>
        )}

        <div className="space-y-2">
          {logs.map(l => (
            <div
              key={l._id}
              className={`bg-brand-paper border rounded p-3 text-sm ${l.action === 'login.failed' ? "border-brand-red" : "border-brand-green"}`}
            >
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                <p className="font-semibold">
                  {l.username || "Unknown"}
                  <span className="font-normal opacity-60 text-xs"> ({l.role || "no role"})</span>
                </p>
                <p className="text-xs opacity-60">{new Date(l.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-1">
                {LABELS[l.action] || l.action}
                {l.target ? <strong>: {l.target}</strong> : null}
              </p>
              {l.details && <p className="text-xs opacity-70 mt-0.5 break-all">{l.details}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminActivity;