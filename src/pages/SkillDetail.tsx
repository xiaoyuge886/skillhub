import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Play, 
  Cpu, 
  Layers, 
  Check, 
  Terminal, 
  ArrowLeft, 
  Star, 
  Download, 
  Shield, 
  AlertTriangle, 
  FileText, 
  GitCompare, 
  History, 
  Activity,
  ExternalLink,
  Settings
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Header, SettingsPanel, SkillIcon } from '../components/Layout';
import { useSkills } from '../context/SkillContext';

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const { getSkill, skills } = useSkills();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'compare' | 'versions'>('files');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  useEffect(() => {
    const foundSkill = getSkill(id || '');
    if (foundSkill) {
      setSkill(foundSkill);
    }
  }, [id, skills, getSkill]);

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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-20 font-sans">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} showBack={true} />
      
      <main className="pt-24 px-4 lg:px-8 max-w-6xl mx-auto space-y-6">
        
        {/* Top Card: Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                {skill.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span>{skill.stats.stars}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={16} />
                  <span>{formatNumber(skill.stats.downloads)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={16} />
                  <span>{skill.stats.installs} current installs</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span>•</span>
                   <span>{skill.stats.installs + 50} all-time installs</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-gray-500 text-sm">by</span>
                <img src={skill.author.avatar} alt={skill.author.name} className="w-6 h-6 rounded-full" />
                <span className="font-medium text-gray-900 text-sm">{skill.author.handle}</span>
              </div>

              {/* Security Scan Box */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Security Scan</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-32">
                      <Shield size={16} className="text-red-500" />
                      <span className="font-medium text-gray-900">VirusTotal</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      skill.security.virusTotal === 'Benign' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {skill.security.virusTotal}
                    </span>
                    <a href="#" className="text-xs text-red-500 hover:underline flex items-center gap-1">
                      View report <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-32">
                      <img src="https://picsum.photos/seed/claw/20/20" className="w-4 h-4 rounded-full" alt="Claw" />
                      <span className="font-medium text-gray-900">OpenClaw</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      skill.security.openClaw === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {skill.security.openClaw}
                    </span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                      {skill.security.confidence} CONFIDENCE
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 border-l-2 border-amber-200 pl-3">
                  {skill.security.message}
                  <a href="#" className="text-red-500 ml-1 hover:underline">Details ▾</a>
                </p>

                <div className="text-xs text-gray-400 italic">
                  Like a lobster shell, security has layers — review code before you run it.
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                  latest v{skill.version}
                </span>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-col gap-4 min-w-[200px]">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Current Version</div>
                <div className="font-mono font-bold text-gray-900">v{skill.version}</div>
              </div>
              <button className="w-full py-3 bg-[#D95C41] hover:bg-[#C14930] text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
                Download zip
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Card: Content Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
            {[
              { id: 'files', label: 'Files', icon: FileText },
              { id: 'compare', label: 'Compare', icon: GitCompare },
              { id: 'versions', label: 'Versions', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
            <button
                onClick={() => navigate(`/skill/${skill.id}/debug`)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg ml-auto transform hover:-translate-y-0.5"
              >
                <Play size={16} className="fill-current" />
                Debug & Run
            </button>
          </div>

          <div className="flex-1 p-8">
            {activeTab === 'files' && (
              <div className="prose prose-slate max-w-none">
                <div className="text-sm text-gray-500 font-mono mb-6 pb-2 border-b border-gray-100">
                  SKILL.md
                </div>
                <Markdown
                  components={{
                    code({node, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return (
                        <code className={`${className} bg-gray-100 text-red-500 rounded px-1 py-0.5 font-mono text-sm`} {...props}>
                          {children}
                        </code>
                      )
                    },
                    pre({children}) {
                      return (
                        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto my-4">
                          {children}
                        </pre>
                      )
                    }
                  }}
                >
                  {skill.readme}
                </Markdown>
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Versions</h2>
                  <p className="text-gray-500">Download older releases or scan the changelog.</p>
                </div>

                <div className="space-y-8">
                  {skill.history && skill.history.length > 0 ? (
                    skill.history.map((version, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-8 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm font-medium text-gray-500">v{version.version} · {version.date}</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">{skill.name} v{version.version}</h3>
                          
                          <ul className="space-y-2 mb-4">
                            {version.changes.map((change, i) => (
                              <li key={i} className="text-gray-600 text-sm leading-relaxed flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                                {change}
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Shield size={12} />
                              {version.security.virusTotal}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              <img src="https://picsum.photos/seed/claw/20/20" className="w-3 h-3 rounded-full" alt="Claw" />
                              {version.security.openClaw}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            Zip
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <History size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No version history available.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <GitCompare size={32} />
                </div>
                <p>No history available for this version.</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
          <p className="text-gray-500 mb-6">Sign in to comment.</p>
        </div>
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
