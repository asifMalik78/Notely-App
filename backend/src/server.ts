/**
 * Server Startup
 */

import app from './app.js';
import { testConnection } from './db/index.js';
import { env } from './config/env.js';

export async function startServer() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}
