import { z } from 'zod';

export const createReviewSchema = z.object({
  serviceId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(5),
  message: z.string().min(10),
  images: z.array(z.string().url()).optional()
});
