import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    api.get('/faqs').then((res) => setFaqs(res.data)).catch(() => setFaqs([]));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Help</p>
        <h1 className="font-display text-4xl font-semibold text-rose-900">Frequently Asked Questions</h1>
        <p className="mt-4 text-gray-600">Answers to common questions about bookings, packages, and policies.</p>
      </div>

      <div className="mt-12 space-y-4">
        {faqs.length === 0 ? (
          <p className="text-gray-500">No FAQs available yet.</p>
        ) : (
          faqs.map((faq) => (
            <details key={faq._id} className="rounded-2xl border border-rose-100 bg-white p-5">
              <summary className="cursor-pointer text-lg font-semibold text-rose-800">{faq.question}</summary>
              <div className="mt-3 text-gray-600" dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </details>
          ))
        )}
      </div>
    </section>
  );
}
