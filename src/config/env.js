import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Hindsight Configuration
  hindsightApiKey: process.env.HINDSIGHT_API_KEY || '',
  hindsightBaseUrl: process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io',
  hindsightBankId: process.env.HINDSIGHT_BANK_ID || 'default-bank',

  // Cascadeflow LLM Providers & Configuration
  groqApiKey: process.env.GROQ_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  cascadeBudgetUsd: parseFloat(process.env.CASCADE_BUDGET_USD || '0.50'),

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
};

