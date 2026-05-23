import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setSubmitting(true);
    const response = await api.post('/auth/register', data);
    login(response.data.user, response.data.accessToken);
    navigate('/dashboard');
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-[40px] border border-rose-100 bg-white/90 p-10 shadow-glass">
        <h1 className="font-display text-4xl text-rose-700">Create your bridal account</h1>
        <p className="mt-4 text-gray-600">Start your luxury makeup booking journey with personalized service and seamless payment.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          <label className="block text-sm text-gray-700">
            Full name
            <input type="text" {...register('name')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400" />
            {errors.name && <span className="text-sm text-rose-600">{errors.name.message}</span>}
          </label>
          <label className="block text-sm text-gray-700">
            Email
            <input type="email" {...register('email')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400" />
            {errors.email && <span className="text-sm text-rose-600">{errors.email.message}</span>}
          </label>
          <label className="block text-sm text-gray-700">
            Password
            <input type="password" {...register('password')} className="mt-2 w-full rounded-3xl border border-rose-200 bg-cream p-4 text-sm outline-none focus:border-rose-400" />
            {errors.password && <span className="text-sm text-rose-600">{errors.password.message}</span>}
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-rose-700 px-6 py-4 text-white transition hover:bg-rose-800">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already booked? <Link to="/login" className="text-rose-700 underline">Log in</Link>
        </p>
      </div>
    </section>
  );
}
