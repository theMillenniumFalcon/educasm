export interface Question {
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: {
        correct: string;
        key_point: string;
    };
    difficulty: number;
    topic: string;
    subtopic: string;
    questionType: string;
    ageGroup: string;
}