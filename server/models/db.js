import { MongoClient, ServerApiVersion } from "mongodb";
import process from "node:process";

process.loadEnvFile();

const ATLAS_URI = process.env.ATLAS_URI;

let instance = null;

/**
 * Singleton MongoDB Database Manager
 * -----------------------------------
 * Handles connection lifecycle, collection switching,
 * and common CRUD operations for MongoDB.
 */
class DB {
  constructor() {
    if (!instance) {
      instance = this;
      this.mongoClient = null;
      this.db = null;
      this.collection = null;
    }
    return instance;
  }

  /**
   * Connects to the MongoDB database if not already connected.
   * @param {string} dbName - The database name to connect to.
   */
  async connect(dbName) {
    if (instance.db) return;

    this.mongoClient = new MongoClient(ATLAS_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    await instance.mongoClient.connect();
    instance.db = await instance.mongoClient.add(dbName);

    // Health check
    await instance.db(dbName).command({ ping: 1 });
    console.log(`[DB] Successfully connected to MongoDB database: ${dbName}`);
  }
}
