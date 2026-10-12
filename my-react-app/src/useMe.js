import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function useMe() {
  const { token } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [token]);

  return me;
}