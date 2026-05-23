import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
