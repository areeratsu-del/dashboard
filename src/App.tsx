/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  BarChart3,
  FileCode,
  Moon,
  Sun,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from './constants';
import { SurveySubmission, SummaryStats } from './types';
import { subscribeToSubmissions } from './services/storageService';
import { calculateStats } from './utils/stats';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { QRCodeModal } from './components/QRCodeModal';
import { FirebaseGuideView } from './components/FirebaseGuideView';

export default function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'dashboard' | 'guide'>('dashboard');
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [stats, setStats] = useState<SummaryStats>(() =>
    calculateStats(DEFAULT_QUESTIONS, [])
  );
  const [source, setSource] = useState<'firebase' | 'local'>('local');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme_mode') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  // URL Query parameter detection (e.g. ?view=survey or ?view=dashboard)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'survey') {
        setCurrentView('survey');
      } else if (viewParam === 'dashboard') {
        setCurrentView('dashboard');
      } else if (viewParam === 'guide') {
        setCurrentView('guide');
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  // Subscribe to realtime database updates
  useEffect(() => {
    const unsubscribe = subscribeToSubmissions(
      (newSubmissions) => {
        setSubmissions(newSubmissions);
        setStats(calculateStats(DEFAULT_QUESTIONS, newSubmissions));
      },
      (newSource) => {
        setSource(newSource);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSwitchView = (view: 'survey' | 'dashboard' | 'guide') => {
    setCurrentView(view);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  // Construct mobile survey URL for QR Code
  const getSurveyUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'survey');
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 antialiased flex flex-col font-sans">
      
      {/* Global Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 font-bold text-lg">
              ✨
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-none">
                ระบบประเมินความพึงพอใจการอบรม
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Live Survey & Realtime Dashboard
              </span>
            </div>
          </div>

          {/* View Switcher Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => handleSwitchView('survey')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 select-none ${
                currentView === 'survey'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าตอบ (มือถือ)</span>
            </button>

            <button
              onClick={() => handleSwitchView('dashboard')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 select-none ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard (จอใหญ่)</span>
              {submissions.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-bold">
                  {submissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSwitchView('guide')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 select-none ${
                currentView === 'guide'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">โค้ด 2 ไฟล์ &</span>
              <span>คู่มือ Firebase</span>
            </button>
          </div>

          {/* Dark Mode Toggle & Quick QR */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title={isDarkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด (เหมาะกับโปรเจกเตอร์)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'survey' && (
          <SurveyView
            questions={DEFAULT_QUESTIONS}
            onViewDashboard={() => handleSwitchView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            questions={DEFAULT_QUESTIONS}
            submissions={submissions}
            stats={stats}
            source={source}
            surveyUrl={getSurveyUrl()}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onOpenFirebaseGuide={() => handleSwitchView('guide')}
          />
        )}

        {currentView === 'guide' && (
          <FirebaseGuideView onClose={() => handleSwitchView('dashboard')} />
        )}
      </main>

      {/* QR Code Presentation Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={getSurveyUrl()}
      />

      {/* Clean Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
        ระบบประเมินความพึงพอใจการอบรม • Realtime Likert Scale (1-5) Analysis & Live Dashboard
      </footer>
    </div>
  );
}
