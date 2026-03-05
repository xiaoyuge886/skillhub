/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SkillProvider } from './context/SkillContext';
import Home from './pages/Home';
import SkillDetail from './pages/SkillDetail';
import CreateSkill from './pages/CreateSkill';
import SkillDebug from './pages/SkillDebug';

export default function App() {
  return (
    <SkillProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateSkill />} />
          <Route path="/skill/:id" element={<SkillDetail />} />
          <Route path="/skill/:id/debug" element={<SkillDebug />} />
        </Routes>
      </Router>
    </SkillProvider>
  );
}
