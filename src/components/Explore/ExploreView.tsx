import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SearchBar } from '../shared/SearchBar';
import { GPTService } from '../../services/gpt';
import { RelatedTopics } from './RelatedTopics';
import { RelatedQuestions } from './RelatedQuestions';
import { LoadingAnimation } from '../shared/LoadingAnimation';
import { MarkdownComponents } from '../../utils/markdown';
import { UserContext, StreamChunkResponse, Message } from "../../types";

interface ExploreViewProps {
  initialQuery?: string;
  onError: (message: string) => void;
  onRelatedQueryClick?: (query: string) => void;
  userContext: UserContext;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ 
  initialQuery, 
  onError,
  onRelatedQueryClick,
  userContext
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInitialSearch, setShowInitialSearch] = useState(!initialQuery);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const gptService = useMemo(() => new GPTService(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add a ref for the messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // More reliable scroll to top function
  const scrollToTop = useCallback(() => {
    // First try window scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also try scrolling container if it exists
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Fallback with setTimeout to ensure scroll happens after render
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  }, []);

  // Call scroll on any message change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToTop();
    }
  }, [messages.length, scrollToTop]);

  // Add effect to listen for reset
  useEffect(() => {
    const handleReset = () => {
      setMessages([]);
      setShowInitialSearch(true);
    };

    window.addEventListener('resetExplore', handleReset);
    return () => window.removeEventListener('resetExplore', handleReset);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      // Scroll before starting the search
      scrollToTop();
      
      setIsLoading(true);
      setMessages([
        { type: 'user', content: query },
        { type: 'ai', content: '' }
      ]);

      setShowInitialSearch(false);

      await gptService.streamExploreContent(
        query,
        userContext,
        (chunk: StreamChunkResponse) => {
          setMessages([
            { type: 'user', content: query },
            {
              type: 'ai',
              content: chunk.text,
              topics: chunk.topics,
              questions: chunk.questions
            }
          ]);
        }
      );
    } catch (error) {
      console.error('Search error:', error);
      onError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [gptService, onError, userContext, scrollToTop]);

  const handleRelatedQueryClick = useCallback((query: string) => {
    // Scroll before handling the click
    scrollToTop();
    
    if (onRelatedQueryClick) {
      onRelatedQueryClick(query);
    }
    handleSearch(query);
  }, [handleSearch, onRelatedQueryClick, scrollToTop]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col" ref={containerRef}>
      {showInitialSearch ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            What do you want to explore?
          </h1>
          
          <div className="w-full max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Enter what you want to explore..."
              centered={true}
              className="bg-gray-900/80"
            />
            
            <p className="text-sm text-gray-400 text-center mt-1">Press Enter to search</p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="text-sm text-gray-400">Try:</span>
              <button
                onClick={() => handleSearch("Quantum Physics")}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 
                  border border-purple-500/30 transition-colors text-xs sm:text-sm text-purple-300"
              >
                ⚛️ Quantum Physics
              </button>
              <button
                onClick={() => handleSearch("Machine Learning")}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                  border border-blue-500/30 transition-colors text-xs sm:text-sm text-blue-300"
              >
                🤖 Machine Learning
              </button>
              <button
                onClick={() => handleSearch("World History")}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 
                  border border-green-500/30 transition-colors text-xs sm:text-sm text-green-300"
              >
                🌍 World History
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div ref={messagesContainerRef} className="relative flex flex-col w-full">
          <div className="space-y-2 pb-16">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className="px-2 sm:px-4 w-full mx-auto"
              >
                <div className="max-w-3xl mx-auto">
                  {message.type === 'user' ? (
                    <div className="w-full">
                      <div className="flex-1 text-base sm:text-lg font-semibold text-gray-100">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex-1 min-w-0">
                        {!message.content && isLoading ? (
                          <div className="flex items-center space-x-2 py-2">
                            <LoadingAnimation />
                            <span className="text-sm text-gray-400">Thinking...</span>
                          </div>
                        ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                            components={{
                              ...MarkdownComponents,
                              p: ({ children }) => (
                                <p className="text-sm sm:text-base text-gray-300 my-1.5 leading-relaxed break-words">
                                  {children}
                                </p>
                              ),
                            }}
                            className="whitespace-pre-wrap break-words space-y-1.5"
                          >
                            {message.content || ''}
                      </ReactMarkdown>
                        )}

                        {message.topics && message.topics.length > 0 && (
                          <div className="mt-3">
                            <RelatedTopics
                              topics={message.topics}
                              onTopicClick={handleRelatedQueryClick}
                            />
                          </div>
                        )}

                        {message.questions && message.questions.length > 0 && (
                          <div className="mt-3">
                            <RelatedQuestions
                              questions={message.questions}
                              onQuestionClick={handleRelatedQueryClick}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div 
              ref={messagesEndRef}
              className="h-8 w-full"
              aria-hidden="true"
            />
          </div>

          <div className="fixed bottom-12 left-0 right-0 bg-gradient-to-t from-background 
            via-background to-transparent pb-1 pt-2 z-50">
            <div className="w-full px-2 sm:px-4 max-w-3xl mx-auto">
              <SearchBar
                onSearch={handleSearch} 
                placeholder="Ask a follow-up question..."
                centered={false}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 h-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ExploreView.displayName = 'ExploreView';