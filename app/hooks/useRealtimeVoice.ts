'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { attachRemoteStream, cleanupAudioElements, createAudioElements } from './realtime/audio';
import { configureDataChannel } from './realtime/dataChannel';
import { createSessionUpdate } from './realtime/sessionConfig';
import { ToolCallHandler } from './realtime/types';

interface UseRealtimeVoiceOptions {
  onToolCall?: ToolCallHandler;
}

interface UseRealtimeVoiceReturn {
  isConnected: boolean;
  isConnecting: boolean;
  audioLevel: number;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useRealtimeVoice(options?: UseRealtimeVoiceOptions): UseRealtimeVoiceReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementsRef = useRef<ReturnType<typeof createAudioElements> | null>(null);
  const onToolCallRef = useRef<ToolCallHandler | undefined>(options?.onToolCall);

  useEffect(() => {
    onToolCallRef.current = options?.onToolCall;
  }, [options?.onToolCall]);

  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  const cleanupConnection = useCallback(
    (options?: { preserveError?: boolean }) => {
      stopMonitoring();

      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.getSenders().forEach((sender) => sender.track?.stop());
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (audioElementsRef.current) {
        cleanupAudioElements(audioElementsRef.current);
        audioElementsRef.current = null;
      }

      analyserRef.current = null;

      if (!options?.preserveError) {
        setError(null);
      }

      setIsConnected(false);
      setIsConnecting(false);
      setAudioLevel(0);
    },
    [stopMonitoring]
  );

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('Starting connection...');
      const sessionResponse = await fetch('/api/session');

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('Session creation failed:', errorText);
        throw new Error('Failed to create session');
      }

      const sessionData = await sessionResponse.json();
      console.log('Session data received:', sessionData);
      const ephemeralToken = sessionData.client_secret.value;

      const audioElements = createAudioElements();
      audioElementsRef.current = audioElements;
      analyserRef.current = audioElements.analyser;

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        const remoteStream = event.streams[0];

        if (audioElementsRef.current) {
          void attachRemoteStream(audioElementsRef.current, remoteStream, monitorAudioLevel);
        }
      };

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('Microphone access granted');
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log('Added track:', track.kind);
      });

      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      const toolHandler = onToolCallRef.current
        ? (toolName: string, args: Record<string, unknown>) =>
            onToolCallRef.current?.(toolName, args) ?? {
              success: false,
              message: 'Tool handler missing',
            }
        : undefined;

      configureDataChannel({
        dataChannel,
        sessionUpdate: createSessionUpdate(),
        setIsConnected,
        setIsConnecting,
        setError,
        onToolCall: toolHandler,
      });

      console.log('Creating offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Local description set');

      console.log('Sending offer to OpenAI...');
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-realtime-mini', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('SDP exchange failed:', errorText);
        throw new Error('Failed to connect to Realtime API');
      }

      const answerSdp = await sdpResponse.text();
      console.log('Received answer SDP');
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      console.log('WebRTC connection established successfully');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      cleanupConnection({ preserveError: true });
    }
  }, [cleanupConnection, isConnected, isConnecting, monitorAudioLevel]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting...');
    cleanupConnection();
  }, [cleanupConnection]);

  useEffect(
    () => () => {
      cleanupConnection({ preserveError: true });
    },
    [cleanupConnection]
  );

  return {
    isConnected,
    isConnecting,
    audioLevel,
    error,
    connect,
    disconnect,
  };
}
