const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/web',
    createProxyMiddleware({
      target: 'https://cpfjob.coupangdev.com',
      changeOrigin: true,
    })
  );
};
