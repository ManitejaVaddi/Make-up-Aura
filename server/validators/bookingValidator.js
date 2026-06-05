import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1).refine((val) => {
    // Expecting date in YYYY-MM-DD format. Disallow past dates (based on server local date).
    try {
      const [y, m, d] = val.split('-').map(Number);
      if (!y || !m || !d) return false;
      const selected = new Date(y, m - 1, d);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return selected >= today;
    } catch (e) {
      return false;
    }
  }, { message: 'Booking date cannot be in the past' }),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  location: z.string().optional(),
  packageName: z.string().optional(),
  depositPercent: z.number().optional().refine((val) => val === undefined || [0, 25, 50, 75, 100].includes(val), { message: 'Deposit percent must be 0, 25, 50, 75, or 100' })
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'])
});
