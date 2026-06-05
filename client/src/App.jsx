import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

function App() {
  return (
    <div className="min-h-screen bg-cream text-luxury selection:bg-rose-200 selection:text-luxury">
      <Navbar />
      <AnimatePresence mode="wait">
        <main className="relative">
          <AppRoutes />
        </main>
      </AnimatePresence>
      <Footer />
      <Link
        to="/book"
        aria-label="Quick book appointment"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-rose-700/20 transition hover:bg-rose-800 md:hidden"
      >
        Book Now
      </Link>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
