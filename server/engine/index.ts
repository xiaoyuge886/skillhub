import { AgentEngine } from './types';
import { ClaudeRunner } from './ClaudeRunner';
import { MockRunner } from './MockRunner';

export class EngineRegistry {
  private engines: Map<string, AgentEngine> = new Map();

  constructor() {
    // Register default engines
    this.register(new ClaudeRunner());
    this.register(new MockRunner('AgentScope'));
    this.register(new MockRunner('LangChain'));
    this.register(new MockRunner('AutoGen'));
  }

  register(engine: AgentEngine) {
    this.engines.set(engine.name, engine);
  }

  get(name: string): AgentEngine | undefined {
    return this.engines.get(name);
  }

  getAll(): string[] {
    return Array.from(this.engines.keys());
  }
}

export const engineRegistry = new EngineRegistry();
