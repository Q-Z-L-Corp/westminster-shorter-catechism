import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DATA_EN } from "../../data/wcs.en";
import { DATA_ZH } from "../../data/wcs.zh";
import { QuestionData } from "../../../types";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_SMART } from "../../constants";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 10000 } });

export async function POST(request: NextRequest) {
	try {
		const { query, language }: { query: string; language: "en" | "zh" } =
			await request.json();

		if (!query) {
			return NextResponse.json({ error: "Query is required" }, { status: 400 });
		}

		const data = language === "en" ? DATA_EN : DATA_ZH;

		// Find relevant questions
		const relevantQuestions = findRelevantQuestions(query, data);

		// Prepare context
		const context = prepareContext(relevantQuestions, language);

		const prompt =
			language === "en"
				? `You are a helpful AI assistant specializing in the Westminster Shorter Catechism. Use the provided context to answer questions accurately and helpfully. If the question cannot be answered from the context, say so politely and suggest looking at the catechism questions.

Context:
${context}

User Question: ${query}

Please provide a clear, accurate answer based on the catechism. Keep your response concise but informative.`
				: `你是一个专门研究威斯敏斯特小要理问答的有帮助的AI助手。使用提供的上下文准确而有帮助地回答问题。如果问题无法从上下文中回答，请礼貌地说出来并建议查看要理问答的问题。

上下文：
${context}

用户问题：${query}

请基于要理问答提供清晰、准确的答案。保持回答简洁但信息丰富。`;

		let result;
		try {
			result = await ai.models.generateContent({
				model: GEMINI_MODEL_SMART,
				contents: prompt,
			});
		} catch (error) {
			// Fallback to fast model if smart model fails (e.g., quota reached)
			result = await ai.models.generateContent({
				model: GEMINI_MODEL_FAST,
				contents: prompt,
			});
		}

		return NextResponse.json({ response: result.text });
	} catch (error) {
		console.error("Error in chat API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Helper function to find relevant questions
function findRelevantQuestions(
	query: string,
	data: QuestionData[],
): QuestionData[] {
	const lowerQuery = query.toLowerCase();
	const relevant: QuestionData[] = [];

	for (const question of data) {
		const questionText = question.Q.toLowerCase();
		const answerText = question.A.toLowerCase();

		// Simple keyword matching
		if (questionText.includes(lowerQuery) || answerText.includes(lowerQuery)) {
			relevant.push(question);
		}

		// Also check scriptures for additional context
		for (const scriptureGroup of question.S) {
			for (const scripture of scriptureGroup) {
				if (
					scripture.T.toLowerCase().includes(lowerQuery) ||
					scripture.C.toLowerCase().includes(lowerQuery)
				) {
					relevant.push(question);
					break;
				}
			}
		}

		// Limit to top 5 relevant questions
		if (relevant.length >= 5) break;
	}

	// Remove duplicates
	const unique = relevant.filter(
		(q, index, arr) => arr.findIndex((q2) => q2.Q === q.Q) === index,
	);

	// If no direct matches, return first few questions as general context
	if (unique.length === 0) {
		return data.slice(0, 3);
	}

	return unique.slice(0, 5);
}

// Prepare context string from relevant questions
function prepareContext(
	questions: QuestionData[],
	language: "en" | "zh",
): string {
	let context =
		language === "en"
			? "Here are relevant questions and answers from the Westminster Shorter Catechism:\n\n"
			: "以下是威斯敏斯特小要理问答中的相关问题和答案：\n\n";

	questions.forEach((q, index) => {
		context += `${index + 1}. Question: ${q.Q}\n`;
		context += `   Answer: ${q.A}\n\n`;
	});

	return context;
}
