import { AgentEngine, SDKMessage, Options } from './types';

export class MockRunner implements AgentEngine {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async *run(prompt: string, options?: Options): AsyncGenerator<SDKMessage, void, unknown> {
    const sessionId = Date.now().toString();

    yield {
      type: 'system',
      subtype: 'init',
      uuid: crypto.randomUUID(),
      session_id: sessionId,
      apiKeySource: 'env',
      cwd: process.cwd(),
      tools: [],
      mcp_servers: [],
      model: options?.model || 'default-model',
      permissionMode: 'default',
      slash_commands: [],
      output_style: 'normal'
    };

    yield {
      type: 'user',
      uuid: crypto.randomUUID(),
      session_id: sessionId,
      message: {
        role: 'user',
        content: [{ type: 'text', text: prompt }]
      },
      parent_tool_use_id: null
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    yield {
      type: 'assistant',
      uuid: crypto.randomUUID(),
      session_id: sessionId,
      message: {
        role: 'assistant',
        content: [
          { type: 'text', text: `[${this.name} Simulation] Processing your request: "${prompt}"` },
          { type: 'text', text: `Configuration: Model=${options?.model || 'N/A'}, API=${options?.apiUrl ? 'Custom' : 'Default'}` }
        ]
      },
      parent_tool_use_id: null
    };

    yield {
      type: 'result',
      subtype: 'success',
      uuid: crypto.randomUUID(),
      session_id: sessionId,
      duration_ms: 800,
      duration_api_ms: 0,
      is_error: false,
      num_turns: 1,
      result: 'Success',
      total_cost_usd: 0,
      usage: {},
      modelUsage: {},
      permission_denials: []
    };
  }
}
