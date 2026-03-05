import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Settings, 
  Play, 
  Code, 
  Cpu, 
  Layers, 
  Zap, 
  BarChart2, 
  Feather, 
  Database, 
  Plus,
  X,
  Check,
  Terminal,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = ({ onOpenSettings, showBack, children }: { onOpenSettings: () => void, showBack?: boolean, children?: React.ReactNode }) => {
  const navigate = useNavigate();
  
  return (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center justify-between px-6 lg:px-12"
  >
    <div className="flex items-center gap-4">
      {showBack ? (
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      ) : (
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-display font-semibold text-xl tracking-tight">SkillHub</span>
        </Link>
      )}
    </div>
    
    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
      <Link to="/" className="text-black">Discover</Link>
      <a href="#" className="hover:text-black transition-colors">Marketplace</a>
      <a href="#" className="hover:text-black transition-colors">Documentation</a>
    </nav>

    <div className="flex items-center gap-4">
      {children}
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onOpenSettings}>
        <Settings size={20} className="text-gray-600" />
      </button>
      <button className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
        <img src="https://picsum.photos/seed/user/100/100" alt="User" />
      </button>
    </div>
  </motion.header>
)};

export const SkillIcon = ({ icon }: { icon: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'bar-chart-2': <BarChart2 size={24} />,
    'code': <Code size={24} />,
    'feather': <Feather size={24} />,
    'database': <Database size={24} />,
    'zap': <Zap size={24} />,
  };
  return icons[icon] || <Zap size={24} />;
};

export const SettingsPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Global Providers</h3>
                <div className="space-y-3">
                  {['Gemini', 'Claude', 'OpenAI', 'Mistral'].map(provider => (
                    <div key={provider} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                           <Cpu size={20} />
                        </div>
                        <span className="font-medium">{provider}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Agent Engines</h3>
                <div className="grid grid-cols-2 gap-3">
                   {['AgentScope', 'Claude SDK', 'LangChain', 'AutoGen'].map(engine => (
                      <div key={engine} className="p-4 rounded-xl border border-gray-200 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                         <Layers size={24} className="mx-auto mb-2 text-gray-400" />
                         <span className="text-sm font-medium">{engine}</span>
                      </div>
                   ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
