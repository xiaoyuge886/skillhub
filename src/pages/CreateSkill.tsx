import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Zap, Upload, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skill, SkillType, Provider, AgentEngine } from '../types';
import { useSkills } from '../context/SkillContext';

export default function CreateSkill() {
  const navigate = useNavigate();
  const { addSkill, uploadSkill } = useSkills();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'manual' | 'zip'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Analysis' as SkillType,
    provider: 'Gemini' as Provider,
    engine: 'AgentScope' as AgentEngine,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError('Please select a valid ZIP file.');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError(null);

    try {
      if (uploadMode === 'zip') {
        if (!selectedFile) {
          setUploadError('Please select a ZIP file to upload.');
          setIsSubmitting(false);
          return;
        }
        await uploadSkill(selectedFile);
        navigate('/marketplace');
      } else {
        const newSkill: Skill = {
          id: Date.now().toString(),
          name: formData.name || 'Untitled Skill',
          description: formData.description || 'No description provided.',
          type: formData.type,
          provider: formData.provider,
          engine: formData.engine,
          version: '0.1.0',
          status: 'draft',
          icon: 'zap',
          author: {
            name: 'You',
            handle: '@you',
            avatar: 'https://picsum.photos/seed/you/100/100'
          },
          stats: {
            stars: 0,
            downloads: 0,
            installs: 0
          },
          security: {
            virusTotal: 'Benign',
            openClaw: 'Unknown',
            confidence: 'LOW',
            message: 'New skill, security scan pending.'
          },
          readme: `# ${formData.name || 'Untitled Skill'}\n\n${formData.description || 'No description provided.'}\n\n## Usage\n\nRun this skill using:\n\`\`\`bash\nnpx skills run ${(formData.name || 'untitled-skill').toLowerCase().replace(/\s+/g, '-')}\n\`\`\``,
          history: []
        };

        await addSkill(newSkill);
        navigate('/marketplace');
      }
    } catch (error: any) {
      console.error('Failed to create skill:', error);
      setUploadError(error.message || 'Failed to create skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/marketplace')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-semibold text-lg text-gray-900">Create New Skill</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || (uploadMode === 'manual' && !formData.name) || (uploadMode === 'zip' && !selectedFile)}
              className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                uploadMode === 'zip' ? <Upload size={16} /> : <Save size={16} />
              )}
              {uploadMode === 'zip' ? 'Upload & Install' : 'Create Skill'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Mode Selector */}
        <div className="flex p-1 bg-gray-200/50 rounded-2xl mb-8 w-fit mx-auto">
          <button
            onClick={() => setUploadMode('manual')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              uploadMode === 'manual' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manual Configuration
          </button>
          <button
            onClick={() => setUploadMode('zip')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              uploadMode === 'zip' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload ZIP Package
          </button>
        </div>

        <motion.div
          key={uploadMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {uploadMode === 'manual' ? (
            <div className="p-8 space-y-8">
              {/* Icon & Name */}
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                  <Zap size={32} className="text-gray-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 text-lg font-medium" 
                      placeholder="e.g., Market Analyst Pro" 
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300 resize-none h-32" 
                  placeholder="Describe what this skill does and how it helps users..." 
                />
                <p className="mt-2 text-xs text-gray-400 text-right">
                  {formData.description.length}/500
                </p>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SkillType })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                  >
                    <option value="Analysis">Analysis</option>
                    <option value="Coding">Coding</option>
                    <option value="Creative">Creative</option>
                    <option value="Utility">Utility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                  <select 
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as Provider })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                  >
                    <option value="Gemini">Google Gemini</option>
                    <option value="Claude">Anthropic Claude</option>
                    <option value="OpenAI">OpenAI GPT-4</option>
                    <option value="Mistral">Mistral AI</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer ${
                  selectedFile 
                    ? 'border-green-200 bg-green-50/30' 
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".zip"
                  className="hidden" 
                />
                
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedFile ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {selectedFile ? <FileArchive size={32} /> : <Upload size={32} />}
                  </div>
                  
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">ZIP package containing your skill files</p>
                    </div>
                  )}
                </div>
              </div>

              {uploadError && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} />
                  {uploadError}
                </div>
              )}

              <div className="mt-8 text-left bg-gray-50 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-500" />
                  Package Requirements
                </h4>
                <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                  <li>Must be a valid ZIP archive</li>
                  <li>Metadata is <strong>optional</strong> (will use ZIP name if missing)</li>
                  <li>Supports <code className="bg-gray-200 px-1 rounded">SKILL.md</code>, <code className="bg-gray-200 px-1 rounded">skill.json</code>, or <code className="bg-gray-200 px-1 rounded">package.json</code></li>
                  <li>Optional: <code className="bg-gray-200 px-1 rounded">icon.png</code> for the skill icon</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
