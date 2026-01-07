import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';

export const useSpeech = (language: Language) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
      }
    };

    loadVoices();

    // Chrome and some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Clean text: remove [1], [2] footnotes for smoother reading
    const cleanText = text.replace(/\[\d+\]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Target language
    const targetLang = language === 'en' ? 'en-US' : 'zh-CN';
    utterance.lang = targetLang;
    
    // Explicitly find a voice. 
    // Just setting .lang isn't enough on some devices/browsers if the default voice is different.
    if (voices.length > 0) {
      // 1. Try exact match
      let voice = voices.find(v => v.lang === targetLang);
      
      // 2. If zh, try any 'zh' voice (e.g., zh-HK, zh-TW if CN not available)
      if (!voice && language === 'zh') {
        voice = voices.find(v => v.lang.startsWith('zh'));
      }

      // 3. Fallback for English
      if (!voice && language === 'en') {
        voice = voices.find(v => v.lang.startsWith('en'));
      }
      
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Adjust rate slightly for clarity
    utterance.rate = 0.9; 

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [language, voices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
};