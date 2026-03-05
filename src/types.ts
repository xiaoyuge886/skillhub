export type Provider = 'Gemini' | 'Claude' | 'OpenAI' | 'Mistral';
export type AgentEngine = 'AgentScope' | 'Claude Agent SDK' | 'LangChain' | 'AutoGen';
export type SkillType = 'Analysis' | 'Coding' | 'Creative' | 'Utility';

export interface SecurityScan {
  virusTotal: 'Benign' | 'Suspicious' | 'Malicious';
  openClaw: 'Safe' | 'Suspicious' | 'Unknown';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  provider: Provider;
  engine: AgentEngine;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  icon: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  stats: {
    stars: number;
    downloads: number;
    installs: number;
  };
  security: SecurityScan;
  readme: string;
  history: {
    version: string;
    date: string;
    changes: string[];
    security: {
      virusTotal: 'Benign' | 'Suspicious' | 'Malicious';
      openClaw: 'Benign' | 'Suspicious' | 'Unknown';
    };
  }[];
}

export const MOCK_SKILLS: Skill[] = [
  {
    id: '1',
    name: 'Find Skills',
    description: 'Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities.',
    type: 'Utility',
    provider: 'Gemini',
    engine: 'AgentScope',
    version: '0.1.0',
    status: 'active',
    icon: 'search',
    author: {
      name: 'Jim Liuxinghai',
      handle: '@JimLiuxinghai',
      avatar: 'https://picsum.photos/seed/jim/100/100'
    },
    stats: {
      stars: 398,
      downloads: 87600,
      installs: 837
    },
    security: {
      virusTotal: 'Benign',
      openClaw: 'Suspicious',
      confidence: 'MEDIUM',
      message: "The skill's description matches its instructions (it uses the Skills CLI to find and install skills), but the runtime guidance encourages executing third-party code via npx and installing packages globally with -y (skipping prompts), which raises safety concerns that the metadata does not address."
    },
    readme: `# Find Skills

This skill helps you discover and install skills from the open agent skills ecosystem.

## When to Use This Skill
Use this skill when the user:
* Asks "how do I do X" where X might be a common task with an existing skill
* Says "find a skill for X" or "is there a skill for X"
* Asks "can you do X" where X is a specialized capability
* Expresses interest in extending agent capabilities

## What is the Skills CLI?
The Skills CLI (\`npx skills\`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

**Key commands:**
* \`npx skills find [query]\` - Search for skills interactively or by keyword
* \`npx skills add <package>\` - Install a skill from GitHub or other sources
* \`npx skills check\` - Check for skill updates

## How to Help Users Find Skills

**Step 1: Understand What They Need**
When a user asks for help with something, identify:
* The domain (e.g., React, testing, design, deployment)
* The specific task (e.g., writing tests, creating animations, reviewing PRs)

**Step 2: Search for Skills**
Run the find command with a relevant query:

\`\`\`bash
npx skills find [query]
\`\`\`
`,
    history: [
      {
        version: '0.1.0',
        date: '2026/3/1',
        changes: [
          'No functional or content changes; OpenClaw `requires.env` metadata was removed.',
          'Removed the OpenClaw `requires.env` metadata block from the skill definition.',
          'All usage guidance, logging formats, and workflow instructions remain unchanged.',
          'Ensures cleaner skill metadata and wider compatibility.'
        ],
        security: {
          virusTotal: 'Benign',
          openClaw: 'Benign'
        }
      },
      {
        version: '0.0.9',
        date: '2026/2/22',
        changes: [
          'Added attribution: notes that this skill was remade for OpenClaw from the original repository.',
          'No functional or structural changes to the skill—documentation only update.',
          'Improved error handling for network timeouts.'
        ],
        security: {
          virusTotal: 'Benign',
          openClaw: 'Benign'
        }
      }
    ]
  },
  {
    id: '2',
    name: 'Market Analyzer Pro',
    description: 'Advanced financial market analysis using multi-agent consensus.',
    type: 'Analysis',
    provider: 'Gemini',
    engine: 'AgentScope',
    version: '1.2.0',
    status: 'active',
    icon: 'bar-chart-2',
    author: {
      name: 'Finance Wizard',
      handle: '@finwiz',
      avatar: 'https://picsum.photos/seed/fin/100/100'
    },
    stats: {
      stars: 120,
      downloads: 5400,
      installs: 320
    },
    security: {
      virusTotal: 'Benign',
      openClaw: 'Safe',
      confidence: 'HIGH',
      message: "No security issues detected. Code analysis confirms safe execution patterns."
    },
    readme: `# Market Analyzer Pro\n\nAdvanced financial analysis tool...`,
    history: []
  },
  {
    id: '3',
    name: 'CodeRefactor X',
    description: 'Intelligent legacy code refactoring agent with safety checks.',
    type: 'Coding',
    provider: 'Claude',
    engine: 'Claude Agent SDK',
    version: '2.0.1',
    status: 'active',
    icon: 'code',
    author: {
      name: 'Dev Ops',
      handle: '@devops_master',
      avatar: 'https://picsum.photos/seed/dev/100/100'
    },
    stats: {
      stars: 89,
      downloads: 2100,
      installs: 150
    },
    security: {
      virusTotal: 'Benign',
      openClaw: 'Safe',
      confidence: 'HIGH',
      message: "Safe for production use."
    },
    readme: `# CodeRefactor X\n\nRefactor your legacy code with confidence...`,
    history: []
  },
  {
    id: '4',
    name: 'StoryWeaver',
    description: 'Interactive narrative generation engine for game developers.',
    type: 'Creative',
    provider: 'OpenAI',
    engine: 'LangChain',
    version: '0.9.5',
    status: 'draft',
    icon: 'feather',
    author: {
      name: 'Creative Mind',
      handle: '@storyteller',
      avatar: 'https://picsum.photos/seed/story/100/100'
    },
    stats: {
      stars: 45,
      downloads: 800,
      installs: 50
    },
    security: {
      virusTotal: 'Benign',
      openClaw: 'Unknown',
      confidence: 'LOW',
      message: "New skill, limited security data available."
    },
    readme: `# StoryWeaver\n\nWeave compelling narratives...`,
    history: []
  },
  {
    id: '5',
    name: 'DataCleaner',
    description: 'Automated dataset cleaning and normalization pipeline.',
    type: 'Utility',
    provider: 'Mistral',
    engine: 'AutoGen',
    version: '1.0.0',
    status: 'active',
    icon: 'database',
    author: {
      name: 'Data Scientist',
      handle: '@dataclean',
      avatar: 'https://picsum.photos/seed/data/100/100'
    },
    stats: {
      stars: 210,
      downloads: 12000,
      installs: 900
    },
    security: {
      virusTotal: 'Benign',
      openClaw: 'Safe',
      confidence: 'HIGH',
      message: "Verified safe."
    },
    readme: `# DataCleaner\n\nClean your datasets automatically...`,
    history: []
  }
];
