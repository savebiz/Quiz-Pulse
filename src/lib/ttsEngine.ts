/**
 * @license
 * Apache-2.0
 * QuizPulse Built-In Web Speech API (SpeechSynthesis) Text-to-Speech Engine
 */

export interface TtsSpeakOptions {
  rate?: number;     // Speech rate (0.5 to 2.0, default: 0.9 for clear spelling pronunciation)
  pitch?: number;    // Speech pitch (0 to 2, default: 1.0)
  lang?: string;     // Preferred language (default: 'en-US')
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Check if the browser supports native Web Speech API SpeechSynthesis
 */
export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/**
 * Stop any ongoing speech synthesis
 */
export function stopSpeech(): void {
  if (isTtsSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Select the best available natural English voice from the browser synthesis voice list
 */
function getBestEnglishVoice(langPreference = "en-US"): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. Look for high quality Google / Apple / Natural English voices
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Samantha"))
  );
  if (naturalVoice) return naturalVoice;

  // 2. Look for matching language preference (e.g. en-US, en-GB)
  const langMatch = voices.find((v) => v.lang.toLowerCase() === langPreference.toLowerCase());
  if (langMatch) return langMatch;

  // 3. Fallback to any English voice
  const enVoice = voices.find((v) => v.lang.startsWith("en"));
  return enVoice || voices[0];
}

/**
 * Pronounce a spelling word aloud using browser Web Speech API
 */
export function speakWord(word: string, options: TtsSpeakOptions = {}): void {
  if (!word || !word.trim()) return;

  if (!isTtsSupported()) {
    console.warn("Web Speech API is not supported in this browser environment.");
    if (options.onError) options.onError(new Error("Speech synthesis not supported"));
    return;
  }

  // Cancel any prior active utterance
  stopSpeech();

  const cleanText = word.trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.rate = options.rate ?? 0.9; // 0.9 rate ensures crisp, clear pronunciation for spelling bees
  utterance.pitch = options.pitch ?? 1.0;
  utterance.lang = options.lang || "en-US";

  // Attempt voice selection
  const bestVoice = getBestEnglishVoice(utterance.lang);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = (e) => options.onError!(e);

  // Chrome requires voices to be loaded via event listener if empty
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voice = getBestEnglishVoice(utterance.lang);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    };
  } else {
    window.speechSynthesis.speak(utterance);
  }
}
