'use client'

import {useEffect, useRef } from "react";
import { getAudioGraph } from "./audioGraph";

interface GraphPlayProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
}

export default function GraphPlay({
    audioRef,isPlaying
}:GraphPlayProps){

 const barsRef = useRef<(HTMLSpanElement | null)[]>([])
 const audioContextRef = useRef<AudioContext | null>(null)

 useEffect(()=>{
    const audio = audioRef.current;
    if(!audio) return;

    const graph = getAudioGraph(audio);
    if (!graph) return;

    const {context, analyser } = graph
    audioContextRef.current = context
    const data = new Uint8Array(analyser.frequencyBinCount)
    let animationId = 0

    const draw = ()=>{
        animationId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(data)

        barsRef.current.forEach((bar, index)=>{
            if(!bar) return;

            const value = data[index * 2] ?? 0;
            const height = (value / 255) * 30;

            bar.style.height = `${height}px`;
        });
    };

    draw()

    return ()=>{
        cancelAnimationFrame(animationId)
    };

 },[audioRef])

 useEffect(()=>{
    if(!isPlaying) return
    void audioContextRef.current?.resume().catch((error: unknown)=>{
        console.warn("Audio analyser could not resume:",error)
    })
 },[isPlaying]);

    return(
        <div className="flex items-end gap-0.5 ml-2">
            {Array.from({length:5},(_, index)=>(
                <span 
                    key={index}
                    ref={(element)=>{
                        barsRef.current[index] = element
                    }}
                    className="w-1 bg-purple-400 h-full rounded-full"
                />
            ))}
        </div>
    )
}
