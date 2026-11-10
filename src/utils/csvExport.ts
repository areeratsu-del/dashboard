import { Question, SurveySubmission, SummaryStats } from '../types';
import { getInterpretation } from '../constants';

export function exportSubmissionsToCSV(
  questions: Question[],
  submissions: SurveySubmission[],
  stats: SummaryStats,
  seminarTitle: string = 'รายงานสรุปผลการประเมินความพึงพอใจการอบรม'
): void {
  // UTF-8 BOM so Excel opens Thai characters flawlessly
  const BOM = '\uFEFF';

  const rows: string[] = [];

  // Title headers
  rows.push(`"${seminarTitle}"`);
  rows.push(`"วันที่ส่งออกรายงาน:","${new Date().toLocaleString('th-TH')}"`);
  rows.push(`"จำนวนผู้ตอบทั้งหมด:","${submissions.length} ท่าน"`);
  rows.push(
    `"คะแนนเฉลี่ยรวม:","${stats.overallAverage.toFixed(2)} / 5.00","ระดับ:","${stats.interpretation.label}"`
  );
  rows.push(''); // blank row

  // Table header for raw data
  const headerCols = [
    'ลำดับ',
    'รหัสการตอบ',
    'วัน-เวลาที่ส่ง',
    ...questions.map((q, idx) => `ข้อ ${idx + 1}: ${q.text.replace(/^(\d+\.\s*)/, '')}`),
    'คะแนนเฉลี่ยรายบุคคล',
    'ระดับความพึงพอใจ',
    'ข้อเสนอแนะเพิ่มเติม',
  ];
  rows.push(headerCols.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  submissions.forEach((sub, index) => {
    const dateStr = new Date(sub.timestamp).toLocaleString('th-TH');
    const scores = questions.map((q) => sub.scores[q.id] || 0);
    const validScores = scores.filter((s) => s > 0);
    const personalAvg =
      validScores.length > 0
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
        : '0.00';
    const interp = getInterpretation(Number(personalAvg));
    const commentSafe = (sub.comment || '-').replace(/"/g, '""').replace(/\n/g, ' ');

    const row = [
      String(index + 1),
      sub.id,
      dateStr,
      ...scores.map((s) => String(s)),
      personalAvg,
      interp.label,
      commentSafe,
    ];
    rows.push(row.map((cell) => `"${cell}"`).join(','));
  });

  // Summary statistics rows at the bottom
  rows.push('');
  rows.push('"--- สรุปคะแนนเฉลี่ยรายข้อ ---"');
  rows.push(
    [
      'สรุป',
      '-',
      'ค่าเฉลี่ย (Mean)',
      ...stats.questionStats.map((qs) => qs.average.toFixed(2)),
      stats.overallAverage.toFixed(2),
      stats.interpretation.label,
      '-',
    ]
      .map((cell) => `"${cell}"`)
      .join(',')
  );

  rows.push(
    [
      'สรุป',
      '-',
      'การแปลผล',
      ...stats.questionStats.map((qs) => getInterpretation(qs.average).label),
      stats.interpretation.label,
      '-',
      '-',
    ]
      .map((cell) => `"${cell}"`)
      .join(',')
  );

  const csvContent = BOM + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  link.setAttribute('download', `training_satisfaction_results_${dateSuffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
