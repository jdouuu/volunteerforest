// Vercel Node.js Function entry that proxies to the Express app.
// Supports path rewriting via query param (?path=...) so Express sees the original path.
const app = require('../server/server');

module.exports = (req, res) => {
  try {
    // If rewrite added ?path=..., restore the original url for Express routing
    if (req.query && req.query.path) {
      const original = `/api/${req.query.path}`.replace(/\/+/, '/');
      req.url = original + (req.url.includes('?') ? '' : '');
    }
  } catch (_) {}
  return app(req, res);
};
