import { z } from 'zod';
import { logger } from './logger';

/**
 * HTML/XSS sanitization
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL injection prevention (additional layer beyond Prisma)
 */
export function sanitizeSQL(input: string): string {
  const dangerous = [
    ';',
    '--',
    '/*',
    '*/',
    'xp_',
    'sp_',
    'EXEC',
    'EXECUTE',
    'DROP',
    'DELETE',
    'TRUNCATE',
    'ALTER',
  ];

  let sanitized = input;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '');
  }

  return sanitized;
}

/**
 * Remove null bytes
 */
export function removeNullBytes(input: string): string {
  return input.replace(/\0/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize file paths (prevent directory traversal)
 */
export function sanitizeFilePath(input: string): string {
  return input
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return normalizeWhitespace(removeNullBytes(sanitizeHTML(input)));
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Enhanced Zod schemas with sanitization
 */

// Email with sanitization
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .max(255, 'Email too long')
  .transform((val) => sanitizeInput(val) as string);

// URL with validation
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'Only HTTP(S) URLs are allowed' }
  );

// Phone number
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
  .max(20, 'Phone number too long');

// VAT number (EU format)
export const vatNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}[0-9A-Z]{2,13}$/, 'Invalid VAT number format')
  .max(15, 'VAT number too long');

// Fiscal code (Italian)
export const fiscalCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/, 'Invalid fiscal code format')
  .length(16, 'Fiscal code must be 16 characters');

// Safe string (alphanumeric + common punctuation)
export const safeStringSchema = (maxLength: number = 255) =>
  z
    .string()
    .trim()
    .max(maxLength, `String too long (max ${maxLength})`)
    .regex(/^[a-zA-Z0-9\s.,!?'"-]*$/, 'Contains invalid characters')
    .transform((val) => sanitizeInput(val) as string);

// Rich text (with HTML sanitization)
export const richTextSchema = (maxLength: number = 10000) =>
  z
    .string()
    .trim()
    .max(maxLength, `Text too long (max ${maxLength})`)
    .transform((val) => {
      // Basic HTML sanitization (consider using a library like DOMPurify for production)
      return val
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '');
    });

// ID validation
export const idSchema = z.string().cuid('Invalid ID format').or(z.string().uuid('Invalid UUID format'));

// Pagination
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// Date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be after start date' }
);

/**
 * File upload validation
 */
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  // Check size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX',
    };
  }

  // Check filename
  const sanitizedName = sanitizeFilePath(file.name);
  if (sanitizedName !== file.name) {
    logger.warn('File name sanitized', {
      original: file.name,
      sanitized: sanitizedName,
    });
  }

  return { valid: true };
}

/**
 * Middleware to sanitize all inputs
 */
export function sanitizationMiddleware({ input, next }: any) {
  const sanitized = sanitizeInput(input);

  if (JSON.stringify(sanitized) !== JSON.stringify(input)) {
    logger.info('Input sanitized', {
      changes: 'Input was modified during sanitization',
    });
  }

  return next({ input: sanitized });
}
