export interface AudioElements {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  audioElement: HTMLAudioElement;
}

export function createAudioElements(): AudioElements {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const audioElement = new Audio();
  audioElement.autoplay = true;
  document.body.appendChild(audioElement);

  return { audioContext, analyser, audioElement };
}

export async function attachRemoteStream(
  elements: AudioElements,
  stream: MediaStream,
  monitorAudioLevel: () => void
) {
  const { audioContext, analyser, audioElement } = elements;
  audioElement.srcObject = stream;

  try {
    await audioElement.play();
  } catch (error) {
    console.error("Error playing audio:", error);
  }

  try {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    monitorAudioLevel();
  } catch (error) {
    console.error("Error setting up analyser:", error);
  }
}

export function cleanupAudioElements(elements: Partial<AudioElements>) {
  if (elements.audioElement) {
    elements.audioElement.pause();
    elements.audioElement.srcObject = null;
    if (elements.audioElement.parentNode) {
      elements.audioElement.parentNode.removeChild(elements.audioElement);
    }
  }

  if (elements.audioContext) {
    elements.audioContext.close();
  }
}
