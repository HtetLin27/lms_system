import app from './app.js';
import connectDB from './config/database.js';
import config from './config/config.js';

const PORT = config.app.port;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 LMS server running on port ${PORT}`);
      console.log(`📚 Environment: ${config.app.env}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
