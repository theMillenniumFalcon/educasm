import { OpenAI } from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TEST_PROMPTS } from '../../../src/services/gpt/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { topic, examType } = req.body;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: TEST_PROMPTS.getSystemPrompt(topic, examType) },
                { role: 'user', content: TEST_PROMPTS.getUserPrompt(topic, examType) }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response received');
        }

        return res.status(200).json(JSON.parse(content));
    } catch (error) {
        console.error('Error generating test questions:', error);
        return res.status(500).json({ error: 'Failed to generate test questions' });
    }
}
