
"use client";

import { useEffect, useRef } from "react";

interface GraphPlayProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
};

// A media element can only be wrapped in one MediaElementAudioSourceNode.
// Keep its graph so effect re-runs (including React Strict Mode) reuse it.
const audioGraphs = new WeakMap<HTMLAudioElement, AudioGraph>();

export default function GraphPlaySound({
  audioRef,
  isPlaying,
}: GraphPlayProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return;

    let graph = audioGraphs.get(audio);
    if (!graph) {
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      graph = { context, analyser };
      audioGraphs.set(audio, graph);
    }

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
      {Array.from({ length: 24 }, (_, index) => (
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
