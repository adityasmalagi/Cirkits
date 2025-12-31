import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const signUpSchema = z.object({
  name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

// Profile validation schemas
export const profileSchema = z.object({
  displayName: z.string()
    .trim()
    .max(100, 'Display name must be less than 100 characters')
    .optional()
    .nullable(),
  phoneNumber: z.string()
    .trim()
    .refine((val) => !val || /^[0-9]{10,15}$/.test(val.replace(/\s/g, '')), {
      message: 'Phone number must be 10-15 digits only',
    })
    .optional()
    .nullable(),
  bio: z.string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  location: z.string()
    .trim()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .nullable(),
});

// URL validation helper
const urlSchema = z.string()
  .trim()
  .max(2000, 'URL must be less than 2000 characters')
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Please enter a valid URL starting with http:// or https://',
  });

const optionalUrlSchema = urlSchema.optional();

// Project submission validation schemas
export const projectPartSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Component name is required')
    .max(200, 'Component name must be less than 200 characters'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  price: z.string()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: 'Price must be a valid number',
    })
    .optional(),
  quantity: z.string()
    .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 1), {
      message: 'Quantity must be at least 1',
    })
    .optional(),
  affiliate_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL starting with http:// or https://',
    })
    .optional(),
});

export const projectSubmissionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Project title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  categoryId: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedCost: z.string()
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: 'Estimated cost must be a valid number',
    })
    .optional(),
  estimatedTime: z.string()
    .trim()
    .max(100, 'Estimated time must be less than 100 characters')
    .optional(),
  imageUrl: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL starting with http:// or https://',
    })
    .optional(),
  parts: z.array(projectPartSchema).min(1, 'At least one component is required'),
});

// Admin validation schemas
export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  icon: z.string()
    .trim()
    .max(50, 'Icon name must be less than 50 characters')
    .optional(),
});

export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  image_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional(),
  price: z.number().min(0, 'Price must be positive').optional().nullable(),
  affiliate_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional(),
  affiliate_source: z.string()
    .trim()
    .max(100, 'Source must be less than 100 characters')
    .optional(),
  category_id: z.string().optional().nullable(),
});

export const adminProjectSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  slug: z.string()
    .trim()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  image_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_cost: z.number().min(0, 'Cost must be positive').optional().nullable(),
  estimated_time: z.string()
    .trim()
    .max(100, 'Estimated time must be less than 100 characters')
    .optional(),
  category_id: z.string().optional().nullable(),
  featured: z.boolean().optional(),
});

export const laptopSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  brand: z.string()
    .trim()
    .min(1, 'Brand is required')
    .max(100, 'Brand must be less than 100 characters'),
  image_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional(),
  price: z.number().min(0, 'Price must be positive').optional().nullable(),
  affiliate_url: z.string()
    .trim()
    .max(2000, 'URL must be less than 2000 characters')
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid URL',
    })
    .optional(),
  screen_size: z.number().min(0, 'Screen size must be positive').optional().nullable(),
  cpu: z.string().trim().max(200, 'CPU must be less than 200 characters').optional(),
  gpu: z.string().trim().max(200, 'GPU must be less than 200 characters').optional(),
  ram: z.number().min(0, 'RAM must be positive').optional().nullable(),
  storage: z.string().trim().max(100, 'Storage must be less than 100 characters').optional(),
  use_cases: z.array(z.string()).optional().nullable(),
});

// AI Suggest validation (for edge function)
export const aiSuggestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Message content is required').max(10000, 'Message too long'),
  })).min(1, 'At least one message is required').max(50, 'Too many messages'),
});

// Type exports
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProjectSubmissionInput = z.infer<typeof projectSubmissionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type AdminProjectInput = z.infer<typeof adminProjectSchema>;
export type LaptopInput = z.infer<typeof laptopSchema>;
export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
