export interface ExploreResponse {
    content: string;
    relatedTopics: Array<{
        topic: string;
        type: string;
    }>;
    relatedQuestions: Array<{
        question: string;
        type: string;
        context: string;
    }>;
}