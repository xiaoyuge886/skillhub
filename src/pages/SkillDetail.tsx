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
  Settings,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Copy,
  Code,
  Plus,
  Save,
  X,
  Edit2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Header, SettingsPanel, SkillIcon } from '../components/Layout';
import { useSkills } from '../context/SkillContext';
import { useLanguage } from '../context/LanguageContext';

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const { getSkill, skills, refreshSkills } = useSkills();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'compare' | 'versions'>('files');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<any>(null);
  const [skillFiles, setSkillFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { t } = useLanguage();
  
  const fetchFiles = async () => {
    if (!skill || !skill.id) return;
    
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`/api/skills/${skill.id}/files`);
      if (response.ok) {
        const files = await response.json();
        setSkillFiles(files);
        return files;
      }
    } catch (error) {
      console.error('Failed to fetch skill files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
    return [];
  };

  useEffect(() => {
    const foundSkill = getSkill(id || '');
    if (foundSkill) {
      setSkill(foundSkill);
    }
  }, [id, skills, getSkill]);

  useEffect(() => {
    const loadInitialFiles = async () => {
      const files = await fetchFiles();
      
      // Set initial active file
      if (files && files.length > 0) {
        // Find SKILL.md or README.md or first file
        const findInitialFile = (items: any[]): any => {
          // First pass: look for readme files in current level
          for (const item of items) {
            if (item.type === 'file' && (item.name.toLowerCase() === 'skill.md' || item.name.toLowerCase() === 'readme.md')) return item;
          }
          // Second pass: look for any file in current level
          const firstFile = items.find(i => i.type === 'file');
          if (firstFile) return firstFile;
          
          // Third pass: recurse into folders
          for (const item of items) {
            if (item.type === 'folder' && item.children) {
              const found = findInitialFile(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const initial = findInitialFile(files);
        if (initial) {
          handleFileSelect(initial);
        } else {
          setActiveFile({ name: 'SKILL.md', type: 'file', content: skill?.readme });
        }
      } else if (skill) {
        // Fallback to readme if no files found
        setActiveFile({ name: 'SKILL.md', type: 'file', content: skill.readme });
      }
    };

    if (skill?.id) {
      loadInitialFiles();
    }
  }, [skill?.id]);

  const handleFileSelect = async (file: any) => {
    if (file.type === 'folder') return;
    
    setIsEditing(false);
    try {
      const pathParam = file.path || file.name;
      const response = await fetch(`/api/skills/${skill.id}/files/content?path=${encodeURIComponent(pathParam)}`);
      if (response.ok) {
        const data = await response.json();
        setActiveFile({ ...file, content: data.content });
        setEditedContent(data.content);
      } else {
        // Fallback for mock/non-existent files
        const content = file.content || '// Error loading file content';
        setActiveFile({ ...file, content });
        setEditedContent(content);
      }
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      const content = file.content || '// Error loading file content';
      setActiveFile({ ...file, content });
      setEditedContent(content);
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile || !skill) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/skills/${skill.id}/files/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeFile.path || activeFile.name,
          content: editedContent
        })
      });
      
      if (response.ok) {
        setActiveFile({ ...activeFile, content: editedContent });
        setIsEditing(false);
        // Refresh skills to update the readme in the context if it was changed
        await refreshSkills();
      } else {
        alert('Failed to save file');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Error saving file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName || !skill) return;
    
    try {
      const response = await fetch(`/api/skills/${skill.id}/files/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFileName,
          type: newFileType,
          path: selectedFolder
        })
      });
      
      if (response.ok) {
        const createdName = newFileName;
        const createdType = newFileType;
        setNewFileName('');
        setIsCreating(false);
        const files = await fetchFiles();
        
        if (createdType === 'file') {
          // Find the newly created file and select it
          const findFile = (items: any[], name: string): any => {
            for (const item of items) {
              if (item.type === 'file' && item.name === name) return item;
              if (item.type === 'folder' && item.children) {
                const found = findFile(item.children, name);
                if (found) return found;
              }
            }
            return null;
          };
          const newFile = findFile(files, createdName);
          if (newFile) handleFileSelect(newFile);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Error creating item');
    }
  };

  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-600">{t('common.loading')}</h2>
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
      
      <main className="pt-24 px-4 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Large Icon */}
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-900">
              <div className="transform scale-150">
                <SkillIcon icon={skill.icon} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{skill.name}</h1>
                {skill.security.virusTotal === 'Benign' && skill.security.openClaw === 'Safe' && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> {t('skillDetail.verified')}
                  </span>
                )}
              </div>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-3xl">
                {skill.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-gray-500">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <img src={skill.author.avatar} alt={skill.author.name} className="w-6 h-6 rounded-full ring-2 ring-white" />
                  <span className="font-medium text-gray-900">{skill.author.handle}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span className="font-medium text-gray-900">{skill.stats.stars}</span>
                  <span className="text-gray-400">{t('skillDetail.stars')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={18} />
                  <span className="font-medium text-gray-900">{formatNumber(skill.stats.downloads)}</span>
                  <span className="text-gray-400">{t('skillDetail.downloads')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={18} />
                  <span className="font-medium text-gray-900">{skill.stats.installs}</span>
                  <span className="text-gray-400">{t('skillDetail.activeInstalls')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Tabs & Content */}
            <div className="min-h-[600px]">
              <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
                {[
                  { id: 'files', label: t('skillDetail.tabs.readme'), icon: FileText },
                  { id: 'versions', label: t('skillDetail.tabs.changelog'), icon: History },
                  { id: 'compare', label: t('skillDetail.tabs.compare'), icon: GitCompare },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm font-medium flex items-center gap-2 transition-all relative ${
                      activeTab === tab.id 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === 'files' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    {/* Explorer Header */}
                    <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-white">
                      <div 
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                        onClick={() => setSelectedFolder(null)}
                        title="Go to Root"
                      >
                        <GitCompare size={14} className="text-blue-500" />
                        Skill Explorer {selectedFolder && <span className="text-blue-500 lowercase font-normal ml-1">/ {selectedFolder}</span>}
                      </div>
                      <button 
                        onClick={() => {
                          setNewFileName('');
                          setNewFileType('file');
                          setIsCreating(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        title="New File/Folder"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                      {/* File Tree Sidebar */}
                      <div className="w-64 bg-gray-50/50 border-r border-gray-100 flex-shrink-0 overflow-y-auto p-2">
                        {isLoadingFiles ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          </div>
                        ) : (
                          <FileTree 
                            files={skillFiles.length > 0 ? skillFiles : [{ name: 'SKILL.md', type: 'file', path: 'SKILL.md' }]} 
                            activeFile={activeFile} 
                            selectedFolder={selectedFolder}
                            onSelect={handleFileSelect} 
                            onFolderSelect={(path: string) => setSelectedFolder(path)}
                          />
                        )}
                      </div>

                      {/* Code Viewer */}
                      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                        {/* File Tab Header */}
                        <div className="h-10 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between px-4">
                          <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                            <Code size={14} />
                            <span>{activeFile?.name || 'No file selected'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => setIsEditing(false)}
                                  className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                                <button 
                                  onClick={handleSaveFile}
                                  disabled={isSaving}
                                  className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                  <Save size={14} />
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => setIsEditing(true)}
                                  className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                  title="Edit file"
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    if (activeFile?.content) {
                                      navigator.clipboard.writeText(activeFile.content);
                                    }
                                  }}
                                  className="text-gray-500 hover:text-gray-300 transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 overflow-auto custom-scrollbar relative">
                          <div className="flex min-h-full">
                            {/* Line Numbers */}
                            <div className="w-12 bg-[#1e1e1e] border-r border-gray-800 flex-shrink-0 flex flex-col items-end py-4 pr-3 select-none">
                              {(isEditing ? editedContent : activeFile?.content)?.split('\n').map((_: any, i: number) => (
                                <span key={i} className="text-xs font-mono text-gray-600 leading-6">{i + 1}</span>
                              ))}
                            </div>
                            
                            {/* Code */}
                            <div className="flex-1 py-4 px-4">
                              {isEditing ? (
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="w-full h-full bg-transparent border-none focus:ring-0 p-0 font-mono text-xs leading-6 text-gray-300 resize-none outline-none"
                                  spellCheck={false}
                                />
                              ) : (
                                <pre className="font-mono text-xs leading-6 text-gray-300 whitespace-pre">
                                  {activeFile?.content || '// No content'}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div className="space-y-12">
                    {skill.history && skill.history.length > 0 ? (
                      skill.history.map((version: any, index: number) => (
                        <div key={index} className="relative pl-8 border-l-2 border-gray-100 last:border-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">v{version.version}</h3>
                                <span className="text-sm text-gray-500">{version.date}</span>
                              </div>
                            </div>
                            <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                              <Download size={14} /> {t('skillDetail.versions.download')} v{version.version}
                            </button>
                          </div>

                          <ul className="space-y-3 mb-6">
                            {version.changes.map((change: string, i: number) => (
                              <li key={i} className="text-gray-600 leading-relaxed flex items-start gap-3">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"></span>
                                {change}
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('skillDetail.security.title')}</span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">
                              <Shield size={12} />
                              {version.security.virusTotal}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('skillDetail.versions.noHistory')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'compare' && (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <GitCompare size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium">{t('skillDetail.compare.select')}</p>
                    <p className="text-sm opacity-70 mt-2">{t('skillDetail.compare.noDiffs')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-10 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('skillDetail.comments.title')} (3)</h2>
              
              <div className="space-y-8">
                {[
                  { user: 'Alex Chen', handle: '@alexc', time: '2 days ago', content: 'This skill completely transformed our workflow. The consensus mechanism is surprisingly robust.', avatar: 'https://picsum.photos/seed/alex/100/100' },
                  { user: 'Sarah Jones', handle: '@sjeeez', time: '1 week ago', content: 'Great work! Would love to see support for custom data sources in the next version.', avatar: 'https://picsum.photos/seed/sarah/100/100' },
                  { user: 'Mike Ross', handle: '@mross', time: '2 weeks ago', content: 'Documentation is top notch. Easy to integrate.', avatar: 'https://picsum.photos/seed/mike/100/100' }
                ].map((comment, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{comment.user}</span>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-4 mt-8">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1">
                    <textarea 
                      className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none h-32"
                      placeholder={t('skillDetail.comments.placeholder')}
                    ></textarea>
                    <div className="flex justify-end mt-2">
                       <button className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
                         {t('skillDetail.comments.post')}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Actions Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('skillDetail.actions.installation')}</span>
                  <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100 font-mono text-sm text-gray-600">
                    <span>npx skills add {skill.name.toLowerCase().replace(/\s+/g, '-')}</span>
                    <button className="text-gray-400 hover:text-black transition-colors">
                      <FileText size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/skill/${skill.id}/debug`)}
                    className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Play size={20} className="fill-current" />
                    {t('skillDetail.actions.debugRun')}
                  </button>
                  <button className="w-full py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-3">
                    <Download size={20} />
                    {t('skillDetail.actions.downloadZip')}
                  </button>
                </div>
              </div>

              {/* Security Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={16} className="text-gray-400" /> {t('skillDetail.security.title')}
                  </h3>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                    <Check size={10} strokeWidth={4} /> {t('skillDetail.security.passed')}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-700">{t('skillDetail.security.virusTotal')}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      skill.security.virusTotal === 'Benign' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {skill.security.virusTotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="https://picsum.photos/seed/claw/20/20" className="w-4 h-4 rounded-full grayscale opacity-70" alt="Claw" />
                      <span className="font-medium text-gray-700">{t('skillDetail.security.openClaw')}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      skill.security.openClaw === 'Safe' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {skill.security.openClaw}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {skill.security.message}
                  </p>
                  <a href="#" className="text-xs text-blue-600 font-bold hover:underline">
                    {t('skillDetail.security.viewReport')}
                  </a>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t('skillDetail.information.title')}</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('skillDetail.information.version')}</span>
                    <span className="font-mono font-medium text-gray-900">v{skill.version}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('skillDetail.information.lastUpdated')}</span>
                    <span className="font-medium text-gray-900">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('skillDetail.information.license')}</span>
                    <span className="font-medium text-gray-900">MIT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('skillDetail.information.publisher')}</span>
                    <div className="flex items-center gap-2">
                      <img src={skill.author.avatar} className="w-5 h-5 rounded-full" />
                      <span className="font-medium text-blue-600 cursor-pointer hover:underline">{skill.author.handle}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Create File/Folder Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create New Item</h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Location Info */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Folder size={14} />
                Location: <span className="text-gray-900">{selectedFolder || 'Root'}</span>
              </div>

              {/* Type Selection */}
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button 
                  onClick={() => setNewFileType('file')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${newFileType === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <File size={16} />
                  File
                </button>
                <button 
                  onClick={() => setNewFileType('folder')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${newFileType === 'folder' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Folder size={16} />
                  Folder
                </button>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {newFileType === 'file' ? <File size={18} /> : <Folder size={18} />}
                  </div>
                  <input 
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder={newFileType === 'file' ? "filename.ext" : "folder-name"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFile();
                      if (e.key === 'Escape') setIsCreating(false);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Create {newFileType === 'file' ? 'File' : 'Folder'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const FileTree = ({ files, activeFile, selectedFolder, onSelect, onFolderSelect, level = 0 }: any) => {
  return (
    <div className="space-y-0.5">
      {files.map((file: any, idx: number) => (
        <FileTreeItem 
          key={file.path || file.name || idx} 
          file={file} 
          activeFile={activeFile} 
          selectedFolder={selectedFolder}
          onSelect={onSelect} 
          onFolderSelect={onFolderSelect}
          level={level} 
        />
      ))}
    </div>
  );
};

const FileTreeItem = ({ file, activeFile, selectedFolder, onSelect, onFolderSelect, level }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const isActive = activeFile?.path === file.path && file.type === 'file';
  const isFolderSelected = selectedFolder === file.path && file.type === 'folder';

  return (
    <div>
      <div 
        onClick={() => {
          if (file.type === 'folder') {
            setIsOpen(!isOpen);
            onFolderSelect(file.path);
          } else {
            onSelect(file);
            // Set selected folder to the parent of this file
            if (file.path && file.path.includes('/')) {
              const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
              onFolderSelect(parentPath);
            } else {
              onFolderSelect(null);
            }
          }
        }}
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer text-xs font-medium transition-colors select-none ${
          isActive || isFolderSelected
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="text-gray-400 w-4 h-4 flex items-center justify-center shrink-0">
            {file.type === 'folder' && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
        {file.type === 'folder' ? (
          <Folder size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
        ) : (
          <File size={14} className={`shrink-0 ${isActive ? "text-blue-500" : "text-gray-400"}`} />
        )}
        <span className="truncate">{file.name}</span>
      </div>
      {file.type === 'folder' && isOpen && file.children && (
        <FileTree 
          files={file.children} 
          activeFile={activeFile} 
          selectedFolder={selectedFolder}
          onSelect={onSelect} 
          onFolderSelect={onFolderSelect}
          level={level + 1} 
        />
      )}
    </div>
  );
};
