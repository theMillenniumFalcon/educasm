import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { QUESTION_TEMPLATES } from '../../../src/services/gpt/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'edge';

export default async function POST(req: Request) {
    const { topic, level, selectedAspect, userContext } = await req.json();

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { 
                    role: 'system', 
                    content: QUESTION_TEMPLATES.getSystemPrompt(topic, selectedAspect, level, userContext.age)
                },
                { 
                    role: 'user', 
                    content: QUESTION_TEMPLATES.getUserPrompt(topic, level, selectedAspect, userContext.age)
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
            { error: 'Failed to generate question' },
            { status: 500 }
        );
    }
}