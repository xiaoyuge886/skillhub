import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  Settings, 
  Server, 
  Key, 
  Globe,
  Cpu,
  FileText,
  Send,
  Paperclip,
  Mic,
  Video,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Activity,
  Layout,
  Box,
  Wrench,
  Link as LinkIcon,
  BarChart2,
  PieChart,
  LineChart,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  RefreshCw,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Header } from '../components/Layout';
import { useSkills } from '../context/SkillContext';

const PROVIDERS = {
  'Anthropic': {
    name: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  },
  'OpenAI': {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  'Custom': {
    name: 'Custom (OpenAI Compatible)',
    models: [],
  }
};

type MessageType = 'user' | 'assistant' | 'system';

interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

interface ConsoleMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  tasks?: TaskStep[];
  stats?: {
    duration: string;
    tokens: number;
    cost: string;
  };
  artifacts?: {
    type: 'chart' | 'file';
    data: any;
  }[];
}

import { motion, AnimatePresence } from 'motion/react';

export default function SkillDebug() {
  const { id } = useParams<{ id: string }>();
  const { getSkill, skills } = useSkills();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'config' | 'docs'>('config');
  const [rightPanelTab, setRightPanelTab] = useState<'console' | 'analysis'>('console');

  // Debug State
  const [selectedProvider, setSelectedProvider] = useState<string>('Anthropic');
  const [selectedModel, setSelectedModel] = useState<string>(PROVIDERS['Anthropic'].models[0]);
  
  // Custom Config State
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundSkill = getSkill(id || '');
    if (foundSkill) {
      setSkill(foundSkill);
    }
  }, [id, skills, getSkill]);

  useEffect(() => {
    if (selectedProvider !== 'Custom') {
      setSelectedModel(PROVIDERS[selectedProvider as keyof typeof PROVIDERS].models[0]);
    }
  }, [selectedProvider]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-600">Loading Skill...</h2>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!promptInput.trim() || isRunning) return;

    const userMsg: ConsoleMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: promptInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setPromptInput('');
    setIsRunning(true);

    // Simulate Agent Execution
    simulateAgentRun(promptInput);
  };

  const simulateAgentRun = async (prompt: string) => {
    // 1. Initial System/Assistant Response with Tasks
    const responseId = (Date.now() + 1).toString();
    const initialResponse: ConsoleMessage = {
      id: responseId,
      type: 'assistant',
      content: "I'll help you analyze that. Starting the workflow now...",
      timestamp: Date.now(),
      tasks: [
        { id: '1', label: 'Analyze request intent', status: 'running' },
        { id: '2', label: 'Fetch relevant data', status: 'pending' },
        { id: '3', label: 'Generate visualization', status: 'pending' }
      ]
    };

    setMessages(prev => [...prev, initialResponse]);

    // Simulate Step 1 Completion
    await new Promise(r => setTimeout(r, 1000));
    updateMessageTasks(responseId, 0, 'completed');
    updateMessageTasks(responseId, 1, 'running');

    // Simulate Step 2 Completion
    await new Promise(r => setTimeout(r, 1500));
    updateMessageTasks(responseId, 1, 'completed');
    updateMessageTasks(responseId, 2, 'running');

    // Simulate Step 3 Completion & Add Artifacts
    await new Promise(r => setTimeout(r, 1500));
    updateMessageTasks(responseId, 2, 'completed');

    setMessages(prev => prev.map(msg => {
      if (msg.id === responseId) {
        return {
          ...msg,
          content: "Analysis complete. Here is the data visualization you requested.",
          stats: {
            duration: '4.2s',
            tokens: 1250,
            cost: '$0.004'
          },
          artifacts: [
            { type: 'chart', data: { title: 'Sales Trend 2024' } }
          ]
        };
      }
      return msg;
    }));

    setIsRunning(false);
    
    // Auto-switch to analysis tab if chart is generated
    // setRightPanelTab('analysis'); 
  };

  const updateMessageTasks = (msgId: string, taskIndex: number, status: 'pending' | 'running' | 'completed') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.tasks) {
        const newTasks = [...msg.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], status };
        return { ...msg, tasks: newTasks };
      }
      return msg;
    }));
  };

  const ConfigurationContent = () => (
    <div className="space-y-8">
        {/* Provider Section */}
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1">Runtime</h3>
            
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-[13px] font-medium text-gray-900 mb-2 ml-1">Provider</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                            <Server size={16} strokeWidth={2} />
                        </div>
                        <select 
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="w-full bg-[#F5F5F7] hover:bg-[#E8E8ED] border-none rounded-xl pl-10 pr-8 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                        >
                            {Object.keys(PROVIDERS).map(p => (
                                <option key={p} value={p}>{PROVIDERS[p as keyof typeof PROVIDERS].name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {selectedProvider !== 'Custom' ? (
                    <div className="group">
                        <label className="block text-[13px] font-medium text-gray-900 mb-2 ml-1">Model</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                                <Cpu size={16} strokeWidth={2} />
                            </div>
                            <select 
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-[#F5F5F7] hover:bg-[#E8E8ED] border-none rounded-xl pl-10 pr-8 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                            >
                                {PROVIDERS[selectedProvider as keyof typeof PROVIDERS].models.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 p-4 bg-[#F5F5F7] rounded-2xl">
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Base URL</label>
                            <input 
                                type="text"
                                value={customBaseUrl}
                                onChange={(e) => setCustomBaseUrl(e.target.value)}
                                placeholder="https://api.example.com/v1"
                                className="w-full bg-white border-none rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">API Key</label>
                            <input 
                                type="password"
                                value={customApiKey}
                                onChange={(e) => setCustomApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-white border-none rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Model Name</label>
                            <input 
                                type="text"
                                value={customModel}
                                onChange={(e) => setCustomModel(e.target.value)}
                                placeholder="my-custom-model"
                                className="w-full bg-white border-none rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="w-full h-px bg-gray-100" />

        {/* System Prompt Section */}
        <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">System Prompt</h3>
                <button className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors">Reset</button>
            </div>
            <textarea 
                className="w-full h-40 bg-[#F5F5F7] hover:bg-[#E8E8ED] border-none rounded-xl p-4 text-[13px] leading-relaxed resize-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                placeholder="You are a helpful assistant..."
                defaultValue={skill.systemPrompt || ''}
            />
            <p className="text-[11px] text-gray-400 ml-1">
                Define the core behavior and personality of your agent.
            </p>
        </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#f9f9f9] font-sans flex flex-col overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
      <Header showBack={true} onOpenSettings={() => setIsMobileConfigOpen(true)}>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span>/</span>
            <span>{skill.name}</span>
            <span>/</span>
            <span className="text-gray-900">Debug</span>
        </div>
      </Header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-6 pb-6 pt-20 max-w-[1600px] mx-auto w-full overflow-hidden">
            
            {/* Left Panel: Configuration (Desktop) */}
            <div className="hidden lg:flex w-[340px] flex-shrink-0 flex-col gap-6 h-full overflow-hidden bg-transparent border-none">
                
                {/* Apple-style Segmented Control */}
                <div className="flex-shrink-0 px-1">
                    <div className="relative flex items-center bg-[#E5E5EA] p-1 rounded-lg w-full h-9">
                        {/* Active Tab Background Animation */}
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bg-white shadow-sm rounded-[6px] h-7 top-1"
                            initial={false}
                            animate={{
                                width: 'calc(50% - 4px)',
                                x: activeTab === 'config' ? 0 : '100%'
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`relative flex-1 text-[13px] font-medium z-10 transition-colors duration-200 ${
                                activeTab === 'config' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('docs')}
                            className={`relative flex-1 text-[13px] font-medium z-10 transition-colors duration-200 ${
                                activeTab === 'docs' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Documentation
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'config' ? (
                            <motion.div 
                                key="config"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ConfigurationContent />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="docs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-600 prose-pre:bg-[#F5F5F7] prose-pre:border-none prose-pre:rounded-xl"
                            >
                                <Markdown>{skill.readme || '# No documentation available'}</Markdown>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Configuration Modal */}
            <AnimatePresence>
                {isMobileConfigOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setIsMobileConfigOpen(false)}
                        />
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 top-10 bg-white shadow-2xl z-[70] rounded-t-2xl overflow-hidden flex flex-col lg:hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold">Configuration</h2>
                                <button onClick={() => setIsMobileConfigOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <ConfigurationContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        {/* Right Panel: Intelligence Console */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            
            {/* Console Header */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <Terminal size={16} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm">Intelligence Console</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">System Operational</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'console', label: 'Trace', icon: Activity },
                        { id: 'browser', label: 'Browser', icon: Globe },
                        { id: 'resources', label: 'Resources', icon: Box },
                        { id: 'tools', label: 'Tools', icon: Wrench },
                        { id: 'chain', label: 'Chain', icon: LinkIcon },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setRightPanelTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                rightPanelTab === tab.id || (tab.id === 'console' && rightPanelTab === 'console')
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden bg-[#fafafa]">
                
                {/* Chat Stream (Left) */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <Play size={32} className="text-gray-300 ml-1" />
                                </div>
                                <p className="text-sm font-medium">Ready to start debugging session</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                                    msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-black text-white'
                                }`}>
                                    {msg.type === 'user' ? <Settings size={16} /> : <Cpu size={16} />}
                                </div>
                                
                                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Message Bubble */}
                                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.type === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>

                                    {/* Task Progress Card */}
                                    {msg.tasks && (
                                        <div className="w-full min-w-[320px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-2">
                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                                                    <Layout size={12} /> Task Progress
                                                </span>
                                                <span className="text-xs font-mono text-gray-400">
                                                    {msg.tasks.filter(t => t.status === 'completed').length}/{msg.tasks.length}
                                                </span>
                                            </div>
                                            <div className="p-2">
                                                {msg.tasks.map((task, idx) => (
                                                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                            task.status === 'completed' ? 'bg-green-50 border-green-200 text-green-600' :
                                                            task.status === 'running' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                                            'bg-gray-50 border-gray-200 text-gray-300'
                                                        }`}>
                                                            {task.status === 'completed' ? <CheckCircle2 size={12} /> : 
                                                             task.status === 'running' ? <div className="w-2 h-2 bg-current rounded-full animate-pulse" /> :
                                                             <div className="w-2 h-2 bg-current rounded-full" />}
                                                        </div>
                                                        <span className={`text-xs font-medium ${
                                                            task.status === 'pending' ? 'text-gray-400' : 'text-gray-700'
                                                        }`}>{task.label}</span>
                                                        {task.status === 'completed' && <span className="ml-auto text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">Done</span>}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-1 bg-gray-100 w-full">
                                                <div 
                                                    className="h-full bg-green-500 transition-all duration-500"
                                                    style={{ width: `${(msg.tasks.filter(t => t.status === 'completed').length / msg.tasks.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats & Actions */}
                                    {msg.type === 'assistant' && (
                                        <div className="flex items-center gap-4 mt-1 px-1">
                                            {msg.stats && (
                                                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                                                    <span>{msg.stats.duration}</span>
                                                    <span>•</span>
                                                    <span>{msg.stats.tokens} toks</span>
                                                    <span>•</span>
                                                    <span>{msg.stats.cost}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 ml-auto">
                                                <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><ThumbsUp size={14} /></button>
                                                <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><ThumbsDown size={14} /></button>
                                                <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><RefreshCw size={14} /></button>
                                                <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><Edit2 size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative bg-gray-50 border border-gray-200 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                            <textarea
                                value={promptInput}
                                onChange={(e) => setPromptInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Send a message to start debugging..."
                                className="w-full bg-transparent border-none px-4 py-3 text-sm focus:ring-0 resize-none max-h-32 min-h-[52px]"
                                rows={1}
                            />
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors">
                                        <Paperclip size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors">
                                        <Video size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors">
                                        <Mic size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!promptInput.trim() || isRunning}
                                    className={`p-2 rounded-xl transition-all ${
                                        promptInput.trim() && !isRunning
                                        ? 'bg-black text-white shadow-md hover:bg-gray-800' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">AI can make mistakes. Please review generated results.</span>
                        </div>
                    </div>
                </div>

                {/* Analysis Stream (Right - Visible on large screens or when tab active) */}
                <div className={`w-[400px] border-l border-gray-200 bg-white flex flex-col ${rightPanelTab === 'console' ? 'hidden xl:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Activity size={16} className="text-blue-500" />
                            ANALYSIS STREAM
                        </h3>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            <button className="px-2 py-1 text-[10px] font-medium bg-white shadow-sm rounded-md text-gray-900">Report</button>
                            <button className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900">Deep Dive</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose prose-sm">
                            <p className="text-gray-600 mb-6">
                                Based on your request, I've generated a visualization of the sales trends. The data indicates a strong upward trajectory in Q3.
                            </p>
                        </div>

                        {/* Chart Visualization Mock */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs rounded-lg shadow-sm">
                                    <LineChart size={14} /> Line
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-xs rounded-lg transition-colors">
                                    <BarChart2 size={14} /> Bar
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-xs rounded-lg transition-colors">
                                    <PieChart size={14} /> Pie
                                </button>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h4 className="text-center font-bold text-gray-900 mb-2">2024 Sales Trend Analysis</h4>
                                <p className="text-center text-xs text-gray-500 mb-8">Revenue (Millions USD)</p>
                                
                                {/* CSS-only Mock Chart */}
                                <div className="h-64 w-full flex items-end justify-between gap-2 px-4 relative">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-full h-px bg-gray-50 border-t border-dashed border-gray-200"></div>
                                        ))}
                                    </div>
                                    
                                    {/* Bars/Points */}
                                    {[30, 45, 42, 55, 78, 82, 80, 95, 100, 115, 120, 125].map((h, i) => (
                                        <div key={i} className="relative group w-full flex flex-col justify-end items-center h-full z-10">
                                            <div 
                                                className="w-full max-w-[20px] bg-blue-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-500"
                                                style={{ height: `${h * 0.6}%` }}
                                            ></div>
                                            <div className="absolute -bottom-6 text-[10px] text-gray-400">{i + 1}M</div>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ${h * 10}k
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h5 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <Activity size={14} /> Key Insights
                                </h5>
                                <ul className="space-y-2">
                                    <li className="text-xs text-blue-700 flex items-start gap-2">
                                        <span className="mt-1 w-1 h-1 bg-blue-500 rounded-full flex-shrink-0"></span>
                                        Significant growth observed in Q3 (August-September).
                                    </li>
                                    <li className="text-xs text-blue-700 flex items-start gap-2">
                                        <span className="mt-1 w-1 h-1 bg-blue-500 rounded-full flex-shrink-0"></span>
                                        Retention rates stabilized at 85% during peak season.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
