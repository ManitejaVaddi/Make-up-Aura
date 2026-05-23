import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then((response) => setServices(response.data));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Services</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">Bridal beauty services with luxury precision.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-gray-600">Explore bespoke makeup packages built for brides, engagement looks, photoshoots and glamorous celebrations.</p>
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {services.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-glass">Loading services…</div>
        ) : (
          services.map((service) => (
            <article key={service._id} className="rounded-[32px] border border-rose-100 bg-white p-8 shadow-glass">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{service.category}</span>
                <span className="text-rose-700">₹{service.price}</span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-rose-800">{service.name}</h2>
              <p className="mt-4 text-gray-600">{service.description}</p>
              <p className="mt-4 text-sm text-gray-500">Duration: {service.duration} mins</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
