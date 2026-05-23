const gallery = [
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1508050919630-b135583b29c6?auto=format&fit=crop&w=900&q=80'
];

export default function Portfolio() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Portfolio</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">Cinematic bridal beauty, captured flawlessly.</h1>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {gallery.map((src, index) => (
          <div key={index} className="group overflow-hidden rounded-[32px] bg-white shadow-glass">
            <img src={src} alt={`Portfolio ${index + 1}`} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-5">
              <h2 className="text-lg font-semibold text-rose-800">Bride {index + 1}</h2>
              <p className="mt-3 text-gray-600">Soft natural finish with luminous glow and elegant detail.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
