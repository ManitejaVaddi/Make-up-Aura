export default function About() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr,0.6fr] items-center">
        <div>
          <p className="uppercase tracking-[0.3em] text-sm text-rose-700">About Bridal Aura</p>
          <h1 className="font-display text-5xl font-semibold text-rose-900">A luxury destination for brides seeking unforgettable beauty.</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Bridal Aura blends cinematic artistry, premium products, and runway makeup techniques to create soft and radiant bridal looks. Every appointment is crafted with attention, care, and a luxury experience.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[32px] bg-rose-50 p-8 shadow-glass">
              <h3 className="font-semibold text-2xl text-rose-700">Personalized Beauty</h3>
              <p className="mt-3 text-gray-600">Consultations designed around your skin, silhouette and wedding theme.</p>
            </div>
            <div className="rounded-[32px] bg-white p-8 shadow-glass">
              <h3 className="font-semibold text-2xl text-rose-700">Premium Experience</h3>
              <p className="mt-3 text-gray-600">Soft glam, clean luxury, and calm styling from start to finish.</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[40px] bg-white p-8 shadow-glass">
          <img src="https://images.unsplash.com/photo-1517061497104-12859fd5ed56?auto=format&fit=crop&w=900&q=80" alt="Bridal studio" className="h-full w-full rounded-[32px] object-cover" />
          <div className="absolute bottom-6 left-6 rounded-3xl bg-white/90 p-5 shadow-xl">
            {/* <p className="text-sm uppercase tracking-[0.24em] text-rose-500">Signature service</p> */}
            <h2 className="mt-2 text-xl font-semibold text-rose-800">Destination makeup for every celebration.</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
