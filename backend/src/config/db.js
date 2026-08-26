import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/national_auto_garage';

  try {
    // Attempt standard connection first
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected successfully to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB daemon connection at ${uri} was not reachable (${err.message}).`);
    console.log('[Database] Initializing in-memory MongoDB server instance for seamless development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'national_auto_garage',
        },
      });
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB running successfully at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database Error] Failed to start in-memory MongoDB fallback:', memErr.message);
      console.warn('[Database] Please install MongoDB or ensure MONGODB_URI is accessible.');
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database Error] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected.');
  });
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
