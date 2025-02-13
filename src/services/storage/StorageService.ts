import { UserInfo, UserProgress, TestResult, HistoryItem } from '../../types';
import { STORAGE_KEYS, DEFAULT_VALUES } from './constants';
import { safelyParseJSON, safelyStringifyJSON } from './utils';

export class StorageService {
  // User Info Methods
    saveUserInfo(info: UserInfo): void {
        localStorage.setItem(
        STORAGE_KEYS.USER_INFO,
        safelyStringifyJSON(info)
        );
    }

    getUserInfo(): UserInfo | null {
        const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        return safelyParseJSON<UserInfo | null>(data, null);
    }

    hasUser(): boolean {
        return !!this.getUserInfo();
    }

    // Progress Methods
    saveProgress(progress: UserProgress): void {
        localStorage.setItem(
        STORAGE_KEYS.PROGRESS,
        safelyStringifyJSON(progress)
        );
    }

    getProgress(): UserProgress {
        const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        const defaultProgress: UserProgress = {
            ...DEFAULT_VALUES.PROGRESS,
            testResults: [...DEFAULT_VALUES.PROGRESS.testResults]
        };
        return safelyParseJSON<UserProgress>(data, defaultProgress);
    }

    updateProgress(updates: Partial<UserProgress>): void {
        const current = this.getProgress();
        this.saveProgress({ ...current, ...updates });
    }

    // Test Result Methods
    addTestResult(result: TestResult): void {
        const progress = this.getProgress();
        progress.testResults.push(result);
        this.saveProgress(progress);
    }

    getTestResults(): TestResult[] {
        return this.getProgress().testResults;
    }

    // History Methods
    addToHistory(topic: string): void {
        const history = this.getHistory();
        const newHistoryItem: HistoryItem = {
        topic,
        timestamp: new Date().toISOString()
        };

        history.unshift(newHistoryItem);
        
        // Keep only last N items
        if (history.length > DEFAULT_VALUES.HISTORY_LIMIT) {
        history.pop();
        }
        
        localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        safelyStringifyJSON(history)
        );
    }

    getHistory(): HistoryItem[] {
        const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
        return safelyParseJSON<HistoryItem[]>(data, []);
    }

    // Analytics Methods
    getAnalytics() {
        const progress = this.getProgress();
        return {
        accuracy: progress.totalQuestions > 0 
            ? (progress.correctAnswers / progress.totalQuestions) * 100 
            : 0,
        totalQuestions: progress.totalQuestions,
        currentStreak: progress.streak,
        bestStreak: progress.bestStreak,
        level: progress.level,
        testResults: progress.testResults,
        lastActive: progress.lastActive
        };
    }

    // Utility Methods
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }
}