import { SERVERLESS_FUNCTION_URL } from '../../constants';
import { TestQuestion, UserContext } from '../../types';
import { StreamChunkResponse, StreamState, Question } from '../../types';
import { QUESTION_CONFIG, TEST_CONSTANTS } from './constants';
import { handleStreamChunk, processTestQuestion, shuffleOptionsAndAnswer, validateQuestionFormat, validateTestQuestion } from './utils';

export class GPTService {
    async getPlaygroundQuestion(topic: string, level: number, userContext: UserContext): Promise<Question> {
        try {
            const selectedAspect = QUESTION_CONFIG.ASPECTS[
                Math.floor(Math.random() * QUESTION_CONFIG.ASPECTS.length)
            ];
            
            const response = await fetch(`${SERVERLESS_FUNCTION_URL}/api/chat/question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, level, selectedAspect, userContext })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch question');
            }
    
            const parsedContent = await response.json();
            const shuffled = shuffleOptionsAndAnswer(parsedContent);
            
            const formattedQuestion: Question = {
                text: shuffled.text || '',
                options: shuffled.options,
                correctAnswer: shuffled.correctAnswer,
                explanation: {
                    correct: shuffled.explanation?.correct || 'Correct answer explanation',
                    key_point: shuffled.explanation?.key_point || 'Key learning point'
                },
                difficulty: level,
                topic: topic,
                subtopic: parsedContent.subtopic || topic,
                questionType: 'conceptual',
                ageGroup: userContext.age.toString()
            };
    
            if (validateQuestionFormat(formattedQuestion)) {
                return formattedQuestion;
            }
    
            throw new Error('Generated question failed validation');
        } catch (error) {
            console.error('Question generation error:', error);
            throw new Error('Failed to generate valid question');
        }
    }

    async streamExploreContent(
        query: string,
        userContext: UserContext,
        onChunk: (content: StreamChunkResponse) => void
    ): Promise<void> {
        try {
            const response = await fetch(`${SERVERLESS_FUNCTION_URL}/api/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, userContext })
            });
    
            if (!response.ok) {
                throw new Error('Stream request failed');
            }
    
            const reader = response.body?.getReader();
                if (!reader) {
                throw new Error('No response body');
            }
    
            const state: StreamState = {
                mainContent: '',
                jsonContent: '',
                currentTopics: [],
                currentQuestions: [],
                isJsonSection: false
            };
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                await handleStreamChunk(chunk, state, onChunk);
            }
        } catch (error) {
            console.error('Streaming error:', error);
            throw new Error('Failed to stream content');
        }
    }

    async getTestQuestions(topic: string, examType: 'JEE' | 'NEET'): Promise<Question[]> {
        try {
            const response = await fetch(`${SERVERLESS_FUNCTION_URL}/api/chat/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, examType })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch test questions');
            }
    
            const data = await response.json();
            
            if (!data?.questions || !Array.isArray(data.questions)) {
                throw new Error('Invalid response structure');
            }
    
            const processedQuestions = data.questions.map((q: Partial<TestQuestion>, index: number) => 
                processTestQuestion(q, index, topic, examType)
            );
    
            const validQuestions = processedQuestions.filter((q: Partial<TestQuestion>) => validateTestQuestion(q));
    
            if (validQuestions.length >= TEST_CONSTANTS.MIN_VALID_QUESTIONS) {
                return validQuestions.slice(0, TEST_CONSTANTS.QUESTIONS_PER_TEST);
            }
    
            throw new Error(`Only ${validQuestions.length} valid questions generated`);
        } catch (error) {
            console.error('Test generation error:', error);
            throw new Error(`Failed to generate test questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}