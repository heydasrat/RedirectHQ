import mongoose from "mongoose";
import config from "../config/config.js";
import {DB_NAME} from '../constant.js'
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

/* OLD IMPLEMENTATION - KEPT FOR REFERENCE

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.mongodbUri, {
      dbName: DB_NAME,
    });

    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};
*/

// NEW VERCEL-COMPATIBLE IMPLEMENTATION
const connectionCache = globalThis;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionCache.__redirectHQMongoPromise) {
    connectionCache.__redirectHQMongoPromise = mongoose.connect(config.mongodbUri, {
      dbName: DB_NAME,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    }).then(({ connection }) => {
      console.log(`MongoDB connected: ${connection.host}`);
      return connection;
    }).catch((error) => {
      delete connectionCache.__redirectHQMongoPromise;
      throw error;
    });
  }

  return connectionCache.__redirectHQMongoPromise;
};

export default connectDB;
