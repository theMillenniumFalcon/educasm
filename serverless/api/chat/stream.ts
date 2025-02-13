import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { PROMPT_TEMPLATES } from '../../../src/services/gpt/constants';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'edge';

export default async function POST(req: Request) {
    const { query, userContext } = await req.json();

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
        { 
            role: 'system', 
            content: PROMPT_TEMPLATES.getSystemPrompt(userContext.age) 
        },
        { 
            role: 'user', 
            content: PROMPT_TEMPLATES.getUserPrompt(query, userContext.age) 
        }
        ],
        stream: true
    }) as any;

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}