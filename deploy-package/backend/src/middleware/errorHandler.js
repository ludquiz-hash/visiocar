/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError' || err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message,
      fields: err.fields || null,
    });
  }

  // Handle authentication errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: err.message || 'Authentication required',
    });
  }

  // Handle forbidden errors
  if (err.status === 403) {
    return res.status(403).json({
      error: 'Forbidden',
      details: err.message || 'Access denied',
    });
  }

  // Handle not found errors
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not Found',
      details: err.message || 'Resource not found',
    });
  }

  // Handle Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      error: 'Database Error',
      details: err.message,
      code: err.code,
    });
  }

  // Handle Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    return res.status(400).json({
      error: 'Payment Error',
      details: err.message,
      type: err.type,
    });
  }

  // Default server error
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    details: isDev ? err.message : 'Something went wrong',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    details: `Route ${req.method} ${req.path} not found`,
  });
}