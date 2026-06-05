import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api.js';

const featuredServices = [
  { title: 'Luxury Bridal Makeup', description: 'Radiant bespoke bridal beauty with glow, contour and cinematic finish.' },
  { title: 'Engagement Glam', description: 'Soft romantic makeup designed to sparkle in photos and videos.' },
  { title: 'HD Photoshoot Look', description: 'Flawless camera-ready finish for your editorial and portfolio moments.' }
];

export default function Home() {
  return (
    <section className="overflow-hidden">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,207,232,0.38),_transparent_35%),linear-gradient(180deg,_#fffaf7_0%,_#fdf5f0_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="grid gap-12 lg:grid-cols-[0.8fr,0.6fr] lg:items-center">
            <div>
              <span className="mb-6 inline-flex rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
                Premium Bridal Beauty
              </span>
              <h1 className="font-display text-5xl font-semibold tracking-tight text-rose-900 sm:text-6xl">
                Luxury bridal makeup designed for your unforgettable day.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600">
                Discover a cinematic beauty service with soft textures, radiant finishing, and tailored booking to bring out your most luminous bridal glow.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/book" className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-800">
                  Book Your Consultation
                </Link>
                <Link to="/portfolio" className="rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                  Explore Portfolio
                </Link>
              </div>
            </div>
            <div className="relative rounded-[40px] border border-white/80 bg-white/70 p-6 shadow-glass backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-rose-50 via-transparent to-transparent opacity-80" />
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80" alt="Bridal makeup luxe" className="relative h-[420px] w-full rounded-[40px] object-cover shadow-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <motion.article key={service.title} whileHover={{ y: -8 }} className="rounded-[28px] border border-rose-100 bg-white/80 p-8 shadow-glass">
              <h3 className="font-semibold text-2xl text-rose-700">{service.title}</h3>
              <p className="mt-4 text-gray-600">{service.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
          <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] bg-rose-50 p-10 shadow-glass">
            <h2 className="font-display text-3xl text-rose-800">Why brides choose us</h2>
            <p className="mt-5 text-gray-600">Every bride receives an elevated booking experience, luxury product artistry, and a calm beauty journey from consultation to wedding day.</p>
            <ul className="mt-8 space-y-4 text-gray-600">
              <li>• Personal bridal consultation and tailored beauty design</li>
              <li>• Premium professional makeup with longwear formulas</li>
              <li>• Travel-ready wedding-day artistry and touch-up support</li>
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[28px] border border-rose-100 bg-white p-7 shadow-sm">
              <h4 className="font-semibold text-2xl text-rose-700">45+</h4>
              <p className="mt-2 text-sm text-gray-600">Luxury bridal weddings delivered</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white p-7 shadow-sm">
              <h4 className="font-semibold text-2xl text-rose-700">1200+</h4>
              <p className="mt-2 text-sm text-gray-600">Happy clients glowing with confidence</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white p-7 shadow-sm">
              <h4 className="font-semibold text-2xl text-rose-700">5-Star</h4>
              <p className="mt-2 text-sm text-gray-600">Verified reviews from brides</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white p-7 shadow-sm">
              <h4 className="font-semibold text-2xl text-rose-700">Instant</h4>
              <p className="mt-2 text-sm text-gray-600">Secure online booking & payment support</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Voices</p>
          <h2 className="font-display text-3xl font-semibold text-rose-900">What our clients say</h2>
        </div>
        <Testimonials />
      </section>
    </section>
  );
}

function Testimonials() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    api
      .get('/testimonials', { params: { featured: true } })
      .then((res) => mounted && setItems(res.data || []))
      .catch(() => mounted && setItems([]));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items]);

  if (!items || items.length === 0) return <p className="mt-6 text-center text-gray-500">No testimonials yet.</p>;

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  const t = items[index];

  return (
    <div className="mt-8">
      <div className="relative mx-auto max-w-3xl">
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <img src={t.avatar || 'https://via.placeholder.com/80'} alt={t.customerName} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-rose-800">{t.customerName || 'Guest'}</p>
                  <p className="text-sm text-gray-500">{t.rating} ⭐</p>
                </div>
                <div className="text-sm text-gray-400">{t.date ? new Date(t.date).toLocaleDateString() : ''}</div>
              </div>
              <p className="mt-4 text-gray-600">{t.comment}</p>
            </div>
          </div>
        </div>

        <button aria-label="Previous testimonial" onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow">
          ‹
        </button>
        <button aria-label="Next testimonial" onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow">
          ›
        </button>

        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-2 w-8 rounded-full ${i === index ? 'bg-rose-700' : 'bg-rose-200'}`} aria-label={`Show testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
