import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skill, SkillType, Provider, AgentEngine } from '../types';
import { useSkills } from '../context/SkillContext';

export default function CreateSkill() {
  const navigate = useNavigate();
  const { addSkill } = useSkills();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Analysis' as SkillType,
    provider: 'Gemini' as Provider,
    engine: 'AgentScope' as AgentEngine,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
      navigate('/');
    } catch (error) {
      console.error('Failed to create skill:', error);
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
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-semibold text-lg text-gray-900">Create New Skill</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name}
              className="apple-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Create Skill
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
        >
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
                    className="apple-input text-lg font-medium" 
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
                className="apple-input resize-none h-32" 
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
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SkillType })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all hover:border-gray-300"
                  >
                    <option value="Analysis">Analysis</option>
                    <option value="Coding">Coding</option>
                    <option value="Creative">Creative</option>
                    <option value="Utility">Utility</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Determines how the skill is categorized and discovered.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                <div className="relative">
                  <select 
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as Provider })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all hover:border-gray-300"
                  >
                    <option value="Gemini">Google Gemini</option>
                    <option value="Claude">Anthropic Claude</option>
                    <option value="OpenAI">OpenAI GPT-4</option>
                    <option value="Mistral">Mistral AI</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Engine</label>
                <div className="relative">
                  <select 
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value as AgentEngine })}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none transition-all hover:border-gray-300"
                  >
                    <option value="AgentScope">AgentScope</option>
                    <option value="Claude Agent SDK">Claude Agent SDK</option>
                    <option value="LangChain">LangChain</option>
                    <option value="AutoGen">AutoGen</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  The underlying framework used to execute the skill logic.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
