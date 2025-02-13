import { Question } from "./question";

export interface TestQuestion extends Question {
    examType: 'JEE' | 'NEET';
}