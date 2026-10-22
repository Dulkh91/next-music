export type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
};

type AudioGraphStore = typeof globalThis & {
  __musicOnlineAudioGraphs?: WeakMap<HTMLAudioElement, AudioGraph>;
};

const store = globalThis as AudioGraphStore;
const audioGraphs =
  (store.__musicOnlineAudioGraphs ??= new WeakMap<HTMLAudioElement, AudioGraph>());

export function getAudioGraph(audio: HTMLAudioElement): AudioGraph | null {
  const existingGraph = audioGraphs.get(audio);
  if (existingGraph) return existingGraph;

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;

  const source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);

  const graph = { context, analyser };
  audioGraphs.set(audio, graph);
  return graph;
}
