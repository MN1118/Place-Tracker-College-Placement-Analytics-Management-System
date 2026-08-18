const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET } = require('../config/env');

/** Verifies the JWT and attaches { id, role, email } to req.user */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, 'Authentication required'));

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

/** Restricts a route to one or more roles. Use after `authenticate`. */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

/** Like `authenticate`, but does not fail the request when no/invalid token is present.
 *  Used on public listing routes that enrich the response when the caller happens to be logged in
 *  (e.g. attaching eligibility info to job listings for a logged-in student). */
function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Ignore invalid/expired tokens on optional routes; treat as anonymous.
  }
  next();
}

module.exports = { authenticate, authorize, optionalAuthenticate };
