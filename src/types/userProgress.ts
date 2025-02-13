import { TestResult } from "./testResult";

export interface UserProgress {
    level: number;
    streak: number;
    bestStreak: number;
    totalQuestions: number;
    correctAnswers: number;
    testResults: TestResult[];
    lastActive: string;
}