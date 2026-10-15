import dotenv from 'dotenv';
import express from 'express';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return response.status(400).json({ message: 'Invalid JSON payload' });
  }

  return next(error);
});

export default app;
