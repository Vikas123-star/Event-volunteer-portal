// Catch async errors
exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }
  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate ${field}` });
  }
  // Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors.join(', ') });
  }

  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
};

exports.notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
