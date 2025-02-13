import { UserProgress } from "../../types";

export const STORAGE_KEYS = {
    USER_INFO: 'edu_ai_user_info',
    PROGRESS: 'edu_ai_progress',
    HISTORY: 'edu_ai_history'
} as const;

export const DEFAULT_VALUES: {
    PROGRESS: UserProgress;
    HISTORY_LIMIT: number;
 } = {
    PROGRESS: {
        level: 1,
        streak: 0,
        bestStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        testResults: [], // Now this will be mutable
        lastActive: new Date().toISOString()
    },
    HISTORY_LIMIT: 50
};