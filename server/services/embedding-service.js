/**
 * Embedding Service
 *
 * Generates semantic embeddings using local LM Studio with nomic-embed-text-v1.5
 *
 * Requirements:
 * - LM Studio running on localhost:1234
 * - nomic-embed-text-v1.5-GGUF model loaded
 *
 * Model detection:
 * - Uses lms CLI if available to detect downloaded/loaded models
 * - Falls back to API endpoint check
 */

const lmstudioCli = require('./lmstudio-cli');

class EmbeddingService {
  constructor() {
    this.apiUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-nomic-embed-text-v1.5';
    this.dimensions = 768; // nomic-embed-text-v1.5 output dimension
    this.available = null;
    this.cliStatus = null;
  }

  /**
   * Check if embedding service is available (non-throwing)
   */
  async isAvailable() {
    const response = await fetch(`${this.apiUrl}/models`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      this.available = false;
      return false;
    }

    const data = await response.json();
    this.available = data.data.some(model =>
      model.id.includes('nomic-embed') || model.id.includes('embedding')
    );

    return this.available;
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Check availability if unknown
    if (this.available === null) {
      await this.isAvailable();
    }

    if (!this.available) {
      return null;
    }

    const response = await fetch(`${this.apiUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer not-needed'
      },
      body: JSON.stringify({
        model: this.model,
        input: text
      })
    });

    if (!response.ok) {
      console.log(`⚠️ Embedding generation failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddingsBatch(texts, options = {}) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    // Check availability if unknown
    if (this.available === null) {
      await this.isAvailable();
    }

    if (!this.available) {
      return [];
    }

    const batchSize = options.batchSize || 100;
    const allEmbeddings = [];

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      console.log(`📊 Generating embeddings ${i + 1}-${Math.min(i + batchSize, texts.length)} of ${texts.length}...`);

      const response = await fetch(`${this.apiUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer not-needed'
        },
        body: JSON.stringify({
          model: this.model,
          input: batch
        })
      });

      if (!response.ok) {
        console.log(`⚠️ Batch embedding failed: ${response.status}`);
        // Return partial results with nulls for failed batch
        allEmbeddings.push(...batch.map(() => null));
        continue;
      }

      const data = await response.json();
      const embeddings = data.data.map(item => item.embedding);
      allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) return 0;
    if (embedding1.length !== embedding2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Find most similar embeddings to a query embedding
   */
  findMostSimilar(queryEmbedding, embeddings, limit = 5) {
    if (!queryEmbedding || !embeddings || embeddings.length === 0) {
      return [];
    }

    const similarities = embeddings
      .filter(e => e.vector)
      .map((embedding, index) => ({
        index,
        similarity: this.cosineSimilarity(queryEmbedding, embedding.vector),
        data: embedding.data
      }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      apiUrl: this.apiUrl,
      model: this.model,
      dimensions: this.dimensions,
      available: this.available,
      cliStatus: this.cliStatus
    };
  }

  /**
   * Get comprehensive status including CLI detection
   */
  getFullStatus() {
    // Get CLI-based detection
    this.cliStatus = lmstudioCli.getEmbeddingStatus();

    return {
      apiUrl: this.apiUrl,
      model: this.model,
      dimensions: this.dimensions,
      available: this.available,
      cli: this.cliStatus,
      recommendation: this.cliStatus.recommendation
    };
  }

  /**
   * Get available embedding models from CLI
   */
  getAvailableModels() {
    const models = lmstudioCli.getAvailableModels();
    return {
      cliAvailable: models.available,
      embedding: models.embedding || [],
      error: models.error
    };
  }

  /**
   * Test connection to LM Studio
   */
  async testConnection() {
    // First check CLI status
    this.cliStatus = lmstudioCli.getEmbeddingStatus();

    const response = await fetch(`${this.apiUrl}/models`);

    if (!response.ok) {
      return {
        connected: false,
        error: 'Cannot connect to LM Studio. Make sure it is running on port 1234.',
        cli: this.cliStatus
      };
    }

    const data = await response.json();
    const hasEmbeddingModel = data.data.some(model =>
      model.id.includes('nomic-embed') || model.id.includes('embedding')
    );

    this.available = hasEmbeddingModel;

    return {
      connected: true,
      models: data.data.map(m => m.id),
      hasEmbeddingModel,
      cli: this.cliStatus
    };
  }

  /**
   * Set the embedding model to use
   */
  setModel(modelName) {
    this.model = modelName;
    this.available = null; // Reset availability check
  }
}

// Singleton instance
let instance = null;

function getEmbeddingService() {
  if (!instance) {
    instance = new EmbeddingService();
  }
  return instance;
}

module.exports = { EmbeddingService, getEmbeddingService };
