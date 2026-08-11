import { hindsightClient, isHindsightConfigured } from '../config/hindsight.js';
import { config } from '../config/env.js';

class HindsightService {
  constructor(client = hindsightClient) {
    this.client = client;
    this.defaultBankId = config.hindsightBankId;
  }

  /**
   * Retain a memory into Hindsight
   * @param {Object} params
   * @param {string} [params.bankId]
   * @param {string} params.content
   * @param {string} [params.context]
   * @param {Object} [params.metadata]
   * @param {string[]} [params.tags]
   * @param {Object} [params.options]
   */
  async retain({ bankId = this.defaultBankId, content, context, metadata, tags, ...options }) {
    if (!isHindsightConfigured()) {
      if (config.isDevelopment) {
        console.log(`[Hindsight] (Simulated Retain) Bank: ${bankId}, Content: "${content.slice(0, 60)}..."`);
      }
      return {
        status: 'simulated',
        message: 'HINDSIGHT_API_KEY is not configured. Retain simulated in development mode.',
        bankId,
        contentLength: content.length,
        tags: tags || [],
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await this.client.retain(bankId, content, {
        context,
        metadata,
        tags,
        ...options,
      });
    } catch (error) {
      console.error('[Hindsight Error] Failed to retain memory:', error.message);
      throw error;
    }
  }

  /**
   * Recall memories from Hindsight
   * @param {Object} params
   * @param {string} [params.bankId]
   * @param {string} params.query
   * @param {number} [params.maxTokens]
   * @param {string[]} [params.tags]
   * @param {Object} [params.options]
   */
  async recall({ bankId = this.defaultBankId, query, maxTokens, tags, ...options }) {
    if (!isHindsightConfigured()) {
      if (config.isDevelopment) {
        console.log(`[Hindsight] (Simulated Recall) Bank: ${bankId}, Query: "${query}"`);
      }
      return {
        status: 'simulated',
        message: 'HINDSIGHT_API_KEY is not configured. Recall simulated in development mode.',
        bankId,
        query,
        memories: [],
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await this.client.recall(bankId, query, {
        maxTokens,
        tags,
        ...options,
      });
    } catch (error) {
      console.error('[Hindsight Error] Failed to recall memory:', error.message);
      throw error;
    }
  }

  /**
   * Reflect on memory / mental models in Hindsight
   * @param {Object} params
   * @param {string} [params.bankId]
   * @param {string} params.query
   * @param {Object} [params.options]
   */
  async reflect({ bankId = this.defaultBankId, query, ...options }) {
    if (!isHindsightConfigured()) {
      if (config.isDevelopment) {
        console.log(`[Hindsight] (Simulated Reflect) Bank: ${bankId}, Query: "${query}"`);
      }
      return {
        status: 'simulated',
        message: 'HINDSIGHT_API_KEY is not configured. Reflect simulated in development mode.',
        bankId,
        query,
        reflection: 'Simulated reflection response.',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      return await this.client.reflect(bankId, query, options);
    } catch (error) {
      console.error('[Hindsight Error] Failed to reflect memory:', error.message);
      throw error;
    }
  }
}

export const hindsightService = new HindsightService();
