// import { openai } from '../config/openai';

// export class ChatService {
//   private defaultAssistantId = process.env.ASSISTANT_ID!;

//   async handleQuestion(question: string, threadId?: string, model?: string): Promise<{ answer: string, newThreadId: string }> {
//     const assistantId = model || this.defaultAssistantId;

//     // If no threadId, create a new thread
//     const thread = threadId
//       ? { id: threadId }
//       : await openai.beta.threads.create();

//     // Add user message
//     await openai.beta.threads.messages.create(thread.id, {
//       role: 'user',
//       content: question
//     });

//     // Run assistant
//     const run = await openai.beta.threads.runs.create(thread.id, {
//       assistant_id: assistantId,
//       stream: false
//     });

//     // Wait for completion
//     let status = run.status;
//     const timeout = Date.now() + 30000;

//     while (!['completed', 'failed', 'cancelled'].includes(status)) {
//       if (Date.now() > timeout) throw new Error('Run timed out');
//       await new Promise(r => setTimeout(r, 1000));
//       const currentRun = await openai.beta.threads.runs.retrieve(
//         run.id,
//         { thread_id: thread.id }
//       );
//       status = currentRun.status;
//     }

//     // Fetch assistant message
//     const messages = await openai.beta.threads.messages.list(thread.id, { limit: 1, order: 'desc' });
//     const lastMessage = messages.data[0];
//     const answer = lastMessage?.content?.map(c => (c.type === 'text' ? (c as any).text.value : '')).join('\n') || 'No answer received';

//     return { answer, newThreadId: thread.id };
//   }
// }

// Updated chatService.ts

import { openai } from '../config/openai';
import { claudeClient } from '../config/claude';
import { ModelRegistry, SupportedModel } from '../config/models';
import { groq } from '../config/groq';

export class ChatService {
  private defaultModel: SupportedModel = 'openai_assistant';

  async handleQuestion(question: string, threadId?: string, model?: SupportedModel): Promise<{ answer: string, newThreadId?: string }> {
    const selectedModel = model || this.defaultModel;

    switch (selectedModel) {
      case 'openai_assistant':
        return this.handleOpenAI(question, threadId);

      case 'claude':
        return this.handleClaude(question);

      case 'groq':
        return this.askGroq(question);

      default:
        throw new Error(`Unsupported model: ${selectedModel}`);
    }
  }
  private async askGroq(question: string): Promise<{ answer: string; newThreadId: string }> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant', // or 'llama3-70b-8192' etc.
    messages: [
      { role: 'user', content: question }
    ],
  });

  const answer = completion.choices[0]?.message?.content || 'No response from Groq';
  return { answer, newThreadId: '' }; // Groq doesn’t have threads
}


  private async handleOpenAI(question: string, threadId?: string): Promise<{ answer: string, newThreadId: string }> {
    const assistantId = process.env.ASSISTANT_ID!;

    const thread = threadId ? { id: threadId } : await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: question,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      stream: false,
    });

    let status = run.status;
    const timeout = Date.now() + 30000;

    while (!['completed', 'failed', 'cancelled'].includes(status)) {
      if (Date.now() > timeout) throw new Error('Run timed out');
      await new Promise(r => setTimeout(r, 1000));
      const currentRun = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      status = currentRun.status;
    }

    const messages = await openai.beta.threads.messages.list(thread.id, { limit: 1, order: 'desc' });
    const lastMessage = messages.data[0];
    const answer = lastMessage?.content?.map(c => (c.type === 'text' ? (c as any).text.value : '')).join('\n') || 'No answer received';

    return { answer, newThreadId: thread.id };
  }

  private async handleClaude(question: string): Promise<{ answer: string }> {
    const completion = await claudeClient.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    const firstBlock = completion.content?.[0];
const answer = firstBlock && firstBlock.type === 'text' ? firstBlock.text : 'No response from Claude';

    return { answer };
  }
}
