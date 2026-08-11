import { ApiError } from '../utils/apiError.js';

/**
 * Middleware factory to validate request against Zod schemas
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const validationErrors = parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          rule: issue.code,
        }));
        return next(
          ApiError.badRequest('Validation failed for request data', validationErrors)
        );
      }
      // Assign sanitized/parsed data back to the request
      req[source] = parsed.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
