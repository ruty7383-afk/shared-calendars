const multer = require('multer');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 1MB or smaller' : err.message;
    return res.status(400).json({ error: msg });
  }
  // JSON לא תקין בגוף הבקשה
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
