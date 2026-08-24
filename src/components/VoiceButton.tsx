import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play, Loader2 } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/audioTts";

interface VoiceButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md" | "icon";
  lang?: "fr" | "en";
  className?: string;
  title?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  label = "Écouter",
  size = "sm",
  lang = "fr",
  className = "",
  title = "Écouter la synthèse vocale (Text-to-Speech)",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // Clean up when unmounting
      if (isPlaying) {
        stopSpeaking();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    const success = speakText(text, {
      lang: lang === "fr" ? "fr-FR" : "en-US",
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
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

  if (size === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={isPlaying ? "Arrêter la lecture" : title}
        className={`p-1.5 rounded-none border transition-all cursor-pointer flex items-center justify-center ${
          isPlaying
            ? "bg-[#c44d2d] text-white border-[#c44d2d] shadow-xs animate-pulse"
            : "bg-white hover:bg-[#F9F8F6] text-neutral-700 hover:text-[#1A1A1A] border-[#D1CEC7]"
        } ${className}`}
      >
        {isPlaying ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isPlaying ? "Arrêter la lecture audio" : title}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-bold border transition-all cursor-pointer select-none ${
        isPlaying
          ? "bg-[#c44d2d] text-white border-[#c44d2d] shadow-xs"
          : "bg-white hover:bg-[#F9F8F6] text-neutral-800 hover:text-[#1A1A1A] border-[#D1CEC7]"
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <div className="flex items-center space-x-0.5 mr-0.5">
            <span className="w-1 h-3 bg-white animate-pulse" />
            <span className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-2 bg-white animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
          <span>Arrêter</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#c44d2d]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
