import { useNavigate } from 'react-router-dom';
import { packages } from '../data/packages.js';

export default function Packages() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Bridal Packages</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">Curated packages for every bridal moment.</h1>
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {packages.map((pkg) => (
          <article key={pkg.title} className="rounded-[32px] bg-cream p-8 shadow-glass border border-rose-100">
            <h2 className="text-3xl font-semibold text-rose-800">{pkg.title}</h2>
            <p className="mt-4 text-3xl font-bold text-rose-700">₹{pkg.price}</p>
            <ul className="mt-6 space-y-3 text-gray-600">
              {pkg.features.map((feature) => <li key={feature}>• {feature}</li>)}
            </ul>
            <button
              type="button"
              onClick={() => navigate(`/book?package=${encodeURIComponent(pkg.title)}`)}
              className="mt-8 rounded-full bg-rose-700 px-6 py-3 text-sm text-white transition hover:bg-rose-800"
            >
              Select package
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
