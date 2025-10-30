import { craigPrompt } from "@/prompt";
import { TOOL_DEFINITIONS } from "./tools";
import { SessionUpdatePayload } from "./types";

export function createSessionUpdate(): SessionUpdatePayload {
  return {
    type: "session.update",
    session: {
      instructions: craigPrompt,
      voice: "alloy",
      input_audio_transcription: {
        model: "whisper-1",
      },
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      tools: TOOL_DEFINITIONS,
    },
  };
}
