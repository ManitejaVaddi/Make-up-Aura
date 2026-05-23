const reviews = [
  { name: 'Aisha', rating: 5, message: 'The bridal makeup was dreamy. I felt so confident and beautiful all day long.' },
  { name: 'Nisha', rating: 5, message: 'Professional, kind, and the glow lasted through the entire event.' },
  { name: 'Priya', rating: 5, message: 'The artist made me feel calm and ready. My photos look magical.' }
];

export default function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="uppercase tracking-[0.3em] text-sm text-rose-700">Reviews</p>
        <h1 className="font-display text-5xl font-semibold text-rose-900">What brides are saying</h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">Verified reviews from real brides who experienced our luxury bridal makeup services.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.name} className="rounded-[32px] border border-rose-100 bg-white p-8 shadow-glass">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-100 text-center leading-12 text-rose-700">{review.name.charAt(0)}</div>
              <div>
                <p className="font-semibold text-rose-800">{review.name}</p>
                <p className="text-sm text-gray-500">{Array(review.rating).fill('★').join('')}</p>
              </div>
            </div>
            <p className="mt-6 text-gray-600">"{review.message}"</p>
          </article>
        ))}
      </div>
    </section>
  );
}
