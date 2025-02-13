export interface QuestionItem {
    text: string;
    type: 'curiosity' | 'mechanism' | 'causality' | 'innovation' | 'insight';
    detail: string;
}