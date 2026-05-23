import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Packages', path: '/packages' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Booking', path: '/book' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 shadow-sm border-b border-rose-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-display tracking-tight text-rose-700">
          Bridal Aura
        </Link>
        <nav className="hidden gap-6 md:flex items-center text-sm text-luxury font-medium">
          {links.map((link) => (
            <NavLink key={link.path} to={link.path} className={({ isActive }) => isActive ? 'text-rose-600 underline underline-offset-4' : 'hover:text-rose-500'}>
              {link.name}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                {user.role === 'admin' ? 'Admin Portal' : 'My Portal'}
              </button>
              <button className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white transition hover:bg-rose-700" onClick={() => { logout(); navigate('/'); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50" to="/login">
                Login
              </Link>
              <Link className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-50" to="/admin-login">
                Admin Login
              </Link>
              <Link className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white transition hover:bg-rose-700" to="/register">
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
