# SkillHub - AI Agent Skill Management & Debugging Platform

SkillHub 是一个现代化的 AI Agent Skill 管理与调试平台。它提供了一站式的解决方案，用于创建、配置、测试和可视化 AI Agent 的能力（Skills）。

![SkillHub Interface](https://via.placeholder.com/1200x600?text=SkillHub+Dashboard)

## ✨ 核心特性

*   **Skill 管理中心**：直观地创建、查看和管理您的 AI Skills。
*   **强大的调试引擎 (Debug Engine)**：
    *   **实时交互控制台**：类似 Chat 的调试界面，支持流式输出。
    *   **任务执行可视化**：清晰展示 Agent 的思考过程、任务拆解和执行状态。
    *   **多模态支持**：模拟支持文本、文件、语音等多种输入方式。
*   **智能分析流 (Analysis Stream)**：
    *   **数据可视化**：自动生成图表（折线图、柱状图、饼图）展示分析结果。
    *   **关键洞察**：自动提取数据中的关键信息和趋势。
*   **灵活的运行时配置**：
    *   支持 **Anthropic** (Claude 3.5 Sonnet 等)、**OpenAI** (GPT-4o 等) 模型。
    *   支持 **自定义 (Custom)** OpenAI 兼容接口，方便接入本地模型或私有部署模型。
*   **模拟环境**：内置 `ClaudeRunner` 和 `MockRunner`，无需消耗真实 Token 即可测试前端交互流程。

## 🛠️ 技术栈

本项目采用全栈 TypeScript 开发，利用 Vite 的中间件模式实现前后端紧密集成。

*   **前端 (Frontend)**:
    *   [React 19](https://react.dev/) - 构建用户界面的核心库
    *   [Tailwind CSS v4](https://tailwindcss.com/) - 原子化 CSS 框架
    *   [Framer Motion](https://www.framer.com/motion/) - 丝滑的动画效果
    *   [Lucide React](https://lucide.dev/) - 精美的图标库
    *   [React Router v7](https://reactrouter.com/) - 路由管理

*   **后端 (Backend)**:
    *   [Express](https://expressjs.com/) - Web 服务器
    *   [Vite](https://vitejs.dev/) (Middleware Mode) - 开发服务器与构建工具
    *   [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) - 轻量级本地数据库
    *   **Server-Sent Events (SSE)** - 实现实时的流式调试输出

## 🚀 快速开始

### 前置要求

*   Node.js (v18 或更高版本)
*   npm 或 yarn

### 安装

1.  克隆仓库：
    ```bash
    git clone https://github.com/your-username/skillhub.git
    cd skillhub
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  配置环境变量 (可选)：
    复制 `.env.example` 到 `.env` 并填入您的 API Key（如果需要真实调用）。
    ```bash
    cp .env.example .env
    ```

### 运行开发服务器

启动全栈开发环境（包含 Express 后端和 Vite 前端）：

```bash
npm run dev
```

访问 `http://localhost:3000` 即可看到应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📂 项目结构

```
skillhub/
├── server/                 # 后端代码
│   ├── engine/             # Agent 运行引擎 (ClaudeRunner, MockRunner)
│   ├── db.ts               # 数据库连接与操作
│   └── ...
├── src/                    # 前端代码
│   ├── components/         # 可复用组件 (Layout, Header 等)
│   ├── context/            # React Context (SkillContext)
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── SkillDetail.tsx # 详情页
│   │   ├── SkillDebug.tsx  # 调试页 (核心功能)
│   │   └── CreateSkill.tsx # 创建页
│   ├── types.ts            # TypeScript 类型定义
│   └── ...
├── server.ts               # 服务端入口 (Express + Vite Middleware)
├── skills.db               # SQLite 数据库文件 (自动生成)
├── package.json            # 项目依赖与脚本
└── README.md               # 项目文档
```

## 📖 使用指南

1.  **创建 Skill**：点击首页的 "Create New Skill"，填写名称、描述、版本和系统提示词 (System Prompt)。
2.  **调试 Skill**：
    *   进入 Skill 详情页，点击右上角的 **"Debug & Run"** 按钮。
    *   在左侧配置面板选择 Provider (如 Anthropic) 和 Model。
    *   在右侧控制台输入测试指令（例如 "Analyze sales data"）。
    *   观察控制台的任务执行进度和右侧 Analysis 面板的图表输出。
3.  **自定义模型**：
    *   在调试页配置中选择 "Custom" Provider。
    *   输入您的 Base URL (例如 `http://localhost:11434/v1` for Ollama) 和 API Key。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[Apache-2.0](LICENSE)
