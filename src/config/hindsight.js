import { HindsightClient } from '@vectorize-io/hindsight-client';
import { config } from './env.js';

/**
 * Factory function to create a new Hindsight client instance
 * @param {Object} options
 * @param {string} [options.apiKey]
 * @param {string} [options.baseUrl]
 * @returns {HindsightClient}
 */
export const createHindsightClient = (options = {}) => {
  const apiKey = options.apiKey || config.hindsightApiKey;
  const baseUrl = options.baseUrl || config.hindsightBaseUrl;

  const clientOptions = {
    apiKey,
    ...(baseUrl && { baseUrl }),
    ...options,
  };

  return new HindsightClient(clientOptions);
};

/**
 * Singleton Hindsight client instance initialized with HINDSIGHT_API_KEY
 */
export const hindsightClient = createHindsightClient();

/**
 * Helper to check if Hindsight API key is configured
 * @returns {boolean}
 */
export const isHindsightConfigured = () => {
  return Boolean(config.hindsightApiKey && config.hindsightApiKey.trim().length > 0);
};

export default hindsightClient;
