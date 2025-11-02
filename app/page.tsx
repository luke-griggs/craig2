"use client";

import { useState } from "react";
import { useRealtimeVoice } from "./hooks/useRealtimeVoice";
import ParticleOrb from "./components/ParticleOrb";

const COLOR_MAP: Record<string, string> = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  purple: "#9b59b6",
  orange: "#ff8c00",
  yellow: "#ffff00",
  pink: "#ff69b4",
  cyan: "#00ffff",
  white: "#ffffff",
  black: "#000000",
  magenta: "#ff00ff",
  lime: "#00ff00",
  indigo: "#4b0082",
  violet: "#ee82ee",
  teal: "#008080",
  gold: "#ffd700",
  silver: "#c0c0c0",
};

export default function Home() {
  const [orbColors, setOrbColors] = useState(["#424243"]);
  const [isAngry, setIsAngry] = useState(false);
  const [isFrustrated, setIsFrustrated] = useState(false);
  const [isEmbarrassed, setIsEmbarrassed] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const [isJoyful, setIsJoyful] = useState(false);
  const [isSad, setIsSad] = useState(false);
  const [isConfused, setIsConfused] = useState(false);
  const [isDisgusted, setIsDisgusted] = useState(false);
  const [isCalm, setIsCalm] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isNodding, setIsNodding] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isFrowning, setIsFrowning] = useState(false);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [disappearDuration, setDisappearDuration] = useState(1200);

  const { isConnected, isConnecting, audioLevel, error, connect, disconnect } =
    useRealtimeVoice({
      onToolCall: (toolName, args) => {
        const getStringArg = (value: unknown): string | null =>
          typeof value === "string" ? value : null;
        const getStringArrayArg = (value: unknown): string[] =>
          Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string")
            : [];

        if (toolName === "change_orb_color") {
          const colorValue = getStringArg(args.color);
          if (!colorValue) {
            return { success: false, message: "Missing color" };
          }
          const colorName = colorValue.toLowerCase();
          const hexColor = COLOR_MAP[colorName] || colorValue;
          setOrbColors([hexColor]);
          return {
            success: true,
            message: `Changed orb color to ${colorValue}`,
          };
        }

        if (toolName === "set_multiple_colors") {
          const colorsValue = getStringArrayArg(args.colors);
          if (colorsValue.length === 0) {
            return { success: false, message: "Missing color list" };
          }
          const hexColors = colorsValue.map((colorName) => {
            const name = colorName.toLowerCase();
            return COLOR_MAP[name] || colorName;
          });
          setOrbColors(hexColors);
          return {
            success: true,
            message: `Changed orb to ${
              hexColors.length
            } colors: ${colorsValue.join(", ")}`,
          };
        }

        // don't use the messages here
        if (toolName === "anger") {
          setOrbColors(["#ff0000"]); // Red
          setIsAngry(true);
          setTimeout(() => setIsAngry(false), 3000);
          return { success: true };
        }

        if (toolName === "excitement") {
          setIsExcited(true);
          setTimeout(() => setIsExcited(false), 1000);
          return { success: true };
        }

        if (toolName === "joy") {
          setIsJoyful(true);
          setTimeout(() => setIsJoyful(false), 2000);
          return { success: true };
        }

        if (toolName === "sadness") {
          setOrbColors(["#0000ff"]); // Blue
          setIsSad(true);
          setTimeout(() => setIsSad(false), 4000);
          return { success: true };
        }

        if (toolName === "confusion") {
          setOrbColors(["#9b59b6"]); // Purple
          setIsConfused(true);
          setTimeout(() => setIsConfused(false), 2500);
          return { success: true };
        }

        if (toolName === "calm") {
          setOrbColors(["#00bfff"]); // Cyan/light blue
          setIsCalm(true);
          setTimeout(() => setIsCalm(false), 3000);
          return { success: true };
        }

        if (toolName === "wave") {
          setIsWaving(true);
          setTimeout(() => setIsWaving(false), 1600);
          return { success: true };
        }

        if (toolName === "nod") {
          setIsNodding(true);
          setTimeout(() => setIsNodding(false), 1400);
          return { success: true };
        }

        if (toolName === "shake") {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 1400);
          return { success: true };
        }

        if (toolName === "smile") {
          setIsSmiling(true);
          setTimeout(() => setIsSmiling(false), 2200);
          return { success: true };
        }

        if (toolName === "frown") {
          setIsFrowning(true);
          setTimeout(() => setIsFrowning(false), 2200);
          return { success: true };
        }

        if (toolName === "embarrassment") {
          const shrinkDuration = 800; // How long to shrink
          const hiddenDuration = 5000; // How long to stay hidden
          setDisappearDuration(shrinkDuration);
          setIsDisappearing(true);
          // Keep isDisappearing true for shrink duration + stay hidden duration
          setTimeout(
            () => setIsDisappearing(false),
            shrinkDuration + hiddenDuration
          );
          return { success: true };
        }

        if (toolName === "send_sms_tool") {
          const message = getStringArg(args.message);
          if (!message) {
            return { success: false, message: "Missing message" };
          }

          // Call the API route to send SMS
          fetch("/api/sms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("SMS sent:", data);
            })
            .catch((err) => {
              console.error("SMS error:", err);
            });

          return { success: true };
        }

        return { success: false, message: "Unknown tool" };
      },
    });

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      <main className="relative w-full h-screen">
        {/* Particle Orb - Full screen canvas */}
        <ParticleOrb
          audioLevel={audioLevel}
          colors={orbColors}
          isAngry={isAngry}
          isFrustrated={isFrustrated}
          isEmbarrassed={isEmbarrassed}
          isExcited={isExcited}
          isJoyful={isJoyful}
          isSad={isSad}
          isConfused={isConfused}
          isDisgusted={isDisgusted}
          isCalm={isCalm}
          isWaving={isWaving}
          isNodding={isNodding}
          isShaking={isShaking}
          isSmiling={isSmiling}
          isFrowning={isFrowning}
          isDisappearing={isDisappearing}
          disappearDuration={disappearDuration}
        />

        {/* Controls Overlay */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4"
          style={{ zIndex: 10 }}
        >
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
            <button
              onClick={disconnect}
              className="px-6 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              End Conversation
            </button>
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
