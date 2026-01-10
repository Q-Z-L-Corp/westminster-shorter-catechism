"use client";

import { Send, Bot } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuestionData } from "../../types";
import { Language } from "../../types";
import { Card } from "../components/Card";

interface AiViewProps {
	data: QuestionData[];
	language: Language;
}

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface MessageRendererProps {
	message: Message;
	data: QuestionData[];
	language: Language;
}

function MessageRenderer({ message, data, language }: MessageRendererProps) {
	if (message.role === "user") {
		return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
	}

	// For assistant messages, parse for question references and render with markdown
	const parts = parseMessageForQuestions(message.content, data);

	return (
		<div className="text-sm space-y-4">
			{parts.map((part, index) => {
				if (part.type === "text") {
					return (
						<div
							key={index}
							className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-ul:text-slate-700 prose-ol:text-slate-700"
						>
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									p: ({ children }) => (
										<p className="mb-2 last:mb-0">{children}</p>
									),
									ul: ({ children }) => (
										<ul className="list-disc list-inside mb-2 space-y-1">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="list-decimal list-inside mb-2 space-y-1">
											{children}
										</ol>
									),
									li: ({ children }) => (
										<li className="text-slate-700">{children}</li>
									),
									strong: ({ children }) => (
										<strong className="font-semibold text-slate-900">
											{children}
										</strong>
									),
									em: ({ children }) => (
										<em className="italic text-slate-800">{children}</em>
									),
									code: ({ children }) => (
										<code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">
											{children}
										</code>
									),
									blockquote: ({ children }) => (
										<blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-2">
											{children}
										</blockquote>
									),
								}}
							>
								{part.content}
							</ReactMarkdown>
						</div>
					);
				} else if (part.type === "question" && part.questionId) {
					const questionData = data[part.questionId - 1];
					if (!questionData) return null;

					return (
						<div key={index} className="my-4">
							<Card
								item={questionData}
								id={part.questionId}
								language={language}
								expanded={true}
								isBookmarked={false}
								onToggleBookmark={() => {}}
							/>
						</div>
					);
				}
				return null;
			})}
		</div>
	);
}

function parseMessageForQuestions(
	content: string,
	data: QuestionData[],
): Array<{ type: "text" | "question"; content?: string; questionId?: number }> {
	const parts: Array<{
		type: "text" | "question";
		content?: string;
		questionId?: number;
	}> = [];
	let lastIndex = 0;

	// Regex to match question references like "Question 1", "Q1", "question #1", etc.
	const questionRegex = /(?:question\s*#?\s*(\d+)|q\s*(\d+)|#(\d+))/gi;

	let match;
	while ((match = questionRegex.exec(content)) !== null) {
		// Add text before the match
		if (match.index > lastIndex) {
			parts.push({
				type: "text",
				content: content.slice(lastIndex, match.index),
			});
		}

		// Extract question number
		const questionNum = parseInt(match[1] || match[2] || match[3]);
		if (questionNum && questionNum >= 1 && questionNum <= data.length) {
			parts.push({
				type: "question",
				questionId: questionNum,
			});
		} else {
			// If not a valid question number, treat as regular text
			parts.push({
				type: "text",
				content: match[0],
			});
		}

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		parts.push({
			type: "text",
			content: content.slice(lastIndex),
		});
	}

	// If no parts were created, return the whole content as text
	if (parts.length === 0) {
		return [{ type: "text", content }];
	}

	return parts;
}

export function AiView({ data, language }: AiViewProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			role: "assistant",
			content:
				language === "en"
					? "Hello! I'm an AI assistant powered by Gemini 3. I can help you understand the Westminster Shorter Catechism. Ask me any questions about the catechism, theology, or related topics!"
					: "你好！我是由 Gemini 3 驱动的 AI 助手。我可以帮助你理解威斯敏斯特小要理问答。请问我任何关于要理问答、神学或相关主题的问题！",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = { role: "user", content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			// Call our API route
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: input, language }),
			});

			if (!response.ok) {
				throw new Error("API request failed");
			}

			const data = await response.json();
			const assistantMessage: Message = {
				role: "assistant",
				content: data.response,
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			const errorMessage: Message = {
				role: "assistant",
				content:
					language === "en"
						? "Sorry, I encountered an error. Please try again."
						: "抱歉，我遇到了一个错误。请重试。",
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
						<Bot className="text-white" size={20} />
					</div>
					<div>
						<h2 className="font-serif font-bold text-xl text-slate-800">
							{language === "en" ? "AI Assistant" : "AI助手"}
						</h2>
						<p className="text-sm text-slate-600">
							{language === "en" ? "Powered by Gemini 3" : "由 Gemini 3 驱动"}
						</p>
					</div>
				</div>

				{/* Chat Messages */}
				<div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[80%] rounded-lg px-4 py-3 ${
									message.role === "user"
										? "bg-blue-500 text-white"
										: "bg-stone-100 text-slate-800"
								}`}
							>
								<MessageRenderer
									message={message}
									data={data}
									language={language}
								/>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-stone-100 text-slate-800 rounded-lg px-4 py-3">
								<p className="text-sm">
									{language === "en" ? "Thinking..." : "思考中..."}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Input */}
				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder={
							language === "en"
								? "Ask a question about the Westminster Shorter Catechism..."
								: "询问关于威斯敏斯特小要理问答的问题..."
						}
						className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={isLoading}
					/>
					<button
						onClick={handleSend}
						disabled={!input.trim() || isLoading}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						<Send size={16} />
						<span className="hidden sm:inline">
							{language === "en" ? "Send" : "发送"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
