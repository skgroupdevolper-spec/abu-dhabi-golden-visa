// PM2 process file for xCloud (or any Node.js server).
// Usage on the server: npm ci && npm run build && pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'abu-dhabi-golden-visa',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: process.env.PORT || 3000 },
      max_memory_restart: '600M',
    },
  ],
};
