import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter.chat('google/gemini-2.5-flash-preview-05-20'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}