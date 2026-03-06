import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Code, Globe } from 'lucide-react';
import { Header, SettingsPanel } from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-black">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-500 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="pt-32 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-bold mb-6 text-black tracking-tight"
          >
            {t('landing.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl mx-auto mb-10"
          >
            {t('landing.hero.subtitle')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-black text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              {t('landing.hero.cta')}
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Box}
            title={t('landing.features.collection.title')}
            description={t('landing.features.collection.description')}
            delay={0.3}
          />
          <FeatureCard
            icon={Code}
            title={t('landing.features.debugging.title')}
            description={t('landing.features.debugging.description')}
            delay={0.4}
          />
          <FeatureCard
            icon={Globe}
            title={t('landing.features.marketplace.title')}
            description={t('landing.features.marketplace.description')}
            delay={0.5}
          />
        </section>
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
