import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Portfolio() {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const loadGallery = async () => {
      const response = await api.get('/gallery', { params: { category: 'bridal' } });
      setGallery(response.data);
    };
    loadGallery();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Portfolio</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">Cinematic bridal beauty, captured flawlessly.</h1>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {gallery.map((item) => (
          <div key={item._id} className="group overflow-hidden rounded-[32px] bg-white shadow-glass">
            <img src={item.mediaUrl} alt={item.title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-5">
              <h2 className="text-lg font-semibold text-rose-800">{item.title}</h2>
              <p className="mt-3 text-gray-600">{item.description || 'A moment captured in bridal beauty.'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
