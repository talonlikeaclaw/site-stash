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

  /**
   * Selects the target collection for following operations.
   * @param {string} collectionName - The name of the collection to use.
   */
  setCollection(collectionName) {
    instance.collection = instance.db.collection(collectionName);
    instance.collectionName = collectionName;
  }

  /**
   * Gets the currently active collection.
   * @returns The current active Mongo collection.
   */
  currentCollection() {
    return instance.collectionName;
  }

  /**
   * Runs an aggregation pipeline on the current collection.
   * @param {Array<Object>} pipeline
   * @returns {Promise<Array>}
   */
  async aggregate(pipeline) {
    return instance.collection.aggregate(pipeline).toArray();
  }

  /**
   * Finds all documents matching a query.
   * @param {object} [query={}] - MongoDB query filter.
   * @param {object} [projection={ _id: 0 }] - Fields to include or exclude.
   * @returns {Promise<Array>} - Array of matching documents.
   */
  async find(query = {}, projection = { _id: 0 }) {
    return instance.collection.find(query).project(projection).toArray();
  }
}
