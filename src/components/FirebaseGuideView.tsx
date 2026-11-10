import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Code2,
  FileText,
  Server,
  Globe,
  ShieldAlert,
  Flame,
  CheckCircle,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  generateSurveyHtml,
  generateDashboardHtml,
  downloadStandaloneFile,
} from '../utils/standaloneFiles';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
} from '../services/storageService';
import { FirebaseConfig } from '../types';

export const FirebaseGuideView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'surveyCode' | 'dashboardCode' | 'config'>('guide');
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Firebase Config State
  const savedConfig = getSavedFirebaseConfig();
  const [configInput, setConfigInput] = useState<string>(
    savedConfig ? JSON.stringify(savedConfig, null, 2) : ''
  );
  const [configStatus, setConfigStatus] = useState<string>('');

  const surveyHtmlContent = generateSurveyHtml(savedConfig ? JSON.stringify(savedConfig, null, 2) : undefined);
  const dashboardHtmlContent = generateDashboardHtml(savedConfig ? JSON.stringify(savedConfig, null, 2) : undefined);

  const handleCopyCode = async (content: string, type: 'survey' | 'dashboard' | 'rules') => {
    try {
      await navigator.clipboard.writeText(content);
      if (type === 'survey') {
        setCopiedSurvey(true);
        setTimeout(() => setCopiedSurvey(false), 2000);
      } else if (type === 'dashboard') {
        setCopiedDashboard(true);
        setTimeout(() => setCopiedDashboard(false), 2000);
      } else {
        setCopiedRules(true);
        setTimeout(() => setCopiedRules(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleSaveConfig = () => {
    try {
      if (!configInput.trim()) {
        saveFirebaseConfig(null);
        setConfigStatus('ล้างการตั้งค่า Firebase แล้ว (กลับสู่โหมด Local Sync)');
        setTimeout(() => setConfigStatus(''), 3000);
        return;
      }

      // Check if user pasted JS object or JSON
      let cleanInput = configInput.trim();
      if (cleanInput.startsWith('const firebaseConfig =')) {
        cleanInput = cleanInput.replace('const firebaseConfig =', '').replace(/;$/, '').trim();
      }

      // Try parsing JSON or relaxed JSON
      let parsed: any;
      try {
        parsed = JSON.parse(cleanInput);
      } catch {
        // Fallback eval in safe context
        parsed = new Function(`return (${cleanInput})`)();
      }

      if (parsed && (parsed.databaseURL || parsed.projectId)) {
        saveFirebaseConfig(parsed as FirebaseConfig);
        setConfigStatus('✅ บันทึกและเชื่อมต่อ Firebase สำเร็จ! กำลังโหลดข้อมูลสด...');
        setTimeout(() => {
          setConfigStatus('');
          window.location.reload();
        }, 1500);
      } else {
        setConfigStatus('❌ รูปแบบ Config ไม่ถูกต้อง กรุณาตรวจสอบ databaseURL หรือ projectId');
      }
    } catch (e: any) {
      setConfigStatus(`❌ ไม่สามารถประมวลผลได้: ${e.message}`);
    }
  };

  const handleResetConfig = () => {
    saveFirebaseConfig(null);
    setConfigInput('');
    setConfigStatus('รีเซ็ตเป็นโหมด Local Sync สำเร็จ');
    setTimeout(() => {
      setConfigStatus('');
      window.location.reload();
    }, 1000);
  };

  const securityRulesCode = `{
  "rules": {
    "submissions": {
      ".read": true,
      ".write": true
    }
  }
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>คู่มือการใช้งาน & ดาวน์โหลดโค้ด 2 ไฟล์</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            คู่มือตั้งค่า Firebase Realtime Database & วิธี Deploy ฟรี
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            รองรับการใช้งานแพ็กเกจฟรี 100% ไม่ต้องล็อกอิน ไม่เก็บชื่อผู้ตอบ แยกเป็น 2 ไฟล์พร้อมนำไปใช้งาน
          </p>
        </div>

        {/* Tab navigation buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadStandaloneFile('survey.html', surveyHtmlContent)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด survey.html</span>
          </button>
          <button
            onClick={() => downloadStandaloneFile('dashboard.html', dashboardHtmlContent)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด dashboard.html</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'guide'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ขั้นตอนตั้งค่า Firebase & Deploy</span>
        </button>

        <button
          onClick={() => setActiveTab('surveyCode')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'surveyCode'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>โค้ด survey.html (หน้าตอบมือถือ)</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboardCode')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboardCode'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>โค้ด dashboard.html (หน้าขึ้นโปรเจกเตอร์)</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'config'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>ตั้งค่า / เชื่อมต่อ Firebase Live</span>
        </button>
      </div>

      {/* Tab 1: Step-by-Step Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          
          {/* Step 1: Create Project */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                สร้างโปรเจกต์บน Firebase Console (ฟรี 100%)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-11">
              1. เข้าเว็บไซต์{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                console.firebase.google.com <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <br />
              2. ล็อกอินด้วยบัญชี Google แล้วคลิก <b>"Add project" (สร้างโปรเจกต์)</b>
              <br />
              3. ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">training-feedback-app</code>
              <br />
              4. ในส่วน Google Analytics สามารถเลือกเปิดหรือปิดก็ได้ จากนั้นกด <b>Create project</b>
            </p>
          </div>

          {/* Step 2: Create Realtime Database */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                เปิดใช้งาน Realtime Database
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-11">
              1. ในเมนูด้านซ้าย เลือก <b>Build</b> &gt; <b>Realtime Database</b>
              <br />
              2. คลิกปุ่ม <b>"Create Database"</b>
              <br />
              3. เลือก Region เช่น <b>Singapore (asia-southeast1)</b> หรือ United States แล้วคลิก Next
              <br />
              4. เลือกเริ่มต้นในโหมด <b>"Start in test mode"</b> แล้วกด Enable
            </p>
          </div>

          {/* Step 3: Configure Security Rules */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  ตั้งค่า Security Rules (ให้อ่าน-เขียนได้โดยไม่ต้องล็อกอิน)
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  เพื่อให้ผู้เข้าอบรมสแกนแล้วส่งคะแนนได้ทันที และจอ Dashboard อ่านข้อมูลได้ตลอดเวลา
                </span>
              </div>
            </div>

            <div className="pl-11 space-y-2">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                ไปที่แท็บ <b>Rules (กฎ)</b> ใน Realtime Database แล้ววางโค้ดด้านล่างนี้ จากนั้นคลิก <b>Publish</b>:
              </p>

              <div className="relative bg-slate-900 rounded-2xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                <button
                  onClick={() => handleCopyCode(securityRulesCode, 'rules')}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRules ? 'คัดลอกแล้ว' : 'คัดลอก Rules'}</span>
                </button>
                <pre>{securityRulesCode}</pre>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 mt-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <b>หมายเหตุ:</b> กฎนี้อนุญาตให้อ่านและเขียนเฉพาะ path <code>submissions</code> ตามโจทย์ที่ต้องการความสะดวกสูงสุดในการอบรม โดยไม่จำเป็นต้องบังคับให้ผู้เรียนลงชื่อเข้าใช้
                </span>
              </div>
            </div>
          </div>

          {/* Step 4: Get Web Config */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                4
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                คัดลอก Firebase Config มาใส่ในโค้ด
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-11">
              1. ในหน้าหลัก Firebase Console คลิกไอคอน <b>ฟันเฟือง (Project settings)</b> มุมบนซ้าย
              <br />
              2. เลื่อนลงมาที่หัวข้อ <b>"Your apps"</b> แล้วคลิกไอคอนเว็บ <b>(&lt;/&gt;)</b>
              <br />
              3. ตั้งชื่อ App เช่น <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">Training Survey Web</code> แล้วกด Register app
              <br />
              4. คัดลอกส่วน <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">firebaseConfig</code> ทั้งหมด
              <br />
              5. นำไปวางแทนที่ <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">const firebaseConfig = &#123; ... &#125;</code> ในทั้ง 2 ไฟล์ (survey.html และ dashboard.html)
            </p>
          </div>

          {/* Step 5: Deploy Guide */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center justify-center">
                5
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  วิธี Deploy ขึ้นเซิร์ฟเวอร์ฟรีทีละขั้น
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  เลือกวิธีที่สะดวกที่สุด (ทั้ง 3 วิธีฟรี 100% และได้ HTTPS เพื่อให้มือถือสแกนได้ทันที)
                </span>
              </div>
            </div>

            <div className="pl-11 grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              
              {/* Option 1: GitHub Pages */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>วิธีที่ 1: GitHub Pages (แนะนำ ง่ายสุด)</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>สร้าง Repository ใหม่บน GitHub เช่น <code className="text-indigo-600">training-survey</code></li>
                  <li>อัปโหลดไฟล์ <code className="text-indigo-600">survey.html</code> และ <code className="text-indigo-600">dashboard.html</code> (หรือเปลี่ยนชื่อ survey.html เป็น <code className="text-indigo-600">index.html</code>)</li>
                  <li>ไปที่ <b>Settings &gt; Pages</b></li>
                  <li>เลือก Branch: <b>main</b> แล้วกด <b>Save</b></li>
                  <li>ระบบจะสร้างลิงก์ <code className="text-emerald-600">https://yourname.github.io/...</code> ให้ใช้ได้ฟรีตลอดไป</li>
                </ol>
              </div>

              {/* Option 2: Netlify / Vercel */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <span>วิธีที่ 2: Vercel หรือ Netlify Drop</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>รวมไฟล์ <code className="text-indigo-600">survey.html</code> และ <code className="text-indigo-600">dashboard.html</code> ไว้ในโฟลเดอร์เดียวกัน</li>
                  <li>เข้าเว็บ <b>app.netlify.com/drop</b></li>
                  <li>ลากโฟลเดอร์ไปวาง (Drag & Drop)</li>
                  <li>เสร็จสิ้นภายใน 10 วินาที! ได้ URL พร้อมใบรับรอง SSL อัตโนมัติ</li>
                </ol>
              </div>

              {/* Option 3: Firebase Hosting */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>วิธีที่ 3: Firebase Hosting</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>ติดตั้ง: <code className="text-indigo-600">npm i -g firebase-tools</code></li>
                  <li>เข้าสู่ระบบ: <code className="text-indigo-600">firebase login</code></li>
                  <li>เริ่มต้น: <code className="text-indigo-600">firebase init hosting</code></li>
                  <li>นำไฟล์ HTML ไปไว้ในโฟลเดอร์ public</li>
                  <li>Deploy: <code className="text-emerald-600">firebase deploy</code></li>
                </ol>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Tab 2: survey.html Code */}
      {activeTab === 'surveyCode' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📱</span> <span>survey.html</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                หน้าประเมินความพึงพอใจ Mobile-first สำหรับผู้เข้าร่วมอบรม ปุ่มใหญ่ กดง่าย พร้อมระบบป้องกันการตอบซ้ำ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(surveyHtmlContent, 'survey')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedSurvey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSurvey ? 'คัดลอกโค้ดแล้ว' : 'คัดลอกโค้ดทั้งหมด'}</span>
              </button>
              <button
                onClick={() => downloadStandaloneFile('survey.html', surveyHtmlContent)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด survey.html</span>
              </button>
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-2xl p-4 text-slate-200 font-mono text-xs overflow-x-auto max-h-[550px] border border-slate-800">
            <pre>{surveyHtmlContent}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: dashboard.html Code */}
      {activeTab === 'dashboardCode' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📊</span> <span>dashboard.html</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                หน้าแดชบอร์ดสรุปผลแบบเรียลไทม์ เหมาะสำหรับขึ้นจอโปรเจกเตอร์ มี QR Code สแกน และปุ่มดาวน์โหลด CSV
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(dashboardHtmlContent, 'dashboard')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedDashboard ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDashboard ? 'คัดลอกโค้ดแล้ว' : 'คัดลอกโค้ดทั้งหมด'}</span>
              </button>
              <button
                onClick={() => downloadStandaloneFile('dashboard.html', dashboardHtmlContent)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด dashboard.html</span>
              </button>
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-2xl p-4 text-slate-200 font-mono text-xs overflow-x-auto max-h-[550px] border border-slate-800">
            <pre>{dashboardHtmlContent}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Direct Firebase Config & Connection */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>เชื่อมต่อ Firebase Realtime Database ของคุณเข้ากับแอปนี้ทันที</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              หากคุณมี Firebase Config จาก Firebase Console สามารถนำมาวางที่นี่เพื่อเชื่อมต่อฐานข้อมูลจริงได้ทันที (หรือเว้นว่างไว้เพื่อใช้งานโหมด Local/Demo ได้ตามปกติ)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              วาง JSON หรือตัวแปร firebaseConfig:
            </label>
            <textarea
              rows={8}
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "your-app.firebaseapp.com",
  "databaseURL": "https://your-app-default-rtdb.firebaseio.com",
  "projectId": "your-app",
  "storageBucket": "your-app.appspot.com",
  "messagingSenderId": "...",
  "appId": "1:..."
}`}
              className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {configStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {configStatus}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกและเชื่อมต่อ Firebase</span>
            </button>

            <button
              onClick={handleResetConfig}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>กลับไปใช้โหมด Local/Sync ดั้งเดิม</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
