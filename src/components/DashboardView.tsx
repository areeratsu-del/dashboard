import React, { useState } from 'react';
import {
  Users,
  Star,
  Award,
  QrCode,
  Download,
  Maximize2,
  Minimize2,
  Trash2,
  RotateCcw,
  Sparkles,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { Question, SurveySubmission, SummaryStats } from '../types';
import { RATING_SCALE } from '../constants';
import { exportSubmissionsToCSV } from '../utils/csvExport';
import { clearAllSubmissions, seedDemoData } from '../services/storageService';

interface DashboardViewProps {
  questions: Question[];
  submissions: SurveySubmission[];
  stats: SummaryStats;
  source: 'firebase' | 'local';
  surveyUrl: string;
  onOpenQrModal: () => void;
  onOpenFirebaseGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  questions,
  submissions,
  stats,
  source,
  surveyUrl,
  onOpenQrModal,
  onOpenFirebaseGuide,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleExportCSV = () => {
    exportSubmissionsToCSV(questions, submissions, stats);
  };

  const handleClearAll = async () => {
    await clearAllSubmissions();
    setShowResetConfirm(false);
  };

  const toggleBreakdown = (qid: string) => {
    setExpandedBreakdown((prev) => (prev === qid ? null : qid));
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'เมื่อสักครู่';
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    return new Date(timestamp).toLocaleDateString('th-TH');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title and Live Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                ถ่ายทอดสดแบบเรียลไทม์ (LIVE SYNC)
              </span>

              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                  source === 'firebase'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {source === 'firebase' ? '🔥 Firebase Realtime DB' : '⚡ Local & Tab Sync'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard ผลประเมินความพึงพอใจการอบรม
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              หน้าจอสำหรับขึ้นโปรเจกเตอร์หรือจอมอนิเตอร์ในห้องสัมมนา อัปเดตทันทีเมื่อมีคนส่งข้อมูล
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* QR Code Presentation Button */}
            <button
              onClick={onOpenQrModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code ให้ผู้ฟังตอบ</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className={`px-3.5 py-2.5 font-medium text-xs sm:text-sm rounded-2xl border transition flex items-center gap-1.5 ${
                submissions.length > 0
                  ? 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 cursor-pointer'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด CSV</span>
            </button>

            {/* Fullscreen Button for Projectors */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs transition"
              title="สลับโหมดเต็มจอสำหรับโปรเจกเตอร์"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Firebase Guide & Setup Button */}
            <button
              onClick={onOpenFirebaseGuide}
              className="p-2.5 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs transition"
              title="ดูโค้ด 2 ไฟล์และคู่มือตั้งค่า Firebase"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Total Respondents */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              จำนวนผู้ตอบทั้งหมด
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {stats.totalResponses}
              </span>
              <span className="text-slate-500 text-sm font-medium">ท่าน</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              อัปเดตอัตโนมัติ ไม่ต้องรีเฟรชหน้าจอ
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Card 2: Overall Average Score */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              คะแนนเฉลี่ยรวมทุกข้อ
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tight">
                {stats.overallAverage > 0 ? stats.overallAverage.toFixed(2) : '0.00'}
              </span>
              <span className="text-slate-400 text-sm font-medium">/ 5.00</span>
            </div>
            {/* Star visual */}
            <div className="flex items-center gap-1 pt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    stats.overallAverage >= s
                      ? 'fill-amber-400 text-amber-400'
                      : stats.overallAverage >= s - 0.5
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                ({((stats.overallAverage / 5) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner">
            <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
          </div>
        </div>

        {/* Card 3: Likert Level Interpretation */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ระดับความพึงพอใจโดยรวม
            </span>
            <div className="pt-0.5">
              <span
                className={`inline-block px-4 py-1.5 rounded-2xl text-lg font-bold border ${stats.interpretation.bgClass} ${stats.interpretation.textClass} ${stats.interpretation.borderClass}`}
              >
                {stats.totalResponses > 0 ? stats.interpretation.label : 'รอข้อมูลการตอบ'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              {stats.totalResponses > 0
                ? stats.interpretation.description
                : 'เมื่อมีผู้เข้าอบรมสแกนตอบ ผลการแปลผลตามเกณฑ์ 5 ระดับจะปรากฏที่นี่'}
            </p>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span>เกณฑ์ 4.51-5.00: มากที่สุด</span>
            <span>3.51-4.50: มาก</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Bar Charts & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Question Breakdown Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                คะแนนเฉลี่ยรายข้อ (สเกล 1.00 - 5.00)
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              คลิกเพื่อดูสัดส่วนคะแนน 1-5
            </span>
          </div>

          <div className="space-y-5">
            {stats.questionStats.map((qs, index) => {
              const pct = (qs.average / 5) * 100;
              const isExpanded = expandedBreakdown === qs.id;
              const interp = stats.totalResponses > 0 ? qs.average : 0;

              return (
                <div
                  key={qs.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-700/60 space-y-3 transition-colors hover:border-pink-300/50 dark:hover:border-pink-700/50"
                >
                  {/* Question Title & Score */}
                  <div
                    onClick={() => toggleBreakdown(qs.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                        {qs.text.replace(/^(\d+\.\s*)/, '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-black text-pink-600 dark:text-pink-400 tabular-nums">
                          {qs.average.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ 5.00</span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-lg font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {qs.average >= 4.51
                          ? 'มากที่สุด'
                          : qs.average >= 3.51
                          ? 'มาก'
                          : qs.average >= 2.51
                          ? 'ปานกลาง'
                          : qs.average >= 1.51
                          ? 'น้อย'
                          : qs.average > 0
                          ? 'น้อยที่สุด'
                          : 'รอข้อมูล'}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar (Pink Gradient) */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3.5 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-pink-500/30"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Distribution breakdown accordion (1-5 detail) */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-200">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        การกระจายตัวของคะแนน (จำนวนผู้ตอบ):
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {RATING_SCALE.map((scale) => {
                          const count = qs.distribution[scale.score] || 0;
                          const ratio = qs.count > 0 ? Math.round((count / qs.count) * 100) : 0;

                          return (
                            <div
                              key={scale.score}
                              className="bg-white dark:bg-slate-800 rounded-xl p-2 text-center border border-slate-200/60 dark:border-slate-700/60"
                            >
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <span>{scale.emoji}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  {scale.score}
                                </span>
                              </div>
                              <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                {count} <span className="text-[10px] font-normal text-slate-400">คน</span>
                              </div>
                              <div className="text-[10px] text-slate-400">{ratio}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats Footnote */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
            <span>เกณฑ์การแปลผล Likert: 4.51-5.00 มากที่สุด, 3.51-4.50 มาก, 2.51-3.50 ปานกลาง</span>
            <span className="font-medium">คำนวณแบบถ่วงน้ำหนักตามสูตรสถิติวิจัย</span>
          </div>
        </div>

        {/* Right 1 Col: Recent Comments & Quick QR */}
        <div className="space-y-6 flex flex-col">
          
          {/* Quick QR Code Card for Presenter Screen */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-5 text-white shadow-lg text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <QrCode className="w-3.5 h-3.5" />
              <span>สแกนตอบตอนนี้</span>
            </div>
            <h3 className="font-bold text-base">ขอเชิญผู้เข้าอบรมร่วมประเมิน</h3>
            <p className="text-xs text-indigo-200/80 mt-1 mb-4">
              คลิกเพื่อขยาย QR Code เต็มจอสำหรับโปรเจกเตอร์
            </p>

            <button
              onClick={onOpenQrModal}
              className="w-full py-3 bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>เปิด QR Code ขนาดใหญ่</span>
            </button>
          </div>

          {/* Live Feedback Comments Feed */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm flex-1 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ข้อเสนอแนะล่าสุด
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {stats.recentComments.length} ข้อความ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1 max-h-[380px]">
              {stats.recentComments.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs">ยังไม่มีข้อเสนอแนะเพิ่มเติม</p>
                  <p className="text-[11px] text-slate-400">
                    เมื่อผู้ตอบพิมพ์ข้อเสนอแนะ จะแสดงที่นี่ทันที
                  </p>
                </div>
              ) : (
                stats.recentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5 transition hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        ⭐ เฉลี่ย {comment.averageScore.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Admin Reset / Demo Utilities Toolbar at bottom */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span>เครื่องมือผู้บรรยาย:</span>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="hover:text-red-600 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> ล้างข้อมูลเริ่มรอบใหม่
          </button>
          <span>•</span>
          <button
            onClick={seedDemoData}
            className="hover:text-indigo-600 flex items-center gap-1 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> เติมข้อมูลตัวอย่าง (Demo)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span>URL ตอบ:</span>
          <a
            href={surveyUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:underline flex items-center gap-1 font-mono truncate max-w-[220px]"
          >
            {surveyUrl} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              ยืนยันการล้างข้อมูลทั้งหมด?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              การกระทำนี้จะล้างข้อมูลผลการประเมิน {submissions.length} รายการ เพื่อเริ่มรอบการอบรมใหม่
              (แนะนำให้ดาวน์โหลด CSV สำรองไว้ก่อน)
            </p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleClearAll}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md shadow-red-600/20"
              >
                ยืนยันการล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
