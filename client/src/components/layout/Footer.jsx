import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-white/80 py-10">
      <div className="mx-auto max-w-7xl px-6 text-sm text-luxury">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl text-rose-700">Bridal Aura</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-600">
              A premium bridal makeup studio crafted for modern brides who want luxury beauty, seamless booking, and unforgettable wedding moments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-rose-700">Explore</h4>
            <div className="mt-4 flex flex-col gap-2 text-gray-600">
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/book">Book</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-rose-700">Contact</h4>
            <p className="mt-4 text-gray-600">hello@bridalaura.com</p>
            <p className="text-gray-600">+91 98765 43210</p>
            <p className="mt-2 text-gray-500">Mumbai, India</p>
          </div>
        </div>
        <div className="mt-10 border-t border-rose-100 pt-6 text-center text-gray-500">
          © 2026 Bridal Aura. Made for luxury brides.
        </div>
      </div>
    </footer>
  );
}
