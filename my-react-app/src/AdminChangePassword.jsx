import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Key, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'

const API = 'http://localhost:4000';

function AdminChangePassword() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => {
        logout();
        navigate('/admin/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Change Password</h1>
          <Link
            to="/admin"
            className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
          >
            <LayoutDashboard size={16}/>
            Back to dashboard
          </Link>
        </div>

        <div className="bg-brand-paper border border-brand-green rounded-lg p-6 shadow-sm">
          {error && <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded">{error}</div>}
          {success && <div className="mb-4 p-3 bg-brand-green/10 border border-brand-green text-brand-green text-sm rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-brand-green/40 rounded focus:outline-none focus:border-brand-green text-sm"
              />
            </div>

            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-brand-green/40 rounded focus:outline-none focus:border-brand-green text-sm"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-brand-green/40 rounded focus:outline-none focus:border-brand-green text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green/70 hover:text-brand-green"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-green text-white font-medium py-2.5 px-4 rounded hover:opacity-90 transition-colors disabled:opacity-50"
            >
              <Key size={18} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminChangePassword;