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
}
