import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { TEST_PROMPTS } from '../../../src/services/gpt/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'edge';

export default async function POST(req: Request) {
    const { topic, examType } = await req.json();
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { 
                    role: 'system', 
                    content: TEST_PROMPTS.getSystemPrompt(topic, examType)
                },
                { 
                    role: 'user', 
                    content: TEST_PROMPTS.getUserPrompt(topic, examType)
                }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response received');
        }

        return NextResponse.json(JSON.parse(content));
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to generate test questions' },
            { status: 500 }
        );
    }
}
