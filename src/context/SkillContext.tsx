import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Skill } from '../types';

interface SkillContextType {
  skills: Skill[];
  addSkill: (skill: Skill) => Promise<void>;
  uploadSkill: (file: File) => Promise<any>;
  getSkill: (id: string) => Skill | undefined;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<void>;
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

  const uploadSkill = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/skills/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchSkills();
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload skill:', error);
      throw error;
    }
  };

  const getSkill = (id: string) => {
    return skills.find(s => s.id === id);
  };

  const updateSkill = async (id: string, updates: Partial<Skill>) => {
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        await fetchSkills();
      }
    } catch (error) {
      console.error('Failed to update skill:', error);
    }
  };

  return (
    <SkillContext.Provider value={{ skills, addSkill, uploadSkill, getSkill, updateSkill, refreshSkills: fetchSkills }}>
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
