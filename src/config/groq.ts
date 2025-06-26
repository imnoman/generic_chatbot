// src/config/groq.ts
import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in the environment");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
