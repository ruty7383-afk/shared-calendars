require('dotenv').config();
const config = require('./config');
const { initSchema } = require('./db');
const app = require('./app');

async function main() {
  await initSchema();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
    console.log(`Swagger docs: http://localhost:${config.port}/api/docs`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
