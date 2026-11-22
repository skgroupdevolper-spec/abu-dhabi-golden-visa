// PM2 process file for xCloud (or any Node.js server).
// Usage on the server: npm ci && npm run build && pm2 start ecosystem.config.js
// Same code can run more than one site on the server: each site folder gets its own process name
// (the Abu Dhabi site keeps its original name).
const dir = require('path').basename(__dirname);
const name = process.env.PM2_NAME || (dir === 'www.abudhabigoldenvisa.com' || !dir.includes('.') ? 'abu-dhabi-golden-visa' : `site-${dir}`);

module.exports = {
  apps: [
    {
      name,
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: process.env.PORT || 3000 },
      max_memory_restart: '600M',
    },
  ],
};
