export interface StreamChunkResponse {
    text?: string;
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