import React from 'react';
import { QuestionData, Language } from '../types';
import { UI_TEXT } from '../constants';

export const ScriptureList: React.FC<{ 
  data: QuestionData; 
  activeIndex: number | null;
  language: Language;
}> = ({ data, activeIndex, language }) => {
  if (activeIndex === null) return null;
  const refs = data.S[activeIndex];
  const t = UI_TEXT[language];

  if (!refs) return null;

  return (
    <div className="mt-4 p-4 bg-paper border-l-4 border-gold rounded-r-md animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-sm font-bold text-gold-dark uppercase tracking-wider mb-2">
        {t.proofReference} [{activeIndex + 1}]
      </h4>
      <div className="space-y-3">
        {refs.map((ref, idx) => (
          <div key={idx}>
            <span className="font-semibold text-gray-900 block mb-1">{ref.T}</span>
            <span className="text-gray-600 font-serif italic text-sm leading-relaxed block">
              "{ref.C.trim()}"
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};