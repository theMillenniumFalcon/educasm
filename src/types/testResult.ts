export interface TestResult {
    topic: string;
    examType: 'JEE' | 'NEET';
    score: number;
    predictedRank: number;
    date: string;
}