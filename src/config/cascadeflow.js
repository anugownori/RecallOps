import { CascadeAgent } from '@cascadeflow/core';
import { config } from './env.js';

/**
 * Check if any LLM provider is configured for CascadeFlow
 * @returns {boolean}
 */
export const isCascadeflowConfigured = () => {
  return Boolean(
    (config.groqApiKey && config.groqApiKey.trim().length > 0) ||
    (config.openaiApiKey && config.openaiApiKey.trim().length > 0) ||
    (config.anthropicApiKey && config.anthropicApiKey.trim().length > 0)
  );
};

/**
 * Factory function to create a configured CascadeAgent instance.
 * Prefers Groq when GROQ_API_KEY is set for ultra-fast speculative routing.
 * @param {Object} [options]
 * @returns {CascadeAgent | null}
 */
export const createCascadeAgent = (options = {}) => {
  if (!isCascadeflowConfigured() && !options.force) {
    return null;
  }

  const models = [];

  // Prefer Groq when GROQ_API_KEY is set (Ultra-fast drafter / verifier)
  if (config.groqApiKey || options.groqApiKey) {
    const apiKey = options.groqApiKey || config.groqApiKey;
    models.push({
      name: 'llama-3.1-8b-instant',
      provider: 'groq',
      cost: 0.00005,
      apiKey,
    });
    models.push({
      name: 'llama-3.3-70b-versatile',
      provider: 'groq',
      cost: 0.00069,
      apiKey,
    });
  }

  // Add OpenAI provider models if available
  if (config.openaiApiKey || options.openaiApiKey) {
    const apiKey = options.openaiApiKey || config.openaiApiKey;
    models.push({
      name: 'gpt-4o-mini',
      provider: 'openai',
      cost: 0.00015,
      apiKey,
    });
    models.push({
      name: 'gpt-4o',
      provider: 'openai',
      cost: 0.0025,
      apiKey,
    });
  }

  // Add Anthropic provider models if available
  if (config.anthropicApiKey || options.anthropicApiKey) {
    const apiKey = options.anthropicApiKey || config.anthropicApiKey;
    models.push({
      name: 'claude-3-5-haiku-20241022',
      provider: 'anthropic',
      cost: 0.001,
      apiKey,
    });
    models.push({
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      cost: 0.003,
      apiKey,
    });
  }

  if (models.length === 0) {
    return null;
  }

  return new CascadeAgent({
    models,
    cascade: {
      maxBudget: options.budgetUsd || config.cascadeBudgetUsd,
      trackCosts: true,
      trackMetrics: true,
      ...options.cascade,
    },
    ...options,
  });
};

/**
 * Singleton CascadeAgent instance
 */
export const cascadeAgent = createCascadeAgent();

export default cascadeAgent;
