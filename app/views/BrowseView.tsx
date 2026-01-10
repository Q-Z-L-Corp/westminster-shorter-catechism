import { Search, Star } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { UI_TEXT } from "../constants";
import { Language, QuestionData } from "../../types";

export const BrowseView: React.FC<{
	data: QuestionData[];
	language: Language;
	searchQuery: string;
	bookmarks: number[];
	onToggleBookmark: (id: number) => void;
}> = ({ data, language, searchQuery, bookmarks, onToggleBookmark }) => {
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
	const t = UI_TEXT[language];

	const filteredData = useMemo(() => {
		const q = searchQuery.toLowerCase();

		let result = data.map((item, idx) => ({ item, originalId: idx + 1 }));

		// Filter by bookmarks if enabled
		if (showBookmarkedOnly) {
			result = result.filter(({ originalId }) =>
				bookmarks.includes(originalId),
			);
		}

		// Filter by search query
		if (q) {
			result = result.filter(
				({ item, originalId }) =>
					item.Q.toLowerCase().includes(q) ||
					item.A.toLowerCase().includes(q) ||
					originalId.toString() === q,
			);
		}

		return result;
	}, [data, searchQuery, bookmarks, showBookmarkedOnly]);

	return (
		<div className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-24">
			{/* Filters Bar */}
			<div className="flex items-center justify-between mb-2">
				<div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
					{filteredData.length}{" "}
					{filteredData.length === 1 ? t.question : t.questions}
				</div>

				<button
					onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
					className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
            ${
							showBookmarkedOnly
								? "bg-gold text-white shadow-md"
								: "bg-white text-slate-500 border border-stone-200 hover:border-gold hover:text-gold"
						}
          `}
				>
					{showBookmarkedOnly ? (
						<Star size={14} fill="currentColor" />
					) : (
						<Star size={14} />
					)}
					{showBookmarkedOnly ? t.saved : t.viewAll}
				</button>
			</div>

			{filteredData.length === 0 ? (
				<div className="text-center py-20 text-slate-400">
					{showBookmarkedOnly ? (
						<>
							<Star size={48} className="mx-auto mb-4 opacity-20" />
							<p className="max-w-xs mx-auto">{t.emptySaved}</p>
						</>
					) : (
						<>
							<Search size={48} className="mx-auto mb-4 opacity-20" />
							<p>No questions found matching "{searchQuery}"</p>
						</>
					)}
				</div>
			) : (
				filteredData.map(({ item, originalId }) => (
					<Card
						key={originalId}
						id={originalId}
						item={item}
						language={language}
						expanded={expandedId === originalId}
						onToggle={() =>
							setExpandedId(expandedId === originalId ? null : originalId)
						}
						isBookmarked={bookmarks.includes(originalId)}
						onToggleBookmark={() => onToggleBookmark(originalId)}
					/>
				))
			)}
		</div>
	);
};
