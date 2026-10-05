import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import farmRoutes from './routes/farmRoutes';
import fieldRoutes from './routes/fieldRoutes';
import cropRoutes from './routes/cropRoutes';
import activityRoutes from './routes/activityRoutes';
import sprayingRoutes from './routes/sprayingRoutes';
import fertilizerRoutes from './routes/fertilizerRoutes';
import expenseRoutes from './routes/expenseRoutes';
import harvestRoutes from './routes/harvestRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import taskRoutes from './routes/taskRoutes';
import reportRoutes from './routes/reportRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/spraying', sprayingRoutes);
app.use('/api/fertilizers', fertilizerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;