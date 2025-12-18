import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';

import { PORT, DATABASE_URL } from './config/env.js';

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import workflowRouter from './routes/workflow.routes.js';

// Validate database connection at startup
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined. Please check your .env file');
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Subscription Tracker API!');
});

app.listen(PORT, () => {
  console.log(`✅ Subscription Tracker API is running on http://localhost:${PORT}`);
  console.log('📦 Connected to NeonDB PostgreSQL');
});

export default app;
