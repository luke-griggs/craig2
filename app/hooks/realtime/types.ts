export interface ToolCallResult {
  success: boolean;
  message?: string;
}

export type ToolCallHandler = (
  toolName: string,
  args: Record<string, unknown>
) => ToolCallResult;

export interface SessionToolDefinition {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface SessionUpdatePayload {
  type: "session.update";
  session: {
    instructions: string;
    voice: string;
    input_audio_transcription: {
      model: string;
    };
    turn_detection: {
      type: string;
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    };
    tools: SessionToolDefinition[];
  };
}
