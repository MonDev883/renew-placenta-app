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
import ProtectedRoute from './ProtectedRoute.jsx'

function PublicSite(){
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
    </Routes>
  );
}

export default App