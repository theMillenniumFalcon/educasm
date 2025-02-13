export interface TopicItem {
    name: string;
    type: 'prerequisite' | 'extension' | 'application' | 'parallel' | 'deeper';
    detail: string;
}