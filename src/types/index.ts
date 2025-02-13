export * from "./userContext"
export * from "./question"
export * from "./streamChunkResponse"
export * from "./message"
export * from "./topicItem"
export * from "./questionItem"
export * from "./streamState"
export * from "./stats"
export * from "./topicProgress"
export * from "./testQuestion"
export * from "./testResponse"
export * from "./exploreResponse"
export * from "./testResult"
export * from "./userInfo"
export * from "./userProgress"
export * from "./historyItem"

export interface QuestionHistory {
  usedQuestions: Set<string>;
  lastLevel: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  topicStrength: number;
  usedContexts: Set<string>;
  usedConcepts: Set<string>;
  usedApplications: Set<string>;
  usedExamples: Set<string>;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}