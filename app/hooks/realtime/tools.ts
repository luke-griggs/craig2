import { SessionToolDefinition } from "./types";

export const TOOL_DEFINITIONS: SessionToolDefinition[] = [
  {
    type: "function",
    name: "change_orb_color",
    description:
      "Express a custom appearance by changing Craig to a single solid color.",
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
    name: "set_multiple_colors",
    description:
      "Express a custom appearance by blending several colors in Craig.",
    parameters: {
      type: "object",
      properties: {
        colors: {
          type: "array",
          items: { type: "string" },
          description: "List of colors to blend together.",
        },
      },
      required: ["colors"],
    },
  },
  {
    type: "function",
    name: "anger",
    description:
      "Express anger. Use this tool when Craig feels angry or furious.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "frustration",
    description:
      "Express frustration. Use this tool when Craig feels frustrated or irritated.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "embarrassment",
    description:
      "Use this tool when Craig feels embarrassed or self-conscious.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "excitement",
    description:
      "Use this tool when Craig feels excited or energetic.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "joy",
    description: "Use this tool when Craig feels joyful or happy.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "sadness",
    description: "Use this tool when Craig feels sad or down.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "confusion",
    description:
      "Use this tool when Craig feels confused or puzzled.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "disgust",
    description:
      "Use this tool when Craig feels disgusted or repulsed.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "calm",
    description:
      "Use this tool when Craig feels calm or peaceful.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "wave",
    description:
      "Use this tool for Craig to wave hello or goodbye.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "nod",
    description:
      "Use this tool for Craig to nod affirmatively.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "shake",
    description:
      "Use this tool for Craig to shake his head.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "smile",
    description: "Use this tool to make Craig smile.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "frown",
    description: "Use this tool to make Craig frown.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];
