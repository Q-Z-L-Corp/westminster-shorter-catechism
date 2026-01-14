export interface ScriptureRef {
	T: string; // Title (e.g., "Psalm 86")
	C: string; // Content (The verse text)
}

export interface QuestionData {
	Q: string; // Question
	A: string; // Answer
	S: ScriptureRef[][]; // 2D array of scriptures corresponding to footnotes
}

export type Language = "en" | "zh";

export interface AppState {
	view: "browse" | "quiz";
	language: Language;
	searchQuery: string;
	bookmarkedIds: number[];
}

export enum QuizState {
	IDLE = "IDLE",
	ACTIVE = "ACTIVE",
	REVEALED = "REVEALED",
	COMPLETE = "COMPLETE",
}

export interface ChatMessage {
	role: "user" | "model";
	text: string;
}

export interface ChatHistory {
	role: string;
	parts: { text: string }[];
}
