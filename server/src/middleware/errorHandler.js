const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.statusCode || 500);
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, message);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details: err.details || undefined,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
