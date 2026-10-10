import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

function ProtectedRoute({ children }){
  const { token } = useAuth();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default ProtectedRoute