import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card rounded-3xl p-6 cursor-pointer transition-shadow hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'active' | 'draft';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-200 text-gray-600',
    active: 'bg-green-100 text-green-700',
    draft: 'bg-amber-100 text-amber-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};
