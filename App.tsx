import {
  BookOpen,
  BrainCircuit,
  ScrollText,
  Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { UI_TEXT } from './constants';
import { DATA_EN } from './data/wcs.en';
import { DATA_ZH } from './data/wcs.zh';
import { Language } from './types';
import { BrowseView } from './views/BrowseView';
import { QuizView } from './views/QuizView';

function App() {
  // Load initial state from local storage
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('wcs_lang');
    return (saved === 'zh' || saved === 'en') ? saved : 'en';
  });

  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('wcs_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'browse' | 'quiz'>('browse');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine which dataset to use
  const data = language === 'en' ? DATA_EN : DATA_ZH;
  const t = UI_TEXT[language];

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('wcs_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('wcs_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const toggleBookmark = (id: number) => {
    setBookmarks(prev => 
      prev.includes(id) 
        ? prev.filter(b => b !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 font-sans selection:bg-gold/20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('browse')}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <ScrollText size={18} />
            </div>
            <h1 className="font-serif font-bold text-lg hidden sm:block tracking-tight text-slate-800">
              {t.appTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {view === 'browse' && (
              <div className="relative group mr-2">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 sm:w-64 pl-9 pr-4 py-1.5 rounded-full bg-stone-100 border-none text-sm focus:ring-2 focus:ring-gold/50 focus:bg-white transition-all placeholder:text-stone-400"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            )}
            
            <button 
              onClick={toggleLanguage}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-stone-100 rounded-full transition-colors"
              title="Switch Language"
            >
              <span className="font-bold text-xs border border-current rounded px-1 py-0.5">
                {language === "en" ? "中文" : "English"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">
        {view === 'browse' ? (
           <BrowseView 
             data={data} 
             language={language} 
             searchQuery={searchQuery} 
             bookmarks={bookmarks}
             onToggleBookmark={toggleBookmark}
           />
        ) : (
           <QuizView data={data} language={language} />
        )}
      </main>

      {/* Bottom Navigation (Mobile Styles) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl text-white px-1.5 py-1.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-1">
        <button
          onClick={() => {
            setView('browse');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            view === 'browse' ? 'bg-white text-slate-900 shadow-md font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-sm">{t.browse}</span>
        </button>
        <button
          onClick={() => {
            setView('quiz');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            view === 'quiz' ? 'bg-gold text-white shadow-md font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BrainCircuit size={18} />
          <span className="text-sm">{t.quiz}</span>
        </button>
      </div>

    </div>
  );
}

export default App;