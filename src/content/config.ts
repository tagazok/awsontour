import { defineCollection, z } from 'astro:content';

const tripSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['completed', 'current', 'planned', 'hidden']),
  headerImage: z.string(),
  stats: z.array(z.object({
    id: z.string(),
    value: z.number(),
    label: z.string(),
    icon: z.string(),
    unit: z.string().optional()
  })),
  route: z.object({
    coordinates: z.array(z.tuple([z.number(), z.number()])),
    waypoints: z.array(z.object({
      name: z.string(),
      coordinates: z.tuple([z.number(), z.number()])
    }))
  }),
  gallery: z.array(z.object({
    image: z.string(),
    title: z.string().optional(),
    description: z.string().optional()
  })),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    date: z.date().optional(),
    registrationUrl: z.string().url().optional(),
    location: z.string().optional(),
    isPublic: z.boolean().default(false),
    image: z.string().optional()
  })),
  participants: z.array(z.object({
    name: z.string(),
    photo: z.string().optional(),
    role: z.string().optional()
  }))
});

const trips = defineCollection({
  type: 'content',
  schema: tripSchema,
});

export const collections = {
  trips,
};