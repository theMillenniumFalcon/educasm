export interface Message {
    type: 'user' | 'ai';
    content?: string;
    topics?: Array<{
        topic: string;
        type: string;
        reason: string;
    }>;
    questions?: Array<{
        question: string;
        type: string;
        context: string;
    }>;
}