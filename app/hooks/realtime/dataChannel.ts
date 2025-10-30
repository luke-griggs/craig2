import { SessionUpdatePayload, ToolCallHandler } from "./types";

interface ConfigureDataChannelArgs {
  dataChannel: RTCDataChannel;
  sessionUpdate: SessionUpdatePayload;
  setIsConnected: (value: boolean) => void;
  setIsConnecting: (value: boolean) => void;
  setError: (value: string | null) => void;
  onToolCall?: ToolCallHandler;
}

export function configureDataChannel({
  dataChannel,
  sessionUpdate,
  setIsConnected,
  setIsConnecting,
  setError,
  onToolCall,
}: ConfigureDataChannelArgs) {
  dataChannel.onopen = () => {
    console.log("Data channel opened");
    setIsConnected(true);
    setIsConnecting(false);
    setError(null);

    console.log("Sending session update:", sessionUpdate);
    dataChannel.send(JSON.stringify(sessionUpdate));
  };

  dataChannel.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message.type, message);

      if (message.type === "error") {
        console.error("Realtime API error:", message.error);
        setError(message.error.message || "An error occurred");
      }

      if (
        message.type === "response.function_call_arguments.done" &&
        onToolCall
      ) {
        console.log("Function call:", message.name, message.arguments);

        const parsedArgs = JSON.parse(message.arguments) as unknown;
        const args =
          typeof parsedArgs === "object" && parsedArgs !== null
            ? (parsedArgs as Record<string, unknown>)
            : {};
        const result = onToolCall(message.name, args);

        dataChannel.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: message.call_id,
              output: JSON.stringify(result),
            },
          })
        );

        dataChannel.send(
          JSON.stringify({
            type: "response.create",
          })
        );
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  dataChannel.onerror = (err) => {
    console.error("Data channel error:", err);
    setError("Connection error occurred");
  };

  dataChannel.onclose = () => {
    console.log("Data channel closed");
    setIsConnected(false);
  };
}
