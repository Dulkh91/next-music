
"use client";

import { useEffect, useRef } from "react";
import { getAudioGraph } from "./audioGraph";

interface GraphPlayProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export default function GraphPlaySound({
  audioRef,
  isPlaying,
}: GraphPlayProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const graph = getAudioGraph(audio);
    if (!graph) return;

    const { context, analyser } = graph;
    audioContextRef.current = context;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let animationId = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(data);

      barsRef.current.forEach((bar, index) => {
        if (!bar) return;

        const value = data[index * 2] ?? 0;
        const height = 4 + (value / 255) * 44;

        bar.style.height = `${height}px`;
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!isPlaying) return;
    void audioContextRef.current?.resume().catch((error: unknown) => {
      console.warn("Audio analyser could not resume:", error);
    });
  }, [isPlaying]);

  return (
    <div className="ml-2 flex h-12 items-end gap-0.5">
      {Array.from({ length:25 }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            barsRef.current[index] = element;
          }}
          className="w-1 rounded-full bg-purple-400 transition-[height] duration-75"
          style={{ height: "4px" }}
        />
      ))}
    </div>
  );
}
