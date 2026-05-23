import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().min(1),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  location: z.string().optional(),
  packageName: z.string().optional()
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'])
});
