import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import About from '../pages/About.jsx';
import Services from '../pages/Services.jsx';
import Packages from '../pages/Packages.jsx';
import Portfolio from '../pages/Portfolio.jsx';
import Reviews from '../pages/Reviews.jsx';
import Booking from '../pages/Booking.jsx';
import Contact from '../pages/Contact.jsx';
import Login from '../pages/Login.jsx';
import AdminLogin from '../pages/AdminLogin.jsx';
import AdminRegister from '../pages/AdminRegister.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import AdminPanel from '../pages/AdminPanel.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/book" element={<Booking />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
    </Routes>
  );
}
