import { SessionToolDefinition } from "./types";

export const TOOL_DEFINITIONS: SessionToolDefinition[] = [
  {
    type: "function",
    name: "change_orb_color",
    description:
      "Craig uses this tool to change to a single solid color",
    parameters: {
      type: "object",
      properties: {
        color: {
          type: "string",
          description:
            'Named color to apply (e.g. "red", "blue", "green", "purple", "orange", "yellow", "pink", "cyan", "white", "black").',
        },
      },
      required: ["color"],
    },
  },
  {
    type: "function",
    name: "anger",
    description:
      "Craig uses this tool when he feels angry or furious",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "embarrassment",
    description:
      "Craig uses this tool when he feels embarrassed or self-conscious",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "excitement",
    description:
      "Craig uses this tool when he feels excited or energetic",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "joy",
    description: "make your particles spin to convey joy",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "wave",
    description:
      "Craig uses this tool to say hello or goodbye",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "nod",
    description:
      "Move your particles up and down in a nodding motion",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "shake",
    description:
      "Shake your particles back and forth in a shaking motion",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "smile",
    description: "Craig uses this tool to smile",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "frown",
    description: "Craig uses this tool to frown",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "send_sms_tool",
    description: "Send a text message to my phone",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description:
            "The text message to deliver",
        },
      },
      required: ["message"],
    },
  },
];
