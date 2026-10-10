import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import renewLogo from './assets/renew-logo-v2.png'

function Login(){
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpNotice, setOtpNotice] = useState(""); // ⏱️ Auto-disappearing notice state
  const { requestLogin, verifyOtp } = useAuth();
  const navigate = useNavigate();

  function checkCapsLock(e){
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  }

  async function handleCredentials(e){
    e.preventDefault();
    setError("");
    try {
      const result = await requestLogin(username, password);
      setMaskedEmail(result.maskedEmail);
      setStep("otp");
      
      // Trigger temporary 10-minute expiration notice that auto-clears after 6 seconds
      setOtpNotice("Note: The verification code expires in 10 minutes.");
      setTimeout(() => {
        setOtpNotice("");
      }, 6000);

    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOtp(e){
    e.preventDefault();
    setError("");
    try {
      await verifyOtp(username, code);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm bg-brand-paper border border-brand-green rounded p-6 sm:p-8">
        <div className="flex flex-col items-center mb-5">
          <img src={renewLogo} alt="Renew Placenta Herbal Beauty Products" className="h-16 sm:h-20 md:h-24 w-auto"/>
        </div>

        <h1 className="font-display font-semibold text-xl text-center mb-6">Admin Login</h1>

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green"/>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-brand-green rounded pl-9 pr-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green"/>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={checkCapsLock}
                  onKeyDown={checkCapsLock}
                  className="w-full border border-brand-green rounded pl-9 pr-9 py-2 text-sm"
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
              {capsLockOn && (
                <p className="flex items-center gap-1.5 text-xs text-brand-red mt-1.5">
                  <AlertTriangle size={14}/>
                  Caps Lock is on
                </p>
              )}
            </div>

            {error && <p className="text-brand-red text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-deep text-brand-cream font-semibold py-2.5 rounded-sm"
            >
              Continue
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="space-y-4">
            <p className="text-sm text-center opacity-80">
              We sent a 6-digit code to <strong>{maskedEmail}</strong>
            </p>

            {/* Temporary Expiration Notice Banner */}
            {otpNotice && (
              <div className="p-2 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-sm text-xs font-medium text-center transition-all">
                {otpNotice}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">Verification Code</label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green"/>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-brand-green rounded pl-9 pr-3 py-2 text-sm tracking-[0.3em] text-center"
                  required
                />
              </div>
            </div>

            {error && <p className="text-brand-red text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-deep text-brand-cream font-semibold py-2.5 rounded-sm"
            >
              Verify & Log In
            </button>
            <button
              type="button"
              onClick={() => { setStep("credentials"); setCode(""); setError(""); setOtpNotice(""); }}
              className="w-full text-sm underline"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login