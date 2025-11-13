/**
 * AgentDB Database Integration
 * Provides vector database storage and retrieval for hackathon data
 */

const { AgentDB } = require('agentdb');

class HackathonDatabase {
  constructor(config = {}) {
    this.config = {
      name: config.name || 'hackathon_dao',
      dimensions: config.dimensions || 1536,
      indexType: 'hnsw',
      distanceMetric: 'cosine',
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
      this.db = new AgentDB(this.config);
      await this.db.connect();

      // Create collections for each entity type
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
   * Create a collection if it doesn't exist
   */
  async createCollection(name) {
    try {
      const exists = await this.db.collectionExists(name);
      if (!exists) {
        await this.db.createCollection(name, {
          dimensions: this.config.dimensions,
          indexType: this.config.indexType
        });
      }
      return true;
    } catch (error) {
      console.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Insert a document with vector embedding
   */
  async insert(collection, document) {
    try {
      const embedding = await this.generateEmbedding(document);
      const result = await this.db.insert(this.collections[collection], {
        id: document.id || this.generateId(),
        vector: embedding,
        metadata: document,
        timestamp: Date.now()
      });
      return result;
    } catch (error) {
      console.error(`Failed to insert into ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Query documents by similarity
   */
  async search(collection, query, limit = 10) {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const results = await this.db.search(this.collections[collection], {
        vector: queryEmbedding,
        limit: limit,
        includeMetadata: true
      });
      return results;
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
      const result = await this.db.get(this.collections[collection], id);
      return result ? result.metadata : null;
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
      const embedding = await this.generateEmbedding(updated);

      await this.db.update(this.collections[collection], id, {
        vector: embedding,
        metadata: updated
      });

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
      await this.db.delete(this.collections[collection], id);
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
      const results = await this.db.list(this.collections[collection], {
        limit: options.limit || 100,
        offset: options.offset || 0
      });
      return results.map(r => r.metadata);
    } catch (error) {
      console.error(`Failed to list ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Generate embedding for a document
   * Uses simple text concatenation for now; in production, use proper embedding API
   */
  async generateEmbedding(data) {
    // Convert document to text representation
    const text = typeof data === 'string' ? data : JSON.stringify(data);

    // Simple hash-based embedding for demonstration
    // In production, use OpenAI, Cohere, or other embedding APIs
    const embedding = new Array(this.config.dimensions).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      embedding[i % this.config.dimensions] += charCode / 1000;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
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
      const allDocs = await this.list(collection, { limit: 1000 });

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
    if (this.db) {
      await this.db.close();
      console.log('✓ Database connection closed');
    }
  }
}

module.exports = HackathonDatabase;
