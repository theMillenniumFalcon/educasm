import { ExploreResponse, Question, UserContext } from "../../types";
import { GPTService } from "../gpt";

export class APIService {
    private gptService: GPTService;

    constructor() {
        this.gptService = new GPTService();
    }

    private transformQuestion(rawQuestion: Question): Question {
        return {
            text: rawQuestion.text,
            options: rawQuestion.options,
            correctAnswer: rawQuestion.correctAnswer,
            explanation: rawQuestion.explanation,
            difficulty: rawQuestion.difficulty,
            ageGroup: rawQuestion.ageGroup,
            topic: rawQuestion.topic,
            subtopic: rawQuestion.subtopic || "",
            questionType: rawQuestion.questionType || "conceptual"
        };
    }

    async getQuestion(topic: string, level: number, userContext: UserContext): Promise<Question> {
        try {
            const question = await this.gptService.getPlaygroundQuestion(topic, level, userContext);
            return this.transformQuestion(question);
        } catch (error) {
            console.error("Question generation error:", error);
            throw new Error("Failed to generate question");
        }
    }

    async generateTest(topic: string, examType: 'JEE' | 'NEET'): Promise<Question[]> {
        try {
            console.log('API generateTest called with:', { topic, examType });
            const questions = await this.gptService.getTestQuestions(topic, examType);
            console.log('API received questions:', questions);
            return questions.map(q => this.transformQuestion(q));
        } catch (error) {
            console.error("Test generation error:", error);
            throw new Error("Failed to generate test");
        }
    }

    async explore(query: string, userContext: UserContext): Promise<ExploreResponse> {
        try {
            const response = await this.gptService.streamExploreContent(query, userContext, () => {});
            return response as unknown as ExploreResponse;
        } catch (error) {
            console.error("Explore error:", error);
            throw new Error("Failed to explore topic");
        }
    }
}