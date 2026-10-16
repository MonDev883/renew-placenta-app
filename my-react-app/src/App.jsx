import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './Header.jsx'
import Hero from './Hero.jsx'
import TrustBadges from './TrustBadges.jsx'
import About from './About.jsx'
import Products from './Products.jsx'
import Testimonials from './Testimonials.jsx'
import Contact from './Contact.jsx'
import Footer from './Footer.jsx'
import ScrollTop from './ScrollTop.jsx'
import Login from './Login.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminProducts from './AdminProducts.jsx'
import AdminMessages from './AdminMessages.jsx'
import AdminUsers from './AdminUsers.jsx'
import AdminChangePassword from './AdminChangePassword.jsx'
import AdminForgotPassword from './AdminForgotPassword.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { Eye, EyeOff } from 'lucide-react'
import AdminActivity from './AdminActivity.jsx'
import logoImg from '/favicon.png'
import AdminContent from './AdminContent.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function PublicSite(){
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep the loading screen visible for at least 9 seconds
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 9000));
    const fetchProducts = fetch(`${API}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .catch(() => {});

    Promise.all([fetchProducts, minLoadTime])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center">
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer spinning ring - h-36 w-36 */}
          <div className="absolute h-36 w-36 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin"></div>
          
          {/* Logo image - h-20 w-20 */}
          <img
            src={logoImg}
            alt="Renew Placenta Logo"
            className="h-20 w-20 object-contain animate-pulse relative z-10"
          />
        </div>
        <h3 className="font-['Playfair_Display',serif] text-2xl font-semibold text-emerald-900 mb-2">
          Renew Placenta
        </h3>
        <p className="text-sm text-emerald-700/80 max-w-sm animate-pulse">
          Loading Renew Placenta...
        </p>
      </div>
    );
  }

  return (
    <>
      <Header/>
      <Hero/>
      <TrustBadges/>
      <About/>
      <Products/>
      <Testimonials/>
      <Contact/>
      <Footer/>
      <ScrollTop/>
    </>
  );
}

function App(){
  return (
    <Routes>
      <Route path="/" element={<PublicSite/>} />
      <Route path="/admin/login" element={<Login/>} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword/>} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard/>
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute>
          <AdminProducts/>
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute>
          <AdminMessages/>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminUsers/>
        </ProtectedRoute>
      } />
      <Route path="/admin/change-password" element={
        <ProtectedRoute>
          <AdminChangePassword/>
        </ProtectedRoute>
      } />
      <Route path="/admin/activity" element={
        <ProtectedRoute>
          <AdminActivity/>
        </ProtectedRoute>
      } />
    <Route path="/admin/content" element={
        <ProtectedRoute>
          <AdminContent/>
        </ProtectedRoute>
      } />
      </Routes>
  );
}

export default App