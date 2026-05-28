import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: [
    'https://trashure-theta.vercel.app', // Web production (Vercel)
    'http://localhost:5173',              // Dev frontend Vite
    'http://localhost:3000',              // Dev alternatif
    'https://localhost',                  // Capacitor Android (WebView)
    'capacitor://localhost',              // Capacitor iOS
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Trashure API is running' });
});

// API Routes
import routes from './routes';
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

export default app;
