const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Servidor iniciado na porta ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

startServer();
