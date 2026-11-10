import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, RotateCcw, Sparkles, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Question, SurveySubmission } from '../types';
import { RATING_SCALE } from '../constants';
import {
  submitSurveyResponse,
  isDeviceAlreadySubmitted,
  resetDeviceSubmissionStatus,
} from '../services/storageService';

interface SurveyViewProps {
  questions: Question[];
  onSubmitted?: (submission: SurveySubmission) => void;
  onViewDashboard?: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({
  questions,
  onSubmitted,
  onViewDashboard,
}) => {
  const [scores, setScores] = useState<{ [qid: string]: number }>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SurveySubmission | null>(null);

  useEffect(() => {
    setHasSubmitted(isDeviceAlreadySubmitted());
  }, []);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(scores).filter((qid) => (scores[qid] || 0) > 0).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const isFormComplete = answeredCount === totalQuestions;

  const handleScoreSelect = (questionId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitSurveyResponse(scores, comment);
      setSubmittedData(result);
      setHasSubmitted(true);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }

      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    resetDeviceSubmissionStatus();
    setHasSubmitted(false);
    setScores({});
    setComment('');
    setSubmittedData(null);
  };

  if (hasSubmitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700/80 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner shadow-emerald-500/20">
            🎉
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกคำตอบเรียบร้อยแล้ว
          </span>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            ขอบพระคุณสำหรับข้อคิดเห็น
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            ข้อมูลการประเมินของท่านถูกส่งไปยังหน้าจอ Dashboard ของผู้จัดอบรมแบบเรียลไทม์แล้ว เพื่อนำไปพัฒนาการจัดอบรมในครั้งต่อไปให้ดียิ่งขึ้น
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> สถานะความปลอดภัย
              </span>
              <span>ไม่ระบุตัวตน (Anonymous)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-500" /> การป้องกันตอบซ้ำ
              </span>
              <span>จำกัด 1 เครื่อง / 1 ครั้ง</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {onViewDashboard && (
              <button
                onClick={onViewDashboard}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                <span>📊 ดูผลลัพธ์บน Live Dashboard</span>
              </button>
            )}

            <button
              onClick={handleResetForTesting}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-2xl text-xs transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ตอบแบบประเมินใหม่อีกครั้ง (สำหรับทดสอบ)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 pb-20">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-indigo-600/15 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

        <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            แบบประเมินความพึงพอใจ
          </span>
          <span>• ไม่ต้องล็อกอิน</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold leading-snug">
          โครงการฝึกอบรมและสัมมนาเชิงปฏิบัติการ
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100/90 mt-1.5 leading-relaxed">
          โปรดเลือกคะแนนระดับความพึงพอใจ 1 - 5 ในแต่ละหัวข้อ (ใช้เวลาประมาณ 1 นาที)
        </p>

        {/* Progress Bar inside banner */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center justify-between text-xs font-medium text-indigo-100 mb-1.5">
            <span>ความคืบหน้าการตอบ</span>
            <span className="font-semibold text-white">
              {answeredCount} / {totalQuestions} ข้อ ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rating Scale Legend Reference */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 mb-4 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between shadow-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200">คำอธิบายระดับ:</span>
        <div className="flex items-center gap-2 text-[11px]">
          <span>1 = น้อยสุด</span>
          <span className="text-slate-300">•</span>
          <span>3 = ปานกลาง</span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">5 = มากที่สุด</span>
        </div>
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, index) => {
          const currentScore = scores[question.id] || 0;
          const isAnswered = currentScore > 0;

          return (
            <div
              key={question.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xs border transition-all duration-200 ${
                isAnswered
                  ? 'border-indigo-200 dark:border-indigo-900/60 shadow-indigo-500/5 ring-1 ring-indigo-500/10'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                    isAnswered
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  {question.category && (
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      {question.category}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    {question.text.replace(/^(\d+\.\s*)/, '')}
                  </h3>
                </div>
              </div>

              {/* Likert Scale Buttons (1-5) */}
              <div className="grid grid-cols-5 gap-2 mt-4 pt-1">
                {RATING_SCALE.map((scale) => {
                  const isSelected = currentScore === scale.score;

                  return (
                    <button
                      type="button"
                      key={scale.score}
                      onClick={() => handleScoreSelect(question.id, scale.score)}
                      className={`group relative flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl border transition-all duration-150 active:scale-95 focus:outline-none select-none ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-500/20 text-indigo-950 dark:text-indigo-100'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {/* Emoji */}
                      <span className="text-2xl sm:text-3xl filter transition-transform group-hover:scale-110">
                        {scale.emoji}
                      </span>

                      {/* Number badge */}
                      <span
                        className={`text-xs sm:text-sm font-bold mt-1.5 transition-colors ${
                          isSelected
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {scale.score}
                      </span>

                      {/* Text label */}
                      <span
                        className={`text-[9px] sm:text-[10px] mt-0.5 transition-colors line-clamp-1 ${
                          isSelected
                            ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {scale.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Optional Comment Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <label
            htmlFor="comment"
            className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนา</span>
            <span className="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ท่านสามารถระบุสิ่งที่ประทับใจ จุดที่อยากให้ปรับปรุง หรือหัวข้อที่ต้องการให้อบรมในอนาคต
          </p>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="พิมพ์ข้อเสนอแนะของท่านที่นี่..."
            className="w-full text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition resize-none"
            maxLength={500}
          />
          <div className="flex justify-end text-[11px] text-slate-400">
            <span>{comment.length} / 500 ตัวอักษร</span>
          </div>
        </div>

        {/* Submit Action Card */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl select-none ${
              isFormComplete && !isSubmitting
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <span>ส่งแบบประเมิน</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {!isFormComplete && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 mt-2.5 font-medium animate-pulse">
              ⚠️ ยังตอบไม่ครบ: ขาดอีก {totalQuestions - answeredCount} ข้อ โปรดเลือกให้ครบทั้ง 5 ข้อ
            </p>
          )}

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            ระบบป้องกันการตอบซ้ำและไม่เก็บข้อมูลระบุตัวบุคคล
          </p>
        </div>
      </form>
    </div>
  );
};
