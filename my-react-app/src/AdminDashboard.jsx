import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, LogOut, Globe, TrendingUp, Mail, Users, Key, ClipboardList, X } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import { useMe } from './useMe.js'
import renewLogo from './assets/renew-logo-v2.png'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const ROLE_LABELS = {
  owner: "Owner",
  editor: "Editor",
  support: "Support",
};

function AdminDashboard(){
  const { token, logout } = useAuth();
  const me = useMe();
  const role = me?.role;

    const [showReminder, setShowReminder] = useState(false);

  // Decide whether to show the reminder (once per login session)
  useEffect(() => {
    if (!me?.needsPasswordChange || !token) return;
    const key = `pwReminderShown:${token.slice(-12)}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setShowReminder(true);
  }, [me, token]);

  // Hide it automatically after 8 seconds
  useEffect(() => {
    if (!showReminder) return;
    const timer = setTimeout(() => setShowReminder(false), 8000);
    return () => clearTimeout(timer);
  }, [showReminder]);
  const [username, setUsername] = useState("");
  const [productCount, setProductCount] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch admin greeting / username
    fetch(`${API}/api/admin/ping`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const match = data.message?.match(/Hello, (.+)\. You are logged in\./);
        setUsername(match ? match[1] : "");
      })
      .catch(() => setUsername(""));

    // Fetch product count
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(data => setProductCount(data.length))
      .catch(() => setProductCount(null));

    // Fetch unread messages count for the notification badge
    fetch(`${API}/api/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unread = data.filter(m => !m.read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => setUnreadCount(0));
  }, [token]);

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10 flex flex-col justify-between">
      {/* Self-contained smooth entry animation keyframes */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-dash-1 { animation: fadeInSlide 0.4s ease-out 0.05s forwards; opacity: 0; }
        .animate-dash-2 { animation: fadeInSlide 0.4s ease-out 0.1s forwards; opacity: 0; }
        .animate-dash-3 { animation: fadeInSlide 0.4s ease-out 0.15s forwards; opacity: 0; }
        .animate-dash-4 { animation: fadeInSlide 0.4s ease-out 0.2s forwards; opacity: 0; }
      `}</style>

              {showReminder && (
        <div
          role="alert"
          className="animate-dash-1 fixed top-5 inset-x-0 mx-auto z-50 w-[calc(100%-2rem)] max-w-md bg-brand-paper border border-brand-red rounded shadow-lg p-4 flex items-start gap-3"
        >
          <Key size={18} className="text-brand-red mt-0.5 shrink-0"/>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-brand-red">Please change your password</p>
            <p className="mt-0.5">You are still using the password you were given. For your security, set your own password now.</p>
            <Link to="/admin/change-password" className="inline-block mt-2 font-semibold text-brand-green underline">
              Change password
            </Link>
          </div>
          <button
            onClick={() => setShowReminder(false)}
            aria-label="Close"
            className="text-brand-ink/60 hover:text-brand-red"
          >
            <X size={16}/>
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8 animate-dash-1">
          <img src={renewLogo} alt="Renew Placenta Herbal Beauty Products" className="h-14 sm:h-20 md:h-24 w-auto"/>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-red font-semibold">
              Admin Panel{role ? ` · ${ROLE_LABELS[role] || role}` : ""}
            </p>
            <h1 className="font-display font-semibold text-xl">{username ? `Welcome, ${username}` : "Welcome"}</h1>
          </div>
        </div>

        <div className="bg-brand-paper border border-brand-green rounded p-5 mb-6 flex items-center gap-4 animate-dash-2">
          <div className="w-11 h-11 rounded-full bg-brand-green flex items-center justify-center shrink-0">
            <TrendingUp className="text-white" size={20}/>
          </div>
          <div>
            <p className="text-sm opacity-70">Total products in catalog</p>
            <p className="font-display font-semibold text-2xl">{productCount ?? "—"}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 animate-dash-3">
          {/* Owner only: Admin Accounts */}
          {role === 'owner' && (
            <Link
              to="/admin/users"
              className="group bg-brand-paper border border-brand-green rounded p-5 flex items-center gap-4 hover:bg-brand-green hover:text-brand-cream transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-brand-green group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                <Users className="text-white group-hover:text-brand-green transition-colors" size={20}/>
              </div>
              <div>
                <p className="font-semibold">Admin Accounts</p>
                <p className="text-sm opacity-70 group-hover:opacity-90">Add, remove, set roles</p>
              </div>
            </Link>
          )}

          {/* Owner only: Activity Log */}
          {role === 'owner' && (
            <Link
              to="/admin/activity"
              className="group bg-brand-paper border border-brand-green rounded p-5 flex items-center gap-4 hover:bg-brand-green hover:text-brand-cream transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-brand-green group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                <ClipboardList className="text-white group-hover:text-brand-green transition-colors" size={20}/>
              </div>
              <div>
                <p className="font-semibold">Activity Log</p>
                <p className="text-sm opacity-70 group-hover:opacity-90">Who changed what</p>
              </div>
            </Link>
          )}

          {/* Messages Card with Live Notification Badge (all roles) */}
          <Link
            to="/admin/messages"
            className="group relative bg-brand-paper border border-brand-green rounded p-5 flex items-center gap-4 hover:bg-brand-green hover:text-brand-cream transition-colors"
          >
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
            <div className="w-11 h-11 rounded-full bg-brand-green group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
              <Mail className="text-white group-hover:text-brand-green transition-colors" size={20}/>
            </div>
            <div>
              <p className="font-semibold">Messages</p>
              <p className="text-sm opacity-70 group-hover:opacity-90">View contact submissions</p>
            </div>
          </Link>

          {/* Owner and editor: Manage Products */}
          {(role === 'owner' || role === 'editor') && (
            <Link
              to="/admin/products"
              className="group bg-brand-paper border border-brand-green rounded p-5 flex items-center gap-4 hover:bg-brand-green hover:text-brand-cream transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-brand-green group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
                <Package className="text-white group-hover:text-brand-green transition-colors" size={20}/>
              </div>
              <div>
                <p className="font-semibold">Manage Products</p>
                <p className="text-sm opacity-70 group-hover:opacity-90">Add, edit, reorder, delete</p>
              </div>
            </Link>
          )}

          {/* Everyone: View Public Site */}
          <a
            href="/"
            className="group bg-brand-paper border border-brand-green rounded p-5 flex items-center gap-4 hover:bg-brand-green hover:text-brand-cream transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-brand-green group-hover:bg-white flex items-center justify-center shrink-0 transition-colors">
              <Globe className="text-white group-hover:text-brand-green transition-colors" size={20}/>
            </div>
            <div>
              <p className="font-semibold">View Public Site</p>
              <p className="text-sm opacity-70 group-hover:opacity-90">See the live website</p>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-5 mt-4 animate-dash-4">
          <Link 
            to="/admin/change-password" 
            className="group relative inline-flex items-center gap-1.5 text-sm text-brand-green font-medium"
          >
            <Key size={16} className="text-brand-green" />
            <span className="relative">
              Change Password
              <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-brand-red hover:text-brand-red-dark font-semibold"
          >
            <LogOut size={16}/>
            Log Out
          </button>
        </div>
      </div>

      {/* Support Footer */}
      <footer className="mt-12 text-center text-xs opacity-60 animate-dash-4">
        For technical support or updates, contact:{" "}
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=support@renewplacenta.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-brand-green"
        >
          support@renewplacenta.com
        </a>
      </footer>
    </div>
  );
}

export default AdminDashboard;