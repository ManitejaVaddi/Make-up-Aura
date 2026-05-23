import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
    </section>
  );
}
