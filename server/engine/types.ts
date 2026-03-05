import { z } from 'zod';

// Types based on Claude Agent SDK documentation
// https://platform.claude.com/docs/zh-CN/agent-sdk/typescript

export type UUID = string;

export type APIAssistantMessage = {
  role: 'assistant';
  content: any[];
};

export type APIUserMessage = {
  role: 'user';
  content: any[];
};

export type SDKAssistantMessage = {
  type: 'assistant';
  uuid: UUID;
  session_id: string;
  message: APIAssistantMessage;
  parent_tool_use_id: string | null;
};

export type SDKUserMessage = {
  type: 'user';
  uuid?: UUID;
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
};

export type SDKUserMessageReplay = {
  type: 'user';
  uuid: UUID;
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
};

export type SDKResultMessage = 
  | {
      type: 'result';
      subtype: 'success';
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      result: string;
      total_cost_usd: number;
      usage: any;
      modelUsage: any;
      permission_denials: any[];
      structured_output?: unknown;
    }
  | {
      type: 'result';
      subtype: 'error_max_turns' | 'error_during_execution' | 'error_max_budget_usd' | 'error_max_structured_output_retries';
      uuid: UUID;
      session_id: string;
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      total_cost_usd: number;
      usage: any;
      modelUsage: any;
      permission_denials: any[];
      errors: string[];
    };

export type SDKSystemMessage = {
  type: 'system';
  subtype: 'init';
  uuid: UUID;
  session_id: string;
  apiKeySource: any;
  cwd: string;
  tools: string[];
  mcp_servers: { name: string; status: string }[];
  model: string;
  permissionMode: string;
  slash_commands: string[];
  output_style: string;
};

export type SDKMessage = 
  | SDKAssistantMessage 
  | SDKUserMessage 
  | SDKUserMessageReplay 
  | SDKResultMessage 
  | SDKSystemMessage;

export interface Options {
  model?: string;
  maxTurns?: number;
  maxBudgetUsd?: number;
  tools?: string[];
  systemPrompt?: string;
  verbose?: boolean;
  apiKey?: string;
  apiUrl?: string;
}

export interface Query extends AsyncGenerator<SDKMessage, void, unknown> {
  interrupt(): Promise<void>;
  rewindFiles(userMessageUuid: string): Promise<void>;
  setPermissionMode(mode: string): Promise<void>;
  setModel(model?: string): Promise<void>;
}

// Generic Engine Interface
export interface AgentEngine {
  name: string;
  run(prompt: string, options?: any): AsyncGenerator<SDKMessage, void, unknown>;
}
