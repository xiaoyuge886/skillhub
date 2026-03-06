/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SkillProvider } from './context/SkillContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import SkillDetail from './pages/SkillDetail';
import CreateSkill from './pages/CreateSkill';
import SkillDebug from './pages/SkillDebug';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SkillProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreateSkill /></ProtectedRoute>} />
              <Route path="/skill/:id" element={<ProtectedRoute><SkillDetail /></ProtectedRoute>} />
              <Route path="/skill/:id/debug" element={<ProtectedRoute><SkillDebug /></ProtectedRoute>} />
            </Routes>
          </Router>
        </SkillProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
