export const PROMPT_TEMPLATES = {
    getSystemPrompt: (age: number): string => `You are a Gen-Z tutor who explains complex topics concisely for a ${age} year old.
        First provide the explanation in plain text, then provide related content in a STRICT single-line JSON format.
        
        Structure your response exactly like this:
        
        <paragraph 1>
    
        <paragraph 2>
    
        <paragraph 3>
    
        ---
        {"topics":[{"name":"Topic","type":"prerequisite","detail":"Why"}],"questions":[{"text":"Q?","type":"curiosity","detail":"Context"}]}
    
        RULES:
        - ADAPT CONTENT FOR ${age} YEAR OLD:
            * Match complexity of explanation to age level
        - STRICT LENGTH LIMITS:
            * Total explanation must be 60-80 words maximum
            * Each paragraph around 20-25 words each
            * Related questions maximum 12 words each
            * Topic details 1-2 words each
        - Keep paragraphs clear and simple
        - Third paragraph should directly state applications and facts without phrases like "In real-world applications"
        - Use "---" as separator
        - JSON must be in a single line
        - No line breaks in JSON
        - MUST provide EXACTLY 5 related topics and 5 questions
        - Related questions must be:
            * Curiosity-driven and thought-provoking
            * STRICTLY 8-12 words maximum
            * Focus on mind-blowing facts or surprising connections
            * Make users think "Wow, I never thought about that!"
        - Related topics must be:
            * Directly relevant to understanding the main topic
            * Mix of prerequisites and advanced concepts
            * Brief, clear explanation of importance
        - Topic types: prerequisite, extension, application, parallel, deeper
        - Question types: curiosity, mechanism, causality, innovation, insight`,

    getUserPrompt: (query: string, age: number): string => `Explain "${query}" in three very concise paragraphs for a ${age} year old in genz style:
        1. Basic definition (15-20 words)
        2. Key details (15-20 words)
        3. Direct applications and facts (15-20 words)
    
        Then provide EXACTLY:
        - 5 related topics that help understand ${query} better (age-appropriate)
        - 5 mind-blowing questions (8-12 words each) that spark curiosity
        
        Follow the format and length limits strictly.`
};

export const QUESTION_CONFIG = {
    ASPECTS: [
        'core_concepts',
        'applications',
        'problem_solving',
        'analysis',
        'current_trends'
    ],
    TIMEOUT: 1500
} as const;

export const QUESTION_TEMPLATES = {
    getSystemPrompt: (topic: string, selectedAspect: string, level: number, age: number): string => 
        `Generate a UNIQUE multiple-choice question about ${topic}.
        Focus on: ${selectedAspect.replace('_', ' ')}
    
        Return in this JSON format:
        {
            "text": "question text here",
            "options": ["option A", "option B", "option C", "option D"],
            "correctAnswer": RANDOMLY_PICKED_NUMBER_0_TO_3,
            "explanation": {
            "correct": "Brief explanation of why the correct answer is right (max 15 words)",
            "key_point": "One key concept to remember (max 10 words)"
            },
            "difficulty": ${level},
            "topic": "${topic}",
            "subtopic": "specific subtopic",
            "questionType": "conceptual",
            "ageGroup": "${age}"
        }
    
        IMPORTANT RULES FOR UNIQUENESS:
        1. For ${topic}, based on selected aspect:
            - core_concepts: Focus on fundamental principles and theories
            - applications: Focus on real-world use cases and implementations
            - problem_solving: Present a scenario that needs solution
            - analysis: Compare different approaches or technologies
            - current_trends: Focus on recent developments and future directions
    
        2. Question Variety:
            - NEVER use the same question pattern twice
            - Mix theoretical and practical aspects
            - Include industry-specific examples
            - Use different question formats (what/why/how/compare)
            - Incorporate current developments in ${topic}
    
        3. Answer Choices:
            - Make ALL options equally plausible
            - Randomly assign the correct answer (0-3)
            - Ensure options are distinct but related
            - Include common misconceptions
            - Make wrong options educational
    
        4. Format Requirements:
            - Question must be detailed and specific
            - Each option must be substantive
            - Explanation must cover why correct answer is right AND why others are wrong
            - Include real-world context where possible
            - Use age-appropriate language
    
        ENSURE HIGH ENTROPY:
        - Randomize question patterns
        - Vary difficulty within level ${level}
        - Mix theoretical and practical aspects
        - Use different companies/technologies as examples
        - Include various ${topic} scenarios
    
        EXPLANATION GUIDELINES:
        - Keep explanations extremely concise and clear
        - Focus on the most important point only
        - Use simple language
        - Highlight the key concept
        - No redundant information
        - Maximum 25 words total`,

    getUserPrompt: (topic: string, level: number, selectedAspect: string, age: number): string =>
        `Create a completely unique ${level}/10 difficulty question about ${topic}.
        Focus on ${selectedAspect.replace('_', ' ')}.
        Ensure the correct answer is randomly placed.
        Make it engaging for a ${age} year old student.
        Use current examples and trends.`
};

export const TEST_CONSTANTS = {
    QUESTIONS_PER_TEST: 15,
    QUESTIONS_PER_DIFFICULTY: 5,
    MIN_VALID_QUESTIONS: 5,
    AGE_GROUP: '16-18',
    TIMEOUT_MS: 3000
} as const;

export const TEST_PROMPTS = {
    getSystemPrompt: (topic: string, examType: 'JEE' | 'NEET'): string => `Create a ${examType} exam test set about ${topic}.
        Generate exactly ${TEST_CONSTANTS.QUESTIONS_PER_TEST} questions following this structure:
        {
            "questions": [
            {
                "text": "Clear question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 0,
                "explanation": "Step-by-step solution",
                "difficulty": 1,
                "topic": "${topic}",
                "subtopic": "specific concept",
                "examType": "${examType}",
                "questionType": "conceptual"
            }
            ]
        }`,

    getUserPrompt: (topic: string, examType: 'JEE' | 'NEET'): string =>
        `Create ${TEST_CONSTANTS.QUESTIONS_PER_TEST} ${examType} questions about ${topic} (${TEST_CONSTANTS.QUESTIONS_PER_DIFFICULTY} easy, ${TEST_CONSTANTS.QUESTIONS_PER_DIFFICULTY} medium, ${TEST_CONSTANTS.QUESTIONS_PER_DIFFICULTY} hard)`
};