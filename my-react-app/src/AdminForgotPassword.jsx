import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Key, Eye, EyeOff } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function AdminForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function post(path, body) {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
    return data;
  }

  async function requestCode(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      await post("forgot-password", { username });
      setInfo("If that username belongs to an admin account, a 6-digit code was sent to its email. Check your inbox and spam folder. The code expires in 10 minutes.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError(""); setInfo("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await post("reset-password", { username, code, newPassword });
      setInfo("Password updated! Redirecting to login...");
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-brand-green/40 rounded focus:outline-none focus:border-brand-green text-sm";
  const buttonClass = "w-full mt-2 flex items-center justify-center gap-2 bg-brand-green text-white font-medium py-2.5 px-4 rounded hover:opacity-90 transition-colors disabled:opacity-50";

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Forgot Password</h1>
          <Link
              to="/admin/login"
              className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
            >
              <LogIn size={16} />
               Back to login
          </Link>
        </div>

        <div className="bg-brand-paper border border-brand-green rounded-lg p-6 shadow-sm">
          {error && <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded">{error}</div>}
          {info && <div className="mb-4 p-3 bg-brand-green/10 border border-brand-green text-brand-green text-sm rounded">{info}</div>}

          {step === 1 ? (
            <form onSubmit={requestCode} className="space-y-4">
              <p className="text-sm text-brand-ink/70">
                Enter your username. We will email a 6-digit reset code to the address on your admin account.
              </p>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={inputClass}
              />
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? "Sending..." : "Send reset code"}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className={inputClass}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green/70 hover:text-brand-green"
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
              <button type="submit" disabled={loading} className={buttonClass}>
                <Key size={18} />
                {loading ? "Updating..." : "Reset password"}
              </button>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setInfo("");
                  }}
                  className="group inline-flex items-center gap-1.5 text-sm text-brand-green font-medium"
                >
                  <LogIn size={16} />
                  <span className="relative">
                    Wrong username or no email? Go back
                    <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                  </span>
                </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;