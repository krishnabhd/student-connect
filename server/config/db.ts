import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  // Accept both common env names (docs used MONGODB_URI; older code used MONGO_URI)
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/student_connect';

  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', false); // set true to see every query
  }

  mongoose.connection.on('connected', () =>
    console.log(`✅ MongoDB → ${mongoose.connection.host}/${mongoose.connection.name}`)
  );
  mongoose.connection.on('error', (err) =>
    console.error('❌ MongoDB error:', err.message)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️  MongoDB disconnected')
  );

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}


/***export const db: any = new Proxy({}, {
  get(_target, prop) {
    throw new Error(
      `Legacy 'db.${String(prop)}' accessed. ` +
      `Migrate this file to import models from '../models/schemas.ts' instead.`
    );
  },
});  */