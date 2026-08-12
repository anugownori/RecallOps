import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on http://localhost:${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /store/memory`);
  console.log(`   - POST /store`);
  console.log(`   - POST /analyze`);
  console.log(`   - POST /feedback`);
});


// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed. Process terminated cleanly.');
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
