import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Skill } from '../types';

interface SkillContextType {
  skills: Skill[];
  addSkill: (skill: Skill) => Promise<void>;
  getSkill: (id: string) => Skill | undefined;
  refreshSkills: () => Promise<void>;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export const SkillProvider = ({ children }: { children: ReactNode }) => {
  const [skills, setSkills] = useState<Skill[]>([]);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const addSkill = async (skill: Skill) => {
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
      });
      
      if (response.ok) {
        await fetchSkills();
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const getSkill = (id: string) => {
    return skills.find(s => s.id === id);
  };

  return (
    <SkillContext.Provider value={{ skills, addSkill, getSkill, refreshSkills: fetchSkills }}>
      {children}
    </SkillContext.Provider>
  );
};

export const useSkills = () => {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
};
