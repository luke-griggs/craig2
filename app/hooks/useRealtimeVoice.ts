'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { craigPrompt } from '@/prompt'

interface UseRealtimeVoiceOptions {
  onToolCall?: (toolName: string, args: any) => { success: boolean; message: string };
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const onToolCallRef = useRef(options?.onToolCall);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onToolCallRef.current = options?.onToolCall;
  }, [options?.onToolCall]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average amplitude
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255;

      setAudioLevel(normalizedLevel);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('Starting connection...');

      // Get ephemeral token from our API route
      const sessionResponse = await fetch('/api/session');
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('Session creation failed:', errorText);
        throw new Error('Failed to create session');
      }

      const sessionData = await sessionResponse.json();
      console.log('Session data received:', sessionData);
      const ephemeralToken = sessionData.client_secret.value;

      // Set up audio context for monitoring
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create audio element for playback (must be created before connection)
      const audioElement = new Audio();
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;
      document.body.appendChild(audioElement); // Add to DOM for autoplay to work

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Handle incoming audio tracks - THIS IS CRITICAL FOR AUDIO PLAYBACK
      pc.ontrack = async (event) => {
        console.log('Received remote track:', event.track.kind);
        const remoteStream = event.streams[0];

        if (audioElement) {
          audioElement.srcObject = remoteStream;
          try {
            await audioElement.play();
            console.log('Audio playback started successfully');
          } catch (e) {
            console.error('Error playing audio:', e);
          }
        }

        // Connect to analyser for visualization
        try {
          const source = audioContext.createMediaStreamSource(remoteStream);
          source.connect(analyser);
          console.log('Audio analyser connected');

          // Start monitoring audio levels
          monitorAudioLevel();
        } catch (e) {
          console.error('Error setting up analyser:', e);
        }
      };

      // Add microphone track
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('Microphone access granted');
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log('Added track:', track.kind);
      });

      // Create data channel for sending/receiving events
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
        setIsConnecting(false);

        // Send session configuration
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: craigPrompt,
            voice: 'alloy',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            tools: [
              {
                type: 'function',
                name: 'change_orb_color',
                description: 'Changes the color of Craig to a single color.',
                parameters: {
                  type: 'object',
                  properties: {
                    color: {
                      type: 'string',
                      description: 'The color name (e.g., "red", "blue", "green", "purple", "orange", "yellow", "pink", "cyan", "white", "black")',
                    },
                  },
                  required: ['color'],
                },
              },
              {
                type: 'function',
                name: 'set_multiple_colors',
                description: 'Sets multiple colors for Craig to create a gradient or multi-color effect.',
                parameters: {
                  type: 'object',
                  properties: {
                    colors: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                      description: 'An array of 2-5 color names (e.g., ["red", "blue", "green"])',
                    },
                  },
                  required: ['colors'],
                },
              },
              {
                type: 'function',
                name: 'express_frustration',
                description: 'Makes Craig express frustration with more erratic and noisy movement for 3 seconds. Use when Craig is frustrated, annoyed, or upset.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'express_embarrassment',
                description: 'Use when Craig feels embarrassed, shy, or self-conscious.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'express_excitement',
                description: 'Use when Craig feels excited, thrilled, or energetic.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'express_sadness',
                description: 'Use when Craig feels sad, disappointed, or down.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
            ],
          },
        };

        console.log('Sending session update:', sessionUpdate);
        dataChannel.send(JSON.stringify(sessionUpdate));
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message.type, message);

          // Handle different message types
          if (message.type === 'error') {
            console.error('Realtime API error:', message.error);
            setError(message.error.message || 'An error occurred');
          }

          // Handle function calls
          if (message.type === 'response.function_call_arguments.done') {
            console.log('Function call:', message.name, message.arguments);

            if (options?.onToolCall) {
              const args = JSON.parse(message.arguments);
              const result = options.onToolCall(message.name, args);

              // Send function call result back to the API
              dataChannel.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: message.call_id,
                  output: JSON.stringify(result),
                },
              }));

              // Trigger response generation
              dataChannel.send(JSON.stringify({
                type: 'response.create',
              }));
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      dataChannel.onerror = (err) => {
        console.error('Data channel error:', err);
        setError('Connection error occurred');
      };

      dataChannel.onclose = () => {
        console.log('Data channel closed');
        setIsConnected(false);
      };

      // Create and set local offer
      console.log('Creating offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Local description set');

      // Send offer to OpenAI
      console.log('Sending offer to OpenAI...');
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralToken}`,
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
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [monitorAudioLevel]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting...');

    // Stop audio level monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      if (audioElementRef.current.parentNode) {
        audioElementRef.current.parentNode.removeChild(audioElementRef.current);
      }
      audioElementRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setAudioLevel(0);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    audioLevel,
    error,
    connect,
    disconnect,
  };
}
