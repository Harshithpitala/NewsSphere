import { APIError } from '../utils/APIError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    const formattedErrors = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })) || [error.message];

    next(new APIError(400, 'Validation Error', formattedErrors));
  }
};
