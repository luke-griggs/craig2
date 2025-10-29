'use client';

import { useRealtimeVoice } from './hooks/useRealtimeVoice';
import ParticleOrb from './components/ParticleOrb';

export default function Home() {
  const { isConnected, isConnecting, audioLevel, error, connect, disconnect } = useRealtimeVoice();

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <main className="relative w-full h-screen">
        {/* Particle Orb - Full screen canvas */}
        <ParticleOrb audioLevel={audioLevel} />

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4" style={{ zIndex: 10 }}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isConnected && !isConnecting && (
            <button
              onClick={connect}
              className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Conversation
            </button>
          )}

          {isConnecting && (
            <div className="px-8 py-4 bg-gray-100 text-gray-800 rounded-full font-medium shadow-lg">
              Connecting...
            </div>
          )}

          {isConnected && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full font-medium shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                Connected - Speak now
              </div>
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg"
              >
                End Conversation
              </button>
            </div>
          )}

          {/* Audio Level Indicator */}
          {isConnected && audioLevel > 0.05 && (
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
