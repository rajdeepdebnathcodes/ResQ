const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

const PORT = config.PORT;

async function startServer() {
  console.log('====================================================');
  console.log('  ResQ – AI-Powered Disaster Response Platform');
  console.log('====================================================');
  console.log(`[Environment] Mode: ${config.NODE_ENV}`);
  console.log(`[Configuration] Host Port: ${PORT}`);

  // Test Database Connection
  await testConnection();

  app.listen(PORT, () => {
    console.log(`[Server] API server running smoothly on http://localhost:${PORT}`);
    console.log(`[Health] Status endpoint: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

startServer();
