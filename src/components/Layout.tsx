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
  ArrowLeft,
  Globe,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Header = ({ onOpenSettings, showBack, children }: { onOpenSettings: () => void, showBack?: boolean, children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
  <motion.header 
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center justify-between px-4 md:px-6 lg:px-12"
  >
    <div className="flex items-center gap-4">
      {showBack ? (
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">{t('common.back')}</span>
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
      <Link to="/" className="hover:text-black transition-colors">{t('common.home')}</Link>
      <Link to="/marketplace" className="hover:text-black transition-colors">{t('common.marketplace')}</Link>
      <a href="#" className="hover:text-black transition-colors">{t('common.documentation')}</a>
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
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'account' | 'providers' | 'engines'>('account');

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 md:inset-10 lg:inset-20 bg-white shadow-2xl z-[70] md:rounded-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Sidebar / Mobile Header */}
            <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 md:p-6 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 className="text-xl font-bold">{t('settings.title')}</h2>
                <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-200 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'account' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <User size={18} />
                  {t('settings.account')}
                </button>
                <button 
                  onClick={() => setActiveTab('providers')}
                  className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'providers' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Cpu size={18} />
                  {t('settings.globalProviders')}
                </button>
                <button 
                  onClick={() => setActiveTab('engines')}
                  className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'engines' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Layers size={18} />
                  {t('settings.agentEngines')}
                </button>
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-200 hidden md:block">
                <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                  <ArrowLeft size={16} />
                  {t('common.back')}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-white relative">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full hidden md:block">
                <X size={24} />
              </button>

              <div className="max-w-3xl mx-auto">
                {activeTab === 'account' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 md:space-y-8"
                  >
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('settings.myAccount')}</h3>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          <img src="https://picsum.photos/seed/user/200/200" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold">Demo User</h4>
                          <p className="text-gray-500 text-sm">user@example.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                          <button 
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              language === 'en' 
                                ? 'bg-black text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            English
                          </button>
                          <button 
                            onClick={() => setLanguage('zh')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              language === 'zh' 
                                ? 'bg-black text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            中文
                          </button>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'providers' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('settings.globalProviders')}</h3>
                    <div className="space-y-3">
                      {['Gemini', 'Claude', 'OpenAI', 'Mistral'].map(provider => (
                        <div key={provider} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer group bg-white">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                               <Cpu size={24} />
                            </div>
                            <div>
                              <span className="font-bold block">{provider}</span>
                              <span className="text-xs text-gray-400">Connected</span>
                            </div>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'engines' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('settings.agentEngines')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {['AgentScope', 'Claude SDK', 'LangChain', 'AutoGen'].map(engine => (
                          <div key={engine} className="p-6 rounded-xl border border-gray-200 text-center hover:bg-gray-50 cursor-pointer transition-colors bg-white group">
                             <div className="w-12 h-12 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                               <Layers size={24} className="text-gray-400 group-hover:text-black transition-colors" />
                             </div>
                             <span className="text-base font-bold text-gray-900 block mb-1">{engine}</span>
                             <span className="text-xs text-gray-400">v1.0.0</span>
                          </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
