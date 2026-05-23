export default function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-[40px] bg-white p-10 shadow-glass">
          <h1 className="font-display text-5xl font-semibold text-rose-800">Let’s discuss your bridal vision.</h1>
          <p className="mt-6 text-gray-600">Reach out and our bridal team will personalize a beauty plan for your wedding day, engagement ceremony or photoshoot.</p>
          <div className="mt-10 space-y-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-rose-700">Email</h3>
              <p>hello@bridalaura.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-rose-700">Phone</h3>
              <p>+91 98765 43210</p>
            </div>
            <div>
              <h3 className="font-semibold text-rose-700">Studio</h3>
              <p>Mumbai, India</p>
            </div>
          </div>
        </div>
        <div className="rounded-[40px] bg-rose-50 p-10 shadow-glass">
          <form className="space-y-6">
            <label className="block text-sm text-gray-700">
              Full name
              <input type="text" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <label className="block text-sm text-gray-700">
              Email
              <input type="email" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <label className="block text-sm text-gray-700">
              Message
              <textarea rows="5" className="mt-2 w-full rounded-3xl border border-rose-200 bg-white p-4 text-sm outline-none focus:border-rose-400" />
            </label>
            <button type="button" className="rounded-full bg-rose-700 px-6 py-4 text-white transition hover:bg-rose-800">Send inquiry</button>
          </form>
        </div>
      </div>
    </section>
  );
}
