import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { packages } from '../data/packages.js';

export default function PackageDetail() {
  const { packageSlug } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  const packageData = packages.find((pkg) => pkg.slug === packageSlug);

  useEffect(() => {
    if (!packageData) return;
    const loadGallery = async () => {
      setLoading(true);
      const response = await api.get('/gallery', { params: { tags: packageData.galleryTag } });
      setGallery(response.data);
      setLoading(false);
    };
    loadGallery();
  }, [packageData]);

  if (!packageData) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] bg-white p-12 shadow-glass">
          <h1 className="text-4xl font-semibold text-rose-800">Package not found</h1>
          <p className="mt-4 text-gray-600">Please go back to the packages page and select a valid package.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr,0.8fr]">
        <div className="rounded-[36px] bg-white p-10 shadow-glass">
          <div className="flex flex-col gap-4">
            <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Package details</p>
            <h1 className="font-display text-5xl font-semibold text-rose-900">{packageData.title}</h1>
            <p className="text-3xl font-bold text-rose-700">₹{packageData.price}</p>
            <p className="max-w-2xl text-gray-600">This package includes premium bridal makeup, service-level care, and a polished look designed for your special moment.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[32px] bg-rose-50 p-6">
              <h2 className="text-xl font-semibold text-rose-800">Included service</h2>
              <p className="mt-3 text-gray-600">{packageData.serviceName}</p>
              <p className="mt-3 text-rose-700">Service value: ₹{packageData.servicePrice}</p>
            </div>
            <div className="rounded-[32px] bg-rose-50 p-6">
              <h2 className="text-xl font-semibold text-rose-800">Package features</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                {packageData.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/book?package=${encodeURIComponent(packageData.title)}`)}
            className="mt-10 rounded-full bg-rose-700 px-8 py-4 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Book this package
          </button>
        </div>

        <aside className="rounded-[36px] bg-rose-50 p-10 shadow-glass">
          <h2 className="text-3xl font-semibold text-rose-800">Package gallery</h2>
          <p className="mt-4 text-gray-600">Browse images that showcase the style and finish your package delivers.</p>
          <div className="mt-8 space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading imagery…</p>
            ) : gallery.length === 0 ? (
              <p className="text-gray-500">No gallery images have been added yet for this package.</p>
            ) : (
              gallery.map((item) => (
                <img key={item._id} src={item.mediaUrl} alt={item.title} className="w-full rounded-[28px] object-cover" />
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
