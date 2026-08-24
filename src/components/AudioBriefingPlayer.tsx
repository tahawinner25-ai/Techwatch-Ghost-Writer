import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Headphones,
  Gauge,
  SkipForward,
  SkipBack,
  FileText,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NewsletterResult } from "../types";
import {
  buildPodcastScript,
  speakText,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  PodcastScript,
} from "../utils/audioTts";

interface AudioBriefingPlayerProps {
  result: NewsletterResult;
}

export const AudioBriefingPlayer: React.FC<AudioBriefingPlayerProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Build the structured podcast script from the newsletter
  const script: PodcastScript = useMemo(() => {
    return buildPodcastScript(result);
  }, [result]);

  const currentChapter = script.chapters[currentChapterIdx] || script.chapters[0];

  // Handle timer ticker for progress bar
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= script.totalDurationEstSec) {
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused, playbackRate, script.totalDurationEstSec]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const playChapter = (index: number) => {
    if (index < 0 || index >= script.chapters.length) {
      handleStop();
      return;
    }

    setCurrentChapterIdx(index);
    setIsPlaying(true);
    setIsPaused(false);

    const chapter = script.chapters[index];
    const success = speakText(chapter.text, {
      rate: playbackRate,
      lang: "fr-FR",
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        // Automatically advance to the next chapter if available
        if (index + 1 < script.chapters.length) {
          playChapter(index + 1);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setElapsedSec(0);
        }
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
    });

    if (!success) {
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        resumeSpeaking();
        setIsPaused(false);
      } else {
        pauseSpeaking();
        setIsPaused(true);
      }
    } else {
      playChapter(currentChapterIdx);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
    setElapsedSec(0);
  };

  const handleNextChapter = () => {
    if (currentChapterIdx + 1 < script.chapters.length) {
      playChapter(currentChapterIdx + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      playChapter(currentChapterIdx - 1);
    }
  };

  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      // Replay current chapter with new speed
      playChapter(currentChapterIdx);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPct = Math.min(
    100,
    Math.round((elapsedSec / (script.totalDurationEstSec || 1)) * 100)
  );

  return (
    <div className="border border-[#1a1a1a] bg-[#1a1a1a] text-white p-4 sm:p-5 shadow-sm space-y-4 mb-4">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-none bg-[#c44d2d] flex items-center justify-center text-white shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#c44d2d] font-bold">
                Synthèse Vocale • Podcast Briefing
              </span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>Text-to-Speech</span>
              </span>
            </div>
            <h4 className="font-serif italic font-bold text-sm sm:text-base text-neutral-100 line-clamp-1">
              {result.subject}
            </h4>
          </div>
        </div>

        {/* Speed Multiplier & Transcript Toggle */}
        <div className="flex items-center space-x-2">
          {/* Rate Switcher */}
          <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-700 p-0.5 text-[10px] font-mono">
            <Gauge className="w-3 h-3 text-neutral-400 ml-1" />
            {[0.8, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleChangeRate(rate)}
                className={`px-1.5 py-0.5 transition-all cursor-pointer ${
                  playbackRate === rate
                    ? "bg-[#c44d2d] text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 transition-all cursor-pointer"
            title="Afficher/masquer le script textuel du podcast"
          >
            <FileText className="w-3 h-3 text-[#c44d2d]" />
            <span className="hidden sm:inline">Script</span>
            {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Playback Bar & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Play/Pause/Stop Buttons */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrevChapter}
            disabled={currentChapterIdx === 0}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 disabled:opacity-30 cursor-pointer transition-all"
            title="Chapitre précédent"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePlayToggle}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#c44d2d] hover:bg-[#b04022] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{isPaused ? "Reprendre" : "Écouter le Briefing"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 disabled:opacity-30 cursor-pointer transition-all"
            title="Arrêter la lecture"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextChapter}
            disabled={currentChapterIdx >= script.chapters.length - 1}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 disabled:opacity-30 cursor-pointer transition-all"
            title="Chapitre suivant"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline, Chapter & Animated Soundwave */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="text-neutral-200 font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c44d2d] inline-block" />
              <span>{currentChapter.title}</span>
            </span>
            <div className="flex items-center space-x-2">
              <span>{formatTime(elapsedSec)}</span>
              <span>/</span>
              <span>~{formatTime(script.totalDurationEstSec)}</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full bg-neutral-800 h-1.5 relative overflow-hidden">
            <div
              className="bg-[#c44d2d] h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Chapter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {script.chapters.map((chap, idx) => (
              <button
                key={chap.id}
                onClick={() => playChapter(idx)}
                className={`px-2 py-0.5 text-[10px] font-mono whitespace-nowrap border transition-all cursor-pointer ${
                  currentChapterIdx === idx
                    ? "bg-[#c44d2d] text-white border-[#c44d2d] font-bold"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-700"
                }`}
              >
                {chap.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible Full Transcript */}
      {showTranscript && (
        <div className="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 text-xs font-serif text-neutral-300 space-y-2 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase text-neutral-500 pb-1 border-b border-neutral-800">
            <span>Script Audio Intégral ({script.chapters.length} chapitres)</span>
            <span className="text-emerald-400">Généré automatiquement</span>
          </div>
          <div className="whitespace-pre-line leading-relaxed">
            {script.fullText}
          </div>
        </div>
      )}
    </div>
  );
};
