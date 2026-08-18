const ApiError = require('../utils/ApiError');

/** Validates req.body (or another part of req) against a Zod schema. */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return next(new ApiError(422, 'Validation failed', details));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
