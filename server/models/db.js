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
    instance.db = instance.mongoClient.db(dbName);

    // Health check
    await instance.db.command({ ping: 1 });
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

  /**
   * Finds a single document matching a query.
   * @param {object} query - MongoDB query filter.
   * @param {object} [projection={}] - Fields to include or exclude.
   * @returns {Promise<object|null>} - The matching document or null.
   */
  async findOne(query, projection = {}) {
    return instance.collection.findOne(query, { projection });
  }

  /**
   * Returns all documents in the current collection.
   * @returns {Promise<Array>} - Array of all documents.
   */
  async readAll() {
    return instance.collection.find().project({ _id: 0 }).toArray();
  }

  /**
   * Inserts a single document into the current collection.
   * @param {object} item - The document to insert.
   * @returns {Promise<object>} - The MongoDB insertion result.
   */
  async create(item) {
    return instance.collection.insertOne(item);
  }

  /**
   * Inserts multiple documents into the current collection.
   * @param {Array<object>} items - Array of documents to insert.
   * @returns {Promise<number>} - The number of inserted documents.
   */
  async createMany(items) {
    const result = await instance.collection.insertMany(items);
    return result.insertedCount;
  }

  /**
   * Clears the current collection and inserts a new batch of documents.
   * @param {Array<object>} items - Array of seed documents.
   */
  async dropAndSeed(items) {
    await instance.collection.deleteMany({});
    const result = await instance.collection.insertMany(items);
    console.log(
      `[DB] Seeded ${result.insertedCount} documents into ${instance.collection.collectionName}`
    );
  }

  /**
  * Gracefully closes the MongoDB connection.
  */
  async close() {
    await instance.mongoClient.close();
    this.db = null;
    this.collection = null;
  }
}

export const db = new DB();
