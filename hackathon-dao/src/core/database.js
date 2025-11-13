/**
 * AgentDB Database Integration
 * Provides database storage and retrieval for hackathon data
 */

const { createDatabase } = require('agentdb');

class HackathonDatabase {
  constructor(config = {}) {
    this.config = {
      name: config.name || 'hackathon_dao',
      filename: config.filename || ':memory:',
      ...config
    };

    this.db = null;
    this.collections = {
      teams: 'teams',
      members: 'members',
      contributions: 'contributions',
      proposals: 'proposals',
      votes: 'votes',
      royalties: 'royalties'
    };
  }

  /**
   * Initialize the database and create collections
   */
  async initialize() {
    try {
      // Create database instance using AgentDB's createDatabase
      this.db = await createDatabase(this.config.filename);

      // Create tables for each collection
      for (const [key, collectionName] of Object.entries(this.collections)) {
        await this.createCollection(collectionName);
      }

      console.log('✓ HackathonDatabase initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create a collection (table) if it doesn't exist
   */
  async createCollection(name) {
    try {
      // Create simple table for storing JSON documents
      const sql = `
        CREATE TABLE IF NOT EXISTS ${name} (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        )
      `;

      this.db.exec(sql);
      return true;
    } catch (error) {
      console.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Insert a document
   */
  async insert(collection, document) {
    try {
      const id = document.id || this.generateId();
      const data = JSON.stringify(document);
      const timestamp = Date.now();

      const sql = `INSERT INTO ${this.collections[collection]} (id, data, timestamp) VALUES (?, ?, ?)`;
      this.db.prepare(sql).run(id, data, timestamp);

      return { ...document, id };
    } catch (error) {
      console.error(`Failed to insert into ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Query documents by text search
   */
  async search(collection, query, limit = 10) {
    try {
      // Simple text search in JSON data
      const sql = `
        SELECT id, data, timestamp
        FROM ${this.collections[collection]}
        WHERE data LIKE ?
        LIMIT ?
      `;

      const searchTerm = `%${query}%`;
      const results = this.db.prepare(sql).all(searchTerm, limit);

      return results.map(row => JSON.parse(row.data));
    } catch (error) {
      console.error(`Failed to search ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async get(collection, id) {
    try {
      const sql = `SELECT data FROM ${this.collections[collection]} WHERE id = ?`;
      const result = this.db.prepare(sql).get(id);

      return result ? JSON.parse(result.data) : null;
    } catch (error) {
      console.error(`Failed to get from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async update(collection, id, updates) {
    try {
      const existing = await this.get(collection, id);
      if (!existing) {
        throw new Error(`Document ${id} not found in ${collection}`);
      }

      const updated = { ...existing, ...updates, updatedAt: Date.now() };
      const data = JSON.stringify(updated);

      const sql = `UPDATE ${this.collections[collection]} SET data = ?, timestamp = ? WHERE id = ?`;
      this.db.prepare(sql).run(data, Date.now(), id);

      return updated;
    } catch (error) {
      console.error(`Failed to update ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(collection, id) {
    try {
      const sql = `DELETE FROM ${this.collections[collection]} WHERE id = ?`;
      this.db.prepare(sql).run(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * List all documents in a collection
   */
  async list(collection, options = {}) {
    try {
      const limit = options.limit || 100;
      const offset = options.offset || 0;

      const sql = `
        SELECT data
        FROM ${this.collections[collection]}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `;

      const results = this.db.prepare(sql).all(limit, offset);
      return results.map(row => JSON.parse(row.data));
    } catch (error) {
      console.error(`Failed to list ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute a query with filters
   */
  async query(collection, filters = {}) {
    try {
      const allDocs = await this.list(collection, { limit: 10000 });

      // Apply filters
      let filtered = allDocs;
      for (const [key, value] of Object.entries(filters)) {
        filtered = filtered.filter(doc => {
          if (typeof value === 'function') {
            return value(doc[key]);
          }
          return doc[key] === value;
        });
      }

      return filtered;
    } catch (error) {
      console.error(`Failed to query ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db && this.db.close) {
      this.db.close();
      console.log('✓ Database connection closed');
    }
  }
}

module.exports = HackathonDatabase;
