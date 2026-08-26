import { z } from 'zod';
import { ROLES } from '../config/constants.js';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Please enter your password'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'Username is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(ROLES).default(ROLES.ADMIN),
  }),
});
