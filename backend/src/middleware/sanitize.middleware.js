/**
 * NoSQL Injection & Input Sanitization Middleware
 * Strips dangerous MongoDB query operators ($gt, $where, $ne, $regex) from request body, query, and params.
 */
export const sanitizeNoSQL = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const clean = {};
    for (const key of Object.keys(obj)) {
      // Strip keys starting with $ or containing dots to prevent query injection
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`[Security Guard] Blocked potential NoSQL injection key: ${key}`);
        continue;
      }
      clean[key] = sanitize(obj[key]);
    }
    return clean;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
