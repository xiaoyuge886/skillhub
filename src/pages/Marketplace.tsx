import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Cpu, Layers, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../components/UI';
import { Header, SettingsPanel, SkillIcon } from '../components/Layout';
import { useSkills } from '../context/SkillContext';
import { useLanguage } from '../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section className="pt-32 pb-12 px-6 lg:px-12 text-center max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-7xl font-bold mb-6 text-black tracking-tight"
      >
        {t('home.hero.title')}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto"
      >
        {t('home.hero.subtitle')}
      </motion.p>
    </section>
  );
};

const SearchBar = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 mb-8 md:mb-12 relative">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 hover:bg-white"
          placeholder={t('home.search.placeholder')}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>
        </div>
      </div>
    </div>
  );
};

const FilterBar = ({ activeFilter, onFilterChange }: { activeFilter: string, onFilterChange: (f: string) => void }) => {
  const { t } = useLanguage();
  const filters = ['All', 'Analysis', 'Coding', 'Creative', 'Utility'];
  
  return (
    <div className="flex justify-start md:justify-center mb-8 overflow-x-auto px-4 md:px-6 pb-4 no-scrollbar mask-linear-fade">
      <div className="flex items-center gap-2 md:gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeFilter === filter 
                ? 'bg-black text-white shadow-lg scale-105' 
                : 'text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {t(`home.filters.${filter.toLowerCase()}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Marketplace() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { skills } = useSkills();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const filteredSkills = skills.filter(skill => {
    const matchesFilter = filter === 'All' || skill.type === filter;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20 bg-gray-50/30">
      <Header onOpenSettings={() => setIsSettingsOpen(true)}>
        <button 
          onClick={() => navigate('/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2 text-sm px-4 py-2 font-medium transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{t('home.newSkill')}</span>
          <span className="sm:hidden">{t('home.newSkill').split(' ')[0]}</span>
        </button>
      </Header>
      
      <main>
        <Hero />
        
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredSkills.map((skill) => {
                const translatedName = t(`home.skills.${skill.id}.name`);
                const name = translatedName !== `home.skills.${skill.id}.name` ? translatedName : skill.name;
                
                const translatedDesc = t(`home.skills.${skill.id}.description`);
                const description = translatedDesc !== `home.skills.${skill.id}.description` ? translatedDesc : skill.description;

                return (
                <Card key={skill.id} onClick={() => navigate(`/skill/${skill.id}`)}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-900 shadow-sm border border-gray-100">
                      <SkillIcon icon={skill.icon} />
                    </div>
                    <Badge variant={skill.status === 'active' ? 'active' : 'draft'}>
                      {t(`home.status.${skill.status}`)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 h-10 line-clamp-2">
                    {description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Cpu size={14} /> {skill.provider}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Layers size={14} /> {skill.engine}
                    </div>
                  </div>
                </Card>
              )})}
            </AnimatePresence>
            
            {filteredSkills.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                <p className="text-lg">{t('home.noSkillsFound')}</p>
                <button 
                  onClick={() => { setFilter('All'); setSearchQuery(''); }}
                  className="mt-4 text-blue-500 hover:underline"
                >
                  {t('home.clearFilters')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
