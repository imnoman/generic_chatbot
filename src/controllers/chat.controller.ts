import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

const chatService = new ChatService();

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, threadId, model } = req.body;

    if (!question) return res.status(400).json({ error: 'Missing question' });

    const { answer, newThreadId } = await chatService.handleQuestion(question, threadId, model);

    return res.json({
      answer,
      threadId: newThreadId,
    });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
};
