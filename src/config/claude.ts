import Anthropic from '@anthropic-ai/sdk';

if (!process.env.CLAUDE_API_KEY) {
  throw new Error('CLAUDE_API_KEY is not set in environment');
}

export const claudeClient = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
