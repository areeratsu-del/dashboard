import { Question, SurveySubmission } from './types';

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: '1. เนื้อหาหลักสูตรมีความชัดเจน ทันสมัย และตรงตามวัตถุประสงค์',
    category: 'ด้านเนื้อหาหลักสูตร',
  },
  {
    id: 'q2',
    text: '2. วิทยากรมีความรู้ความเชี่ยวชาญ เทคนิคการถ่ายทอดน่าสนใจและเข้าใจง่าย',
    category: 'ด้านวิทยากร',
  },
  {
    id: 'q3',
    text: '3. เอกสาร สื่อการสอน และตัวอย่าง Workshop มีความเหมาะสมและมีประโยชน์',
    category: 'ด้านสื่อและเอกสาร',
  },
  {
    id: 'q4',
    text: '4. ความพร้อมของสถานที่ อุปกรณ์ ระบบเครือข่าย และการประสานงาน',
    category: 'ด้านการจัดการและสถานที่',
  },
  {
    id: 'q5',
    text: '5. สามารถนำความรู้และทักษะที่ได้รับไปประยุกต์ใช้ในการทำงานได้จริง',
    category: 'ด้านการนำไปใช้ประโยชน์',
  },
];

export const RATING_SCALE = [
  { score: 1, label: 'น้อยที่สุด', emoji: '😞', shortLabel: '1', color: '#ef4444' },
  { score: 2, label: 'น้อย', emoji: '🙁', shortLabel: '2', color: '#f97316' },
  { score: 3, label: 'ปานกลาง', emoji: '😐', shortLabel: '3', color: '#eab308' },
  { score: 4, label: 'มาก', emoji: '🙂', shortLabel: '4', color: '#3b82f6' },
  { score: 5, label: 'มากที่สุด', emoji: '🤩', shortLabel: '5', color: '#10b981' },
];

export function getInterpretation(average: number) {
  if (average >= 4.51) {
    return {
      label: 'มากที่สุด',
      description: 'ผู้เข้าอบรมมีความพึงพอใจในระดับยอดเยี่ยมสูงสุด',
      color: '#10b981',
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-500/30',
    };
  } else if (average >= 3.51) {
    return {
      label: 'มาก',
      description: 'ผลการประเมินอยู่ในเกณฑ์ดี มีความพึงพอใจสูง',
      color: '#3b82f6',
      bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
      textClass: 'text-blue-700 dark:text-blue-400',
      borderClass: 'border-blue-500/30',
    };
  } else if (average >= 2.51) {
    return {
      label: 'ปานกลาง',
      description: 'ผลการประเมินอยู่ในระดับปานกลางตามมาตรฐาน',
      color: '#eab308',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
      textClass: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-500/30',
    };
  } else if (average >= 1.51) {
    return {
      label: 'น้อย',
      description: 'ควรปรับปรุงเนื้อหาหรือรูปแบบการอบรมในครั้งถัดไป',
      color: '#f97316',
      bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      textClass: 'text-orange-700 dark:text-orange-400',
      borderClass: 'border-orange-500/30',
    };
  } else {
    return {
      label: 'น้อยที่สุด',
      description: 'จำเป็นต้องทบทวนและปรับปรุงกระบวนการจัดอบรมอย่างเร่งด่วน',
      color: '#ef4444',
      bgClass: 'bg-red-500/10 dark:bg-red-500/20',
      textClass: 'text-red-700 dark:text-red-400',
      borderClass: 'border-red-500/30',
    };
  }
}

export const INITIAL_SAMPLE_SUBMISSIONS: SurveySubmission[] = [
  {
    id: 'sub-1',
    timestamp: Date.now() - 1000 * 60 * 25,
    scores: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 5 },
    comment: 'วิทยากรอธิบายเข้าใจง่ายมาก มีตัวอย่างจริงให้ลงมือทำ ชอบมากครับ',
  },
  {
    id: 'sub-2',
    timestamp: Date.now() - 1000 * 60 * 18,
    scores: { q1: 4, q2: 5, q3: 5, q4: 4, q5: 5 },
    comment: 'สไลด์สวยงาม เอกสารแจกครบถ้วน อยากให้มีคอร์สขั้นสูงต่ออีกครับ',
  },
  {
    id: 'sub-3',
    timestamp: Date.now() - 1000 * 60 * 12,
    scores: { q1: 5, q2: 4, q3: 4, q4: 4, q5: 4 },
    comment: 'บรรยากาศดี เจ้าหน้าที่ดูแลดีมาก ระบบอินเทอร์เน็ตเสถียร',
  },
  {
    id: 'sub-4',
    timestamp: Date.now() - 1000 * 60 * 5,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    comment: 'เนื้อหาตอบโจทย์ สามารถนำไปประยุกต์ใช้ในทีมได้ทันทีในวันจันทร์นี้เลย',
  },
  {
    id: 'sub-5',
    timestamp: Date.now() - 1000 * 60 * 2,
    scores: { q1: 4, q2: 5, q3: 4, q4: 3, q5: 4 },
    comment: 'แอร์ในห้องอบรมเย็นไปนิดนึงครับ แต่วิทยากรเก่งมาก สอนสนุกไม่ง่วงเลย',
  },
];
