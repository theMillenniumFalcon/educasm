import React from "react"

interface MarkdownComponentProps {
    node?: any;
    children?: React.ReactNode;
    [key: string]: any;
}

export const MarkdownComponents: Record<string, React.FC<MarkdownComponentProps>> = {
    h1: ({ children, ...props }) => (
        <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mt-4 mb-2" {...props}>
        {children}
        </h1>
    ),
    h2: ({ children, ...props }) => (
        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-3 mb-2" {...props}>
        {children}
        </h2>
    ),
    h3: ({ children, ...props }) => (
        <h3 className="text-base sm:text-lg font-medium text-gray-200 mt-2 mb-1" {...props}>
        {children}
        </h3>
    ),
    p: ({ children, ...props }) => (
        <p className="text-sm sm:text-base text-gray-300 my-1.5 leading-relaxed 
        break-words" {...props}>
        {children}
        </p>
    ),
    ul: ({ children, ...props }) => (
        <ul className="list-disc list-inside my-2 text-gray-300" {...props}>
        {children}
        </ul>
    ),
    ol: ({ children, ...props }) => (
        <ol className="list-decimal list-inside my-2 text-gray-300" {...props}>
        {children}
        </ol>
    ),
    li: ({ children, ...props }) => (
        <li className="my-1 text-gray-300" {...props}>
        {children}
        </li>
    ),
    code: ({ children, inline, ...props }) => (
        inline ? 
        <code className="bg-gray-700 px-1 rounded text-xs sm:text-sm" {...props}>{children}</code> :
        <code className="block bg-gray-700 p-2 rounded my-2 text-xs sm:text-sm overflow-x-auto" {...props}>
            {children}
        </code>
    ),
    blockquote: ({ children, ...props }) => (
        <blockquote className="border-l-4 border-gray-500 pl-4 my-2 text-gray-400 italic" {...props}>
        {children}
        </blockquote>
    ),
};