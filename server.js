import dotenv from 'dotenv';
import app from './app.js';
import connectDatabase from './config/database.js';

dotenv.config();

const port = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  });
