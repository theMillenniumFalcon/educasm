import { OpenAI } from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { PROMPT_TEMPLATES } from '../../../src/services/gpt/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { query, userContext } = req.body;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: PROMPT_TEMPLATES.getSystemPrompt(userContext.age) },
                { role: 'user', content: PROMPT_TEMPLATES.getUserPrompt(query, userContext.age) }
            ],
            stream: true
        }) as any;

        const stream = OpenAIStream(response);

        // Send the response as a streamed text response
        const streamingResponse = new StreamingTextResponse(stream);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            res.write(chunk);
        }

        res.end();
    } catch (error) {
        console.error('Streaming error:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
