import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null);
const API = 'http://localhost:4000';

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  async function requestLogin(username, password){
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data; // { otpRequired, username, maskedEmail }
  }

  async function verifyOtp(username, code){
    const res = await fetch(`${API}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
  }

  function logout(){
    localStorage.removeItem('adminToken');
    setToken(null);
    window.location.href =  '/admin/login';// Automatically redirect to login page
  }

  return (
    <AuthContext.Provider value={{ token, requestLogin, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
  return useContext(AuthContext);
}