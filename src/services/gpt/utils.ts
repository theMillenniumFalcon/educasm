import { Question, QuestionItem, StreamChunkResponse, StreamState, TestQuestion, TopicItem } from "../../types";
import { TEST_CONSTANTS } from "./constants";

export const handleStreamChunk = async (
    content: string,
    state: StreamState,
    onChunk: (content: StreamChunkResponse) => void
): Promise<void> => {
    if (content.includes('---')) {
        state.isJsonSection = true;
        return;
    }

    if (state.isJsonSection) {
        state.jsonContent += content;
        tryParseAndUpdateJson(state, onChunk);
    } else {
        state.mainContent += content;
        onChunk({
            text: state.mainContent.trim(),
            topics: state.currentTopics.length > 0 ? state.currentTopics : undefined,
            questions: state.currentQuestions.length > 0 ? state.currentQuestions : undefined
        });
    }
};

export const tryParseAndUpdateJson = (
    state: StreamState,
    onChunk: (content: StreamChunkResponse) => void
): void => {
    try {
        if (state.jsonContent.includes('}')) {
            const jsonStr = state.jsonContent.trim();
            if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
                const parsed = JSON.parse(jsonStr);
                updateTopicsAndQuestions(parsed, state, onChunk);
            }
        }
    } catch (error) {
        console.debug('JSON parse error:', error);
    }
};

export const updateTopicsAndQuestions = (
    parsed: { topics?: TopicItem[]; questions?: QuestionItem[] },
    state: StreamState,
    onChunk: (content: StreamChunkResponse) => void
): void => {
        if (parsed.topics?.length) {
        parsed.topics.forEach((topic) => {
            if (!state.currentTopics.some((t) => t.topic === topic.name)) {
                state.currentTopics.push({
                    topic: topic.name,
                    type: topic.type,
                    reason: topic.detail
                });
            }
        });
        }

        if (parsed.questions?.length) {
        parsed.questions.forEach((question) => {
            if (!state.currentQuestions.some((q) => q.question === question.text)) {
                state.currentQuestions.push({
                    question: question.text,
                    type: question.type,
                    context: question.detail
                });
            }
        });
        }

    onChunk({
        text: state.mainContent.trim(),
        topics: state.currentTopics.length > 0 ? state.currentTopics : undefined,
        questions: state.currentQuestions.length > 0 ? state.currentQuestions : undefined
    });
};

export const validateQuestionFormat = (question: Question): boolean => {
    try {
      // Basic validation
        if (!question.text?.trim()) return false;
        if (!Array.isArray(question.options) || question.options.length !== 4) return false;
        if (question.options.some(opt => !opt?.trim())) return false;
        if (typeof question.correctAnswer !== 'number' || 
            question.correctAnswer < 0 || 
            question.correctAnswer > 3) return false;
    
        // Explanation validation
        if (!question.explanation?.correct?.trim() || 
            !question.explanation?.key_point?.trim()) return false;
    
        // Additional validation
        if (question.text.length < 10) return false;  // Too short
        if (question.options.length !== new Set(question.options).size) return false; // Duplicates
        if (question.explanation.correct.length < 5 || 
            question.explanation.key_point.length < 5) return false; // Too short explanations
    
        return true;
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
};

export const shuffleOptionsAndAnswer = (question: Question): Question => {
    // Create array of option objects with original index
    const optionsWithIndex = question.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === question.correctAnswer
    }));

    // Shuffle the options
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }

    // Find new index of correct answer
    const newCorrectAnswer = optionsWithIndex.findIndex(opt => opt.isCorrect);

    return {
        ...question,
        options: optionsWithIndex.map(opt => opt.text),
        correctAnswer: newCorrectAnswer
    };
};

export const validateTestQuestion = (question: Partial<TestQuestion>): boolean => {
    return !!(
        validateQuestionFormat(question as Question) &&
        question.examType &&
        ['JEE', 'NEET'].includes(question.examType)
    );
};

export const processTestQuestion = (
    question: Partial<TestQuestion>,
    index: number,
    topic: string,
    examType: 'JEE' | 'NEET'
): TestQuestion => {
    const difficulty = Math.floor(index / TEST_CONSTANTS.QUESTIONS_PER_DIFFICULTY) + 1;
    
    return {
        text: question.text || '',
        options: Array.isArray(question.options) ? question.options : [],
        correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
        explanation: {
            correct: question.explanation || '',
            key_point: `Key concept for ${topic} question ${index + 1}`
        },
        difficulty,
        topic,
        subtopic: question.subtopic || `${topic} Concept ${index + 1}`,
        examType,
        questionType: 'conceptual',
        ageGroup: TEST_CONSTANTS.AGE_GROUP
        } as TestQuestion;
};