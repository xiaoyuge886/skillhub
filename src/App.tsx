/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SkillProvider } from './context/SkillContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import SkillDetail from './pages/SkillDetail';
import CreateSkill from './pages/CreateSkill';
import SkillDebug from './pages/SkillDebug';

export default function App() {
  return (
    <LanguageProvider>
      <SkillProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/create" element={<CreateSkill />} />
            <Route path="/skill/:id" element={<SkillDetail />} />
            <Route path="/skill/:id/debug" element={<SkillDebug />} />
          </Routes>
        </Router>
      </SkillProvider>
    </LanguageProvider>
  );
}
