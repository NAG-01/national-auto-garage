import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './src/config/db.js';
import { createApp } from './src/app.js';
import { User } from './src/models/User.js';
import { seedDatabase } from './src/scripts/seed.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server Startup] Empty database detected. Auto-seeding initial garage data...');
      await seedDatabase(false);
    }

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`  NATIONAL AUTO GARAGE — MANAGEMENT API`);
      console.log(`  Running on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===================================================`);
    });
  } catch (err) {
    console.error('Failed to start National Auto Garage server:', err);
    process.exit(1);
  }
}

startServer();
