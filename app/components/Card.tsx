import React, { useState } from "react";
import {
	ChevronDown,
	ChevronUp,
	BookOpen,
	Volume2,
	StopCircle,
	Star,
} from "lucide-react";
import { QuestionData, Language } from "@/types";
import { UI_TEXT } from "@/app/constants";
import { FormattedAnswer } from "./FormattedAnswer";
import { ScriptureList } from "./ScriptureList";
import { useSpeech } from "../hooks/useSpeech";

export const Card: React.FC<{
	item: QuestionData;
	id: number;
	language: Language;
	expanded?: boolean;
	onToggle?: () => void;
	isBookmarked: boolean;
	onToggleBookmark: () => void;
}> = ({
	item,
	id,
	language,
	expanded = false,
	onToggle,
	isBookmarked,
	onToggleBookmark,
}) => {
	const [activeFootnote, setActiveFootnote] = useState<number | null>(null);
	const t = UI_TEXT[language];
	const { isSpeaking, speak, stop } = useSpeech(language);

	const handleFootnoteClick = (idx: number) => {
		setActiveFootnote((prev) => (prev === idx ? null : idx));
	};

	const handleAudio = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isSpeaking) {
			stop();
		} else {
			// Read Question then Answer
			speak(`${item.Q}. ${item.A}`);
		}
	};

	const handleBookmarkClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onToggleBookmark();
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-md">
			{/* Question Header */}
			<div
				onClick={onToggle}
				className="p-5 cursor-pointer bg-gradient-to-r from-white to-stone-50 hover:to-stone-100 transition-colors"
			>
				<div className="flex justify-between items-start gap-4">
					<div className="flex gap-4 flex-grow">
						<span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold font-serif text-sm border border-slate-200">
							{id}
						</span>
						<h3 className="text-lg font-medium text-slate-800 leading-snug pt-0.5">
							{item.Q}
						</h3>
					</div>

					<div className="flex items-center gap-1 flex-shrink-0">
						{/* Bookmark Button */}
						<button
							onClick={handleBookmarkClick}
							className={`p-2 rounded-full transition-all hover:bg-stone-200 active:scale-95 ${isBookmarked ? "text-gold" : "text-slate-300 hover:text-gold/60"}`}
							title="Bookmark"
						>
							<Star size={20} fill={isBookmarked ? "currentColor" : "none"} />
						</button>

						{/* Audio Button */}
						<button
							onClick={handleAudio}
							className={`p-2 rounded-full transition-all hover:bg-stone-200 active:scale-95 ${isSpeaking ? "text-gold animate-pulse" : "text-slate-400 hover:text-slate-600"}`}
							title="Listen"
						>
							{isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
						</button>

						<div className="text-slate-400 ml-1">
							{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
						</div>
					</div>
				</div>
			</div>

			{/* Expanded Answer Content */}
			{expanded && (
				<div className="px-5 pb-6 pt-0 animate-in fade-in duration-300">
					<div className="mt-2 pl-12 border-l-2 border-stone-100">
						<div className="text-xs font-bold text-gold uppercase tracking-widest mb-2">
							{t.answerLabel}
						</div>
						<FormattedAnswer
							text={item.A}
							onFootnoteClick={handleFootnoteClick}
							activeFootnote={activeFootnote}
						/>

						{/* Action Bar for Scriptural Proofs */}
						<div className="mt-4 flex flex-wrap gap-2">
							{/* If no specific footnote selected, show toggle to expand all */}
							{activeFootnote === null && item.S.length > 0 && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										setActiveFootnote(0);
									}}
									className="text-xs font-medium text-slate-500 hover:text-gold flex items-center gap-1 transition-colors"
								>
									<BookOpen size={14} />
									{t.viewScriptures}
								</button>
							)}
						</div>

						<ScriptureList
							data={item}
							activeIndex={activeFootnote}
							language={language}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
