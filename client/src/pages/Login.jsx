import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setSubmitting(true);
    const response = await api.post('/auth/login', data);
    login(response.data.user, response.data.accessToken);
    if (response.data.user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-[40px] border border-rose-100 bg-white/90 p-10 shadow-glass">
        <h1 className="font-display text-4xl text-rose-700">Welcome back</h1>
        <p className="mt-4 text-gray-600">Login to manage your bookings, explore services, and enjoy luxury beauty planning.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
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
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New to Bridal Aura? <Link to="/register" className="text-rose-700 underline">Create account</Link>
        </p>
      </div>
    </section>
  );
}
