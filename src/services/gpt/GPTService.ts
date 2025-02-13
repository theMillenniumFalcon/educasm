import OpenAI from 'openai';
import { TestQuestion, TestResponse, UserContext } from '../../types';
import { StreamChunkResponse, StreamState, Question } from '../../types';
import { GPT_CONFIG, PROMPT_TEMPLATES, QUESTION_CONFIG, QUESTION_TEMPLATES, TEST_CONSTANTS, TEST_PROMPTS } from './constants';
import { handleStreamChunk, processTestQuestion, shuffleOptionsAndAnswer, validateQuestionFormat, validateTestQuestion } from './utils';

export class GPTService {
    private readonly openai: OpenAI;

    constructor() {
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is required');
        }

        this.openai = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });
    }

    private async makeRequest(systemPrompt: string, userPrompt: string, timeout: number): Promise<string> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
    
        try {
            const completion = await this.openai.chat.completions.create({
                model: GPT_CONFIG.MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: GPT_CONFIG.TEMPERATURE
            }, { signal: controller.signal });
        
            return completion.choices[0]?.message?.content || '';
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async getPlaygroundQuestion(topic: string, level: number, userContext: UserContext): Promise<Question> {
        try {
          // Randomly select an aspect to focus on
            const selectedAspect = QUESTION_CONFIG.ASPECTS[
                Math.floor(Math.random() * QUESTION_CONFIG.ASPECTS.length)
            ];
            
            const content = await this.makeRequest(
                QUESTION_TEMPLATES.getSystemPrompt(topic, selectedAspect, level, userContext.age),
                QUESTION_TEMPLATES.getUserPrompt(topic, level, selectedAspect, userContext.age),
                QUESTION_CONFIG.TIMEOUT
            );
            
            if (!content) {
                throw new Error('Empty response received');
            }
        
            let parsedContent: Question;
            try {
                parsedContent = JSON.parse(content);
            } catch (error) {
                console.error('JSON Parse Error:', error);
                throw new Error('Invalid JSON response');
            }
        
            // Randomly shuffle the options and adjust correctAnswer accordingly
            const shuffled = shuffleOptionsAndAnswer(parsedContent);
        
            // Validate and format the question
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
        let retryCount = 0;

        while (retryCount < GPT_CONFIG.MAX_RETRIES) {
        try {
            const stream = await this.openai.chat.completions.create({
            model: GPT_CONFIG.MODEL,
            messages: [
                { 
                    role: 'system', 
                    content: PROMPT_TEMPLATES.getSystemPrompt(userContext.age) 
                },
                { 
                    role: 'user', 
                    content: PROMPT_TEMPLATES.getUserPrompt(query, userContext.age) 
                }
            ],
            stream: true,
            temperature: GPT_CONFIG.TEMPERATURE
            });

            const state: StreamState = {
                mainContent: '',
                jsonContent: '',
                currentTopics: [],
                currentQuestions: [],
                isJsonSection: false
            };

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                await handleStreamChunk(content, state, onChunk);
            }

            return;
        } catch (error) {
            retryCount++;
            console.error(`API attempt ${retryCount} failed:`, error);

            if (retryCount === GPT_CONFIG.MAX_RETRIES) {
            throw new Error(
                `Failed to stream content after ${GPT_CONFIG.MAX_RETRIES} attempts. ${
                error instanceof Error ? error.message : 'Unknown error'
                }`
            );
            }

            await new Promise((resolve) =>
            setTimeout(resolve, GPT_CONFIG.BASE_DELAY * Math.pow(2, retryCount))
            );
        }
        }
    }

    async getTestQuestions(topic: string, examType: 'JEE' | 'NEET'): Promise<Question[]> {
        try {
            console.log('Generating test questions...');
            
            const content = await this.makeRequest(
                TEST_PROMPTS.getSystemPrompt(topic, examType),
                TEST_PROMPTS.getUserPrompt(topic, examType),
                TEST_CONSTANTS.TIMEOUT_MS
            );
        
            console.log('Received response from API');
        
            if (!content) {
                console.error('Empty response from API');
                throw new Error('No content received from API');
            }
        
            let parsed: TestResponse;
            try {
                parsed = JSON.parse(content);
                console.log('Successfully parsed JSON response');
            } catch (error) {
                console.error('JSON parse error:', error);
                console.log('Raw content:', content);
                throw new Error('Failed to parse API response');
            }
        
            if (!parsed?.questions || !Array.isArray(parsed.questions)) {
                console.error('Invalid response structure:', parsed);
                throw new Error('Invalid response structure');
            }
        
            console.log(`Received ${parsed.questions.length} questions`);
        
            const processedQuestions = parsed.questions.map((q: Partial<TestQuestion>, index: number) => 
                processTestQuestion(q, index, topic, examType)
            );
        
            console.log('Processed questions:', processedQuestions.length);
        
            const validQuestions = processedQuestions.filter(q => {
                const isValid = validateTestQuestion(q);
                if (!isValid) {
                console.log('Invalid question:', q);
                }
                return isValid;
            });
        
            console.log(`Valid questions: ${validQuestions.length}`);
        
            if (validQuestions.length >= TEST_CONSTANTS.MIN_VALID_QUESTIONS) {
                const finalQuestions = validQuestions.slice(0, TEST_CONSTANTS.QUESTIONS_PER_TEST);
                console.log(`Returning ${finalQuestions.length} questions`);
                return finalQuestions;
            }
        
            throw new Error(`Only ${validQuestions.length} valid questions generated`);
        } catch (error) {
            console.error('Test generation error:', error);
            throw new Error(
                `Failed to generate test questions: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}