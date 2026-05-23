import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  duration: z.number().positive(),
  category: z.enum(['bridal', 'hd', 'party', 'fashion', 'engagement', 'photoshoot']),
  images: z.array(z.string().url()).optional(),
  availability: z.boolean().optional(),
  featured: z.boolean().optional()
});
