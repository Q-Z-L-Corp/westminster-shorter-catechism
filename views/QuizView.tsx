import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Trophy,
  HelpCircle,
  Volume2,
  StopCircle
} from 'lucide-react';
import { QuestionData, Language } from '../types';
import { UI_TEXT } from '../constants';
import { FormattedAnswer } from '../components/FormattedAnswer';
import { ScriptureList } from '../components/ScriptureList';
import { useSpeech } from '../hooks/useSpeech';

export const QuizView: React.FC<{
  data: QuestionData[];
  language: Language;
}> = ({ data, language }) => {
  const t = UI_TEXT[language];
  const { isSpeaking, speak, stop } = useSpeech(language);
  
  // State
  const [sessionQueue, setSessionQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, 'correct' | 'wrong'>>({});
  const [complete, setComplete] = useState(false);
  const [activeFootnote, setActiveFootnote] = useState<number | null>(null);

  // Initialize Session
  useEffect(() => {
    startNewSession();
  }, [data]);

  // Stop speech when navigating or flipping
  useEffect(() => {
    stop();
  }, [currentIndex, isFlipped, complete]);

  const startNewSession = () => {
    // Shuffle and pick 10 questions for a bite-sized session
    const indices = Array.from({ length: data.length }, (_, i) => i);
    const shuffled = indices.sort(() => 0.5 - Math.random()).slice(0, 10);
    setSessionQueue(shuffled);
    setCurrentIndex(0);
    setResults({});
    setComplete(false);
    setIsFlipped(false);
    setActiveFootnote(null);
  };

  const currentQuestionIdx = sessionQueue[currentIndex];
  const item = data[currentQuestionIdx];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flip if clicking interacting elements
    if ((e.target as HTMLElement).closest('button')) return;
    setIsFlipped(!isFlipped);
    setActiveFootnote(null);
  };

  const handleGrade = (result: 'correct' | 'wrong') => {
    setResults(prev => ({ ...prev, [currentQuestionIdx]: result }));
    
    if (currentIndex < sessionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setActiveFootnote(null);
    } else {
      setComplete(true);
    }
  };

  const handleNav = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false); // Reset to question side when navigating
      setActiveFootnote(null);
    } else if (direction === 'next' && currentIndex < sessionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setActiveFootnote(null);
    }
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      // For quiz, just read what is visible to avoid spoilers, or read both if flipped
      if (isFlipped) {
        speak(item.A);
      } else {
        speak(item.Q);
      }
    }
  };

  // Calculate Score
  const correctCount = Object.values(results).filter(r => r === 'correct').length;
  const totalAnswered = Object.keys(results).length;

  if (!item) return <div className="p-10 text-center text-slate-400">Loading Session...</div>;

  if (complete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in zoom-in-95 duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full border border-stone-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.quizComplete}</h2>
          <div className="text-5xl font-serif font-bold text-slate-900 mb-2">
            {Math.round((correctCount / sessionQueue.length) * 100)}%
          </div>
          <p className="text-slate-500 mb-8">
            {correctCount} correct out of {sessionQueue.length}
          </p>
          <button
            onClick={startNewSession}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
          >
            <RotateCcw size={18} />
            {t.restart}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 h-full flex flex-col min-h-[85vh]">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="text-sm font-bold text-slate-400 tracking-wider">
          {currentIndex + 1} / {sessionQueue.length}
        </div>
        <div className="flex gap-1">
          {sessionQueue.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-4 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-gold' : 
                results[sessionQueue[idx]] === 'correct' ? 'bg-green-400' :
                results[sessionQueue[idx]] === 'wrong' ? 'bg-red-300' :
                'bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-grow relative perspective-1000 group">
        <div 
          onClick={handleCardClick}
          className="relative w-full h-full min-h-[400px] bg-white rounded-3xl shadow-xl border border-stone-200 cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col"
        >
          
          {/* Audio Button floating top right */}
          <div className="absolute top-4 right-4 z-20">
             <button
              onClick={handleAudio}
              className={`p-3 rounded-full bg-white/80 backdrop-blur-sm border border-stone-100 shadow-sm transition-all hover:bg-white active:scale-95 ${isSpeaking ? 'text-gold animate-pulse ring-2 ring-gold/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="flex-grow flex flex-col p-8 sm:p-10 overflow-y-auto">
            {!isFlipped ? (
              // FRONT OF CARD
              <div className="flex-grow flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 font-serif font-bold text-2xl mb-8 border border-slate-100">
                  {item.Q.length > 50 ? 'Q' : '?'}
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-medium text-slate-800 leading-tight">
                  {item.Q}
                </h2>
                <div className="mt-12 text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <HelpCircle size={14} />
                  {t.tabToReviewAnswer}
                </div>
              </div>
            ) : (
              // BACK OF CARD
              <div className="flex-grow flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6 border-b border-stone-100 pb-4 pr-12">
                  <span className="flex-shrink-0 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-500">Q</span>
                  <p className="text-stone-500 font-medium pt-1">{item.Q}</p>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">
                    {t.answerLabel}
                  </div>
                  <FormattedAnswer 
                    text={item.A} 
                    onFootnoteClick={i => setActiveFootnote(prev => prev === i ? null : i)}
                    activeFootnote={activeFootnote}
                  />
                </div>

                <div className="mt-6">
                   <ScriptureList data={item} activeIndex={activeFootnote} language={language} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar (Inside Card) */}
          <div className="p-4 bg-stone-50 border-t border-stone-100">
            {!isFlipped ? (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="w-full py-4 bg-white border border-stone-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-gold/50 hover:text-gold transition-all shadow-sm"
              >
                {t.showAnswer}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade('wrong'); }}
                  className="flex flex-col items-center justify-center py-3 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all"
                >
                  <span className="text-sm font-bold">{t.missedIt}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGrade('correct'); }}
                  className="flex flex-col items-center justify-center py-3 bg-slate-900 border-2 border-slate-900 rounded-xl hover:bg-slate-800 text-white transition-all shadow-lg shadow-slate-200"
                >
                  <span className="text-sm font-bold">{t.gotIt}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls (Outside Card) */}
      <div className="flex items-center justify-between mt-6 px-4">
        <button 
          onClick={() => handleNav('prev')}
          disabled={currentIndex === 0}
          className="p-3 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">
          {isFlipped ? 'Answer' : 'Question'}
        </span>

        <button 
          onClick={() => handleNav('next')}
          disabled={currentIndex === sessionQueue.length - 1}
          className="p-3 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
};