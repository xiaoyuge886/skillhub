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
import { useLanguage } from '../context/LanguageContext';

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
import { Provider, Skill } from '../types';

export default function SkillDebug() {
  const { id } = useParams<{ id: string }>();
  const { getSkill, skills, updateSkill } = useSkills();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<any>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'config' | 'docs'>('config');
  const [rightPanelTab, setRightPanelTab] = useState<'console' | 'tools' | 'chain'>('console');

  // Debug State
  const [selectedProvider, setSelectedProvider] = useState<Provider>('Anthropic');
  const [selectedModel, setSelectedModel] = useState<string>(PROVIDERS['Anthropic'].models[0]);
  
  // Custom Config State
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundSkill = getSkill(id || '');
    if (foundSkill) {
      setSkill(foundSkill);
      if (foundSkill.provider) setSelectedProvider(foundSkill.provider);
      if (foundSkill.model) {
        if (foundSkill.provider === 'Custom') {
          setCustomModel(foundSkill.model);
        } else {
          setSelectedModel(foundSkill.model);
        }
      }
      if (foundSkill.baseUrl) setCustomBaseUrl(foundSkill.baseUrl);
      if (foundSkill.apiKey) setCustomApiKey(foundSkill.apiKey);
      if (foundSkill.systemPrompt) setSystemPrompt(foundSkill.systemPrompt);
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

    // Call real API
    runAgent(promptInput);
  };

  const runAgent = async (prompt: string) => {
    const responseId = (Date.now() + 1).toString();
    const initialResponse: ConsoleMessage = {
      id: responseId,
      type: 'assistant',
      content: "",
      timestamp: Date.now(),
      tasks: []
    };

    setMessages(prev => [...prev, initialResponse]);

    try {
      const params = new URLSearchParams({
        prompt,
        engine: skill.engine || 'Mock',
        skillId: skill.id,
        apiKey: selectedProvider === 'Custom' ? customApiKey : '',
        apiUrl: selectedProvider === 'Custom' ? customBaseUrl : '',
        model: selectedProvider === 'Custom' ? customModel : selectedModel
      });

      const eventSource = new EventSource(`/api/debug/run?${params.toString()}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'assistant' && data.message?.content) {
          const content = data.message.content.map((c: any) => c.text).join('\n');
          setMessages(prev => prev.map(msg => {
            if (msg.id === responseId) {
              return { ...msg, content: msg.content + content };
            }
            return msg;
          }));
        }

        if (data.type === 'result') {
          setMessages(prev => prev.map(msg => {
            if (msg.id === responseId) {
              return {
                ...msg,
                stats: {
                  duration: `${(data.duration_ms / 1000).toFixed(1)}s`,
                  tokens: data.usage?.total_tokens || 0,
                  cost: `$${data.total_cost_usd || 0}`
                }
              };
            }
            return msg;
          }));
        }
      };

      eventSource.addEventListener('done', () => {
        eventSource.close();
        setIsRunning(false);
      });

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        eventSource.close();
        setIsRunning(false);
        setMessages(prev => prev.map(msg => {
          if (msg.id === responseId) {
            return { ...msg, content: msg.content + "\n\n[Error occurred during execution]" };
          }
          return msg;
        }));
      };

    } catch (error) {
      console.error('Failed to run agent:', error);
      setIsRunning(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!skill) return;
    
    const updates = {
      provider: selectedProvider,
      model: selectedProvider === 'Custom' ? customModel : selectedModel,
      baseUrl: customBaseUrl,
      apiKey: customApiKey,
      systemPrompt: systemPrompt
    };
    
    await updateSkill(skill.id, updates);
    setIsConfigOpen(false);
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
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('debug.settings.runtime')}</h3>
            
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-[13px] font-medium text-gray-900 mb-2 ml-1">{t('debug.settings.provider')}</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                            <Server size={16} strokeWidth={2} />
                        </div>
                        <select 
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value as Provider)}
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
                        <label className="block text-[13px] font-medium text-gray-900 mb-2 ml-1">{t('debug.settings.model')}</label>
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
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{t('debug.settings.baseUrl')}</label>
                            <input 
                                type="text"
                                value={customBaseUrl}
                                onChange={(e) => setCustomBaseUrl(e.target.value)}
                                placeholder="https://api.example.com/v1"
                                className="w-full bg-white border-none rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{t('debug.settings.apiKey')}</label>
                            <input 
                                type="password"
                                value={customApiKey}
                                onChange={(e) => setCustomApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-white border-none rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{t('debug.settings.modelName')}</label>
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
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('debug.settings.systemPrompt')}</h3>
                <button className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors">{t('debug.settings.reset')}</button>
            </div>
            <textarea 
                className="w-full h-40 bg-[#F5F5F7] hover:bg-[#E8E8ED] border-none rounded-xl p-4 text-[13px] leading-relaxed resize-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                placeholder={t('debug.settings.systemPromptPlaceholder')}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 ml-1">
                {t('debug.settings.systemPromptDesc')}
            </p>
        </div>
    </div>
  );

  if (!skill) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading skill...</p>
        </div>
      </div>
    );
  }

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
      <Header showBack={true} onOpenSettings={() => setIsConfigOpen(true)}>
      </Header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 lg:px-6 pb-0 pt-20 max-w-[1600px] mx-auto w-full overflow-hidden">
            
            {/* Left Panel: Removed as requested by user to use a popup instead */}

            {/* Configuration Modal (Desktop & Mobile) */}
            <AnimatePresence>
                {isConfigOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                            onClick={() => setIsConfigOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white shadow-2xl z-[70] rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                                        <Settings size={16} />
                                    </div>
                                    <h2 className="text-lg font-bold">{t('debug.settings.title')}</h2>
                                </div>
                                <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="px-6 pt-4">
                                <div className="relative flex items-center bg-[#E5E5EA] p-1 rounded-lg w-full h-9">
                                    <motion.div
                                        layoutId="modalTab"
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
                                        {t('debug.settings.tabs.config')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('docs')}
                                        className={`relative flex-1 text-[13px] font-medium z-10 transition-colors duration-200 ${
                                            activeTab === 'docs' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {t('debug.settings.tabs.docs')}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'config' ? (
                                        <motion.div 
                                            key="config"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ConfigurationContent />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="docs"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-600 prose-pre:bg-[#F5F5F7] prose-pre:border-none prose-pre:rounded-xl"
                                        >
                                            <Markdown>{skill?.readme || '# No documentation available'}</Markdown>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                                <button 
                                    onClick={handleSaveConfig}
                                    className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                                >
                                    {t('debug.settings.saveClose')}
                                </button>
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
                        <h2 className="font-bold text-gray-900 text-sm">{skill?.name} {t('debug.pageTitleSuffix')}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{t('debug.systemOperational')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setIsConfigOpen(true)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        title="Model Configuration"
                    >
                        <Settings size={12} />
                        {t('debug.tabs.config')}
                    </button>
                    <div className="w-px h-3 bg-gray-300 mx-0.5" />
                    {[
                        { id: 'console', label: t('debug.tabs.trace'), icon: Activity },
                        { id: 'tools', label: t('debug.tabs.tools'), icon: Wrench },
                        { id: 'chain', label: t('debug.tabs.chain'), icon: LinkIcon },
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
                                <p className="text-sm font-medium">{t('debug.placeholder.ready')}</p>
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
                    <div className="p-6 bg-white border-t border-gray-100">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
                                <textarea
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={t('debug.placeholder.input')}
                                    className="w-full bg-transparent border-none px-4 pt-4 pb-14 text-[15px] focus:ring-0 resize-none max-h-60 min-h-[60px] text-gray-800 placeholder:text-gray-400"
                                    rows={1}
                                />
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Upload files">
                                            <Paperclip size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Video">
                                            <Video size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Voice">
                                            <Mic size={18} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!promptInput.trim() || isRunning}
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                                            promptInput.trim() && !isRunning
                                            ? 'bg-black text-white shadow-lg shadow-black/10 hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0' 
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <span className="text-[11px] text-gray-400 font-medium">{t('debug.placeholder.disclaimer')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Stream (Right - Visible on large screens or when tab active) */}
                <div className={`w-[400px] border-l border-gray-200 bg-white flex flex-col ${rightPanelTab === 'console' ? 'hidden xl:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 uppercase tracking-tight">
                            {rightPanelTab === 'console' && <><Activity size={16} className="text-blue-500" /> {t('debug.streams.trace')}</>}
                            {rightPanelTab === 'tools' && <><Wrench size={16} className="text-orange-500" /> {t('debug.streams.tools')}</>}
                            {rightPanelTab === 'chain' && <><LinkIcon size={16} className="text-purple-500" /> {t('debug.streams.chain')}</>}
                        </h3>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            <button className="px-2 py-1 text-[10px] font-medium bg-white shadow-sm rounded-md text-gray-900">{t('debug.streams.live')}</button>
                            <button className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900">{t('debug.streams.history')}</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {rightPanelTab === 'console' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <p className="text-[13px] text-blue-900 leading-relaxed">
                                        <span className="font-bold">{t('debug.streams.live')}:</span> {t('debug.monitoring.traceDesc')}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Raw Output</span>
                                        <span className="text-blue-500">{t('debug.monitoring.streaming')}</span>
                                    </div>
                                    <div className="bg-gray-900 rounded-xl p-4 font-mono text-[12px] text-gray-300 leading-relaxed shadow-inner">
                                        <div className="text-green-400 mb-2">{"{"}</div>
                                        <div className="pl-4">
                                            <div>"status": "generating",</div>
                                            <div>"tokens_per_sec": 45.2,</div>
                                            <div>"buffer_size": "1.2kb",</div>
                                            <div className="text-blue-400">"content": "Analyzing sales data..."</div>
                                        </div>
                                        <div className="text-green-400">{"}"}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {rightPanelTab === 'tools' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                    <p className="text-[13px] text-orange-900 leading-relaxed">
                                        <span className="font-bold">Tool Monitor:</span> {t('debug.monitoring.toolDesc')}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'get_sales_data', status: 'success', time: '1.2s' },
                                        { name: 'generate_chart', status: 'running', time: '0.4s' },
                                        { name: 'send_notification', status: 'pending', time: '-' }
                                    ].map((tool, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    tool.status === 'success' ? 'bg-green-500' :
                                                    tool.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                                                }`} />
                                                <span className="text-[13px] font-mono font-medium text-gray-700">{tool.name}</span>
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-mono">{tool.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {rightPanelTab === 'chain' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                                    <p className="text-[13px] text-purple-900 leading-relaxed">
                                        <span className="font-bold">Call Chain:</span> {t('debug.monitoring.chainDesc')}
                                    </p>
                                </div>
                                <div className="relative pl-4 space-y-8">
                                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100" />
                                    {[
                                        { label: 'User Input', type: 'input' },
                                        { label: 'Intent Classifier', type: 'model' },
                                        { label: 'Data Retrieval', type: 'tool' },
                                        { label: 'Response Synthesis', type: 'model' }
                                    ].map((step, i) => (
                                        <div key={i} className="relative flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                                                i === 0 ? 'bg-blue-500' : 'bg-purple-500'
                                            }`} />
                                            <div className="flex-1 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <span className="text-[12px] font-bold text-gray-900">{step.label}</span>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{step.type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
