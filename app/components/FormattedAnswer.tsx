import React from "react";

export const FormattedAnswer: React.FC<{
	text: string;
	onFootnoteClick: (index: number) => void;
	activeFootnote: number | null;
}> = ({ text, onFootnoteClick, activeFootnote }) => {
	// Split by brackets, e.g. "Text [1] text [2]"
	const parts = text.split(/(\[\d+\])/g);

	return (
		<p className="text-lg leading-relaxed text-gray-800 font-serif">
			{parts.map((part, i) => {
				const match = part.match(/\[(\d+)\]/);
				if (match) {
					const index = parseInt(match[1]) - 1; // 0-based index for array
					const isActive = activeFootnote === index;
					return (
						<button
							key={i}
							onClick={(e) => {
								e.stopPropagation();
								onFootnoteClick(index);
							}}
							className={`
                inline-flex items-center justify-center 
                ml-1 -mt-2 align-super text-xs font-bold 
                w-5 h-5 rounded-full transition-all duration-200
                ${
									isActive
										? "bg-gold text-white scale-110"
										: "bg-gray-200 text-gray-600 hover:bg-gold/50 hover:text-white"
								}
              `}
						>
							{match[1]}
						</button>
					);
				}
				return <span key={i}>{part}</span>;
			})}
		</p>
	);
};
