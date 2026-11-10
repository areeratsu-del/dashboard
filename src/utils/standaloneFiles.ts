export function generateSurveyHtml(customConfig?: string): string {
  const firebaseConfigString = customConfig || `{
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Prompt & Sarabun -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Canvas Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <!-- Firebase SDK (Compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; -webkit-tap-highlight-color: transparent; }
    .scale-btn { transition: all 0.15s ease-out; }
    .scale-btn:active { transform: scale(0.92); }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen pb-12 antialiased">

  <!-- Header Banner -->
  <header class="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-md">
    <div class="max-w-xl mx-auto px-5 py-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium tracking-wide mb-3 backdrop-blur-sm">
        <span>📝 แบบประเมินออนไลน์</span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
        <span>ไม่ต้องล็อกอิน</span>
      </div>
      <h1 class="text-xl sm:text-2xl font-bold leading-tight">แบบประเมินความพึงพอใจการอบรม</h1>
      <p class="text-indigo-100 text-sm mt-1">โปรดสละเวลา 1 นาทีเพื่อให้คะแนน ความคิดเห็นของท่านมีคุณค่ายิ่ง</p>
    </div>
  </header>

  <main class="max-w-xl mx-auto px-4 mt-4">
    
    <!-- Status Card (Already Submitted) -->
    <div id="alreadySubmittedCard" class="hidden bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center my-6">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
        🎉
      </div>
      <h2 class="text-xl font-bold text-slate-800">ท่านได้ส่งแบบประเมินเรียบร้อยแล้ว</h2>
      <p class="text-slate-500 text-sm mt-2">
        ขอบพระคุณสำหรับข้อคิดเห็นอันมีค่า ระบบบันทึกผลไปยังหน้าจอสรุปผลทันทีแล้ว
      </p>
      <div class="mt-6 pt-5 border-t border-slate-100">
        <button id="resubmitBtn" class="text-xs text-indigo-600 font-medium hover:underline py-2 px-3 rounded-lg hover:bg-indigo-50 transition">
          🔄 ต้องการตอบใหม่อีกครั้ง (ทดสอบระบบ)
        </button>
      </div>
    </div>

    <!-- Survey Form -->
    <form id="surveyForm" class="space-y-4">
      
      <!-- Progress Bar -->
      <div class="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 sticky top-2 z-10">
        <div class="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>ความคืบหน้า</span>
          <span id="progressText" class="text-indigo-600">0 / 5 ข้อ</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div id="progressBar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>

      <!-- Instruction note -->
      <div class="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
        <span class="text-base">💡</span>
        <span>เกณฑ์คะแนน: <b>1</b> = น้อยที่สุด, <b>2</b> = น้อย, <b>3</b> = ปานกลาง, <b>4</b> = มาก, <b>5</b> = มากที่สุด</span>
      </div>

      <!-- Question 1 -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3" id="card-q1">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
          <p class="font-medium text-slate-800 text-sm sm:text-base">เนื้อหาหลักสูตรมีความชัดเจน ทันสมัย และตรงตามวัตถุประสงค์</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-1" data-qid="q1">
          <button type="button" data-score="1" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300">
            <span class="text-2xl">😞</span>
            <span class="text-xs font-bold mt-1 text-slate-700">1</span>
            <span class="text-[10px] text-slate-400">น้อยสุด</span>
          </button>
          <button type="button" data-score="2" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300">
            <span class="text-2xl">🙁</span>
            <span class="text-xs font-bold mt-1 text-slate-700">2</span>
            <span class="text-[10px] text-slate-400">น้อย</span>
          </button>
          <button type="button" data-score="3" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300">
            <span class="text-2xl">😐</span>
            <span class="text-xs font-bold mt-1 text-slate-700">3</span>
            <span class="text-[10px] text-slate-400">ปานกลาง</span>
          </button>
          <button type="button" data-score="4" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300">
            <span class="text-2xl">🙂</span>
            <span class="text-xs font-bold mt-1 text-slate-700">4</span>
            <span class="text-[10px] text-slate-400">มาก</span>
          </button>
          <button type="button" data-score="5" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300">
            <span class="text-2xl">🤩</span>
            <span class="text-xs font-bold mt-1 text-slate-700">5</span>
            <span class="text-[10px] text-slate-400">มากสุด</span>
          </button>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3" id="card-q2">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
          <p class="font-medium text-slate-800 text-sm sm:text-base">วิทยากรมีความรู้ความเชี่ยวชาญ เทคนิคการถ่ายทอดน่าสนใจและเข้าใจง่าย</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-1" data-qid="q2">
          <button type="button" data-score="1" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😞</span><span class="text-xs font-bold mt-1 text-slate-700">1</span><span class="text-[10px] text-slate-400">น้อยสุด</span></button>
          <button type="button" data-score="2" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙁</span><span class="text-xs font-bold mt-1 text-slate-700">2</span><span class="text-[10px] text-slate-400">น้อย</span></button>
          <button type="button" data-score="3" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😐</span><span class="text-xs font-bold mt-1 text-slate-700">3</span><span class="text-[10px] text-slate-400">ปานกลาง</span></button>
          <button type="button" data-score="4" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙂</span><span class="text-xs font-bold mt-1 text-slate-700">4</span><span class="text-[10px] text-slate-400">มาก</span></button>
          <button type="button" data-score="5" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🤩</span><span class="text-xs font-bold mt-1 text-slate-700">5</span><span class="text-[10px] text-slate-400">มากสุด</span></button>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3" id="card-q3">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
          <p class="font-medium text-slate-800 text-sm sm:text-base">เอกสาร สื่อการสอน และตัวอย่าง Workshop มีความเหมาะสมและมีประโยชน์</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-1" data-qid="q3">
          <button type="button" data-score="1" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😞</span><span class="text-xs font-bold mt-1 text-slate-700">1</span><span class="text-[10px] text-slate-400">น้อยสุด</span></button>
          <button type="button" data-score="2" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙁</span><span class="text-xs font-bold mt-1 text-slate-700">2</span><span class="text-[10px] text-slate-400">น้อย</span></button>
          <button type="button" data-score="3" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😐</span><span class="text-xs font-bold mt-1 text-slate-700">3</span><span class="text-[10px] text-slate-400">ปานกลาง</span></button>
          <button type="button" data-score="4" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙂</span><span class="text-xs font-bold mt-1 text-slate-700">4</span><span class="text-[10px] text-slate-400">มาก</span></button>
          <button type="button" data-score="5" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🤩</span><span class="text-xs font-bold mt-1 text-slate-700">5</span><span class="text-[10px] text-slate-400">มากสุด</span></button>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3" id="card-q4">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
          <p class="font-medium text-slate-800 text-sm sm:text-base">ความพร้อมของสถานที่ อุปกรณ์ ระบบเครือข่าย และการประสานงาน</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-1" data-qid="q4">
          <button type="button" data-score="1" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😞</span><span class="text-xs font-bold mt-1 text-slate-700">1</span><span class="text-[10px] text-slate-400">น้อยสุด</span></button>
          <button type="button" data-score="2" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙁</span><span class="text-xs font-bold mt-1 text-slate-700">2</span><span class="text-[10px] text-slate-400">น้อย</span></button>
          <button type="button" data-score="3" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😐</span><span class="text-xs font-bold mt-1 text-slate-700">3</span><span class="text-[10px] text-slate-400">ปานกลาง</span></button>
          <button type="button" data-score="4" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙂</span><span class="text-xs font-bold mt-1 text-slate-700">4</span><span class="text-[10px] text-slate-400">มาก</span></button>
          <button type="button" data-score="5" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🤩</span><span class="text-xs font-bold mt-1 text-slate-700">5</span><span class="text-[10px] text-slate-400">มากสุด</span></button>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3" id="card-q5">
        <div class="flex items-start gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
          <p class="font-medium text-slate-800 text-sm sm:text-base">สามารถนำความรู้และทักษะที่ได้รับไปประยุกต์ใช้ในการทำงานได้จริง</p>
        </div>
        <div class="grid grid-cols-5 gap-2 pt-1" data-qid="q5">
          <button type="button" data-score="1" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😞</span><span class="text-xs font-bold mt-1 text-slate-700">1</span><span class="text-[10px] text-slate-400">น้อยสุด</span></button>
          <button type="button" data-score="2" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙁</span><span class="text-xs font-bold mt-1 text-slate-700">2</span><span class="text-[10px] text-slate-400">น้อย</span></button>
          <button type="button" data-score="3" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">😐</span><span class="text-xs font-bold mt-1 text-slate-700">3</span><span class="text-[10px] text-slate-400">ปานกลาง</span></button>
          <button type="button" data-score="4" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🙂</span><span class="text-xs font-bold mt-1 text-slate-700">4</span><span class="text-[10px] text-slate-400">มาก</span></button>
          <button type="button" data-score="5" class="scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300"><span class="text-2xl">🤩</span><span class="text-xs font-bold mt-1 text-slate-700">5</span><span class="text-[10px] text-slate-400">มากสุด</span></button>
        </div>
      </div>

      <!-- Comment (Optional) -->
      <div class="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-2">
        <label for="commentInput" class="block font-medium text-slate-800 text-sm">
          💬 ข้อเสนอแนะเพิ่มเติม <span class="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
        </label>
        <textarea id="commentInput" rows="3" placeholder="ระบุสิ่งที่ประทับใจ หรือข้อเสนอแนะในการพัฒนาครั้งต่อไป..." class="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition resize-none"></textarea>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button id="submitBtn" type="submit" disabled class="w-full py-4 rounded-xl font-bold text-white bg-slate-300 cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-base transition-all duration-200">
          <span>ส่งแบบประเมิน</span>
          <span id="btnIcon">🚀</span>
        </button>
        <p id="submitWarning" class="text-center text-xs text-amber-600 mt-2 font-medium">โปรดตอบให้ครบทั้ง 5 ข้อก่อนกดส่ง</p>
      </div>

    </form>
  </main>

  <script>
    // 1. Firebase Config
    const firebaseConfig = ${firebaseConfigString};

    // Initialize Firebase
    let db = null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
    } catch(err) {
      console.warn('Firebase config error or not configured yet:', err);
    }

    // State
    const scores = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    const STORAGE_KEY = 'training_survey_submitted';

    const form = document.getElementById('surveyForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitWarning = document.getElementById('submitWarning');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const alreadyCard = document.getElementById('alreadySubmittedCard');
    const resubmitBtn = document.getElementById('resubmitBtn');

    // Check duplicate
    if (localStorage.getItem(STORAGE_KEY)) {
      form.classList.add('hidden');
      alreadyCard.classList.remove('hidden');
    }

    resubmitBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      alreadyCard.classList.add('hidden');
      form.classList.remove('hidden');
    });

    // Score selection handling
    document.querySelectorAll('[data-qid]').forEach(group => {
      const qid = group.getAttribute('data-qid');
      const buttons = group.querySelectorAll('button');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const score = parseInt(btn.getAttribute('data-score'));
          scores[qid] = score;

          // Update button styling
          buttons.forEach(b => {
            b.className = 'scale-btn flex flex-col items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700';
          });
          btn.className = 'scale-btn flex flex-col items-center justify-center py-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-sm font-bold ring-2 ring-indigo-500/20';

          // Update Progress
          updateProgress();
        });
      });
    });

    function updateProgress() {
      const answeredCount = Object.values(scores).filter(s => s > 0).length;
      const pct = (answeredCount / 5) * 100;
      progressBar.style.width = pct + '%';
      progressText.textContent = answeredCount + ' / 5 ข้อ';

      if (answeredCount === 5) {
        submitBtn.disabled = false;
        submitBtn.className = 'w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-base transition-all duration-200 cursor-pointer';
        submitWarning.classList.add('hidden');
      } else {
        submitBtn.disabled = true;
        submitBtn.className = 'w-full py-4 rounded-xl font-bold text-white bg-slate-300 cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-base transition-all duration-200';
        submitWarning.classList.remove('hidden');
        submitWarning.textContent = 'ยังเหลืออีก ' + (5 - answeredCount) + ' ข้อที่ยังไม่ได้ตอบ';
      }
    }

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const answeredCount = Object.values(scores).filter(s => s > 0).length;
      if (answeredCount < 5) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>กำลังส่งข้อมูล...</span> <span class="animate-spin">⏳</span>';

      const comment = document.getElementById('commentInput').value.trim();
      const submission = {
        scores: scores,
        comment: comment,
        timestamp: firebase ? firebase.database.ServerValue.TIMESTAMP : Date.now()
      };

      try {
        if (db) {
          await db.ref('submissions').push(submission);
        } else {
          // If Firebase is not yet wired, simulate local submission
          console.log('Firebase DB not initialized, logged locally:', submission);
        }

        // Mark as submitted
        localStorage.setItem(STORAGE_KEY, 'true');

        // Confetti celebration
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        // Show thank you card
        setTimeout(() => {
          form.classList.add('hidden');
          alreadyCard.classList.remove('hidden');
        }, 600);

      } catch (err) {
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ส่งแบบประเมิน</span> <span>🚀</span>';
      }
    });
  </script>
</body>
</html>`;
}

export function generateDashboardHtml(customConfig?: string): string {
  const firebaseConfigString = customConfig || `{
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }`;

  return `<!DOCTYPE html>
<html lang="th" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard สรุปผลความพึงพอใจการอบรม (Live)</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Prompt & Sarabun -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- QRCode.js -->
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <!-- Firebase SDK (Compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
    .bar-animate { transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-8 antialiased">

  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Top Navigation & Controls Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl backdrop-blur-md shadow-xl">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-xs uppercase tracking-wider font-semibold text-emerald-400">LIVE DASHBOARD • อัปเดตทันที</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold mt-1 text-white">รายงานผลประเมินความพึงพอใจการอบรม</h1>
        <p class="text-xs md:text-sm text-slate-400">สำหรับขึ้นจอโปรเจกเตอร์ในห้องอบรมหรือการประชุมสัมมนา</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button id="showQrBtn" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-xs md:text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20">
          <span>📱</span> <span>QR Code ให้ผู้ฟังตอบ</span>
        </button>
        <button id="exportCsvBtn" class="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-medium text-xs md:text-sm rounded-xl transition flex items-center gap-2 border border-slate-600">
          <span>📥</span> <span>ดาวน์โหลด CSV</span>
        </button>
        <button id="toggleFullscreenBtn" class="px-3 py-2.5 bg-slate-700/80 hover:bg-slate-600 text-slate-300 text-xs md:text-sm rounded-xl transition">
          ⛶ เต็มจอ
        </button>
      </div>
    </header>

    <!-- Highlight Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      <!-- Total Respondents Card -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">จำนวนผู้ตอบแบบประเมิน</p>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="totalCount" class="text-4xl md:text-5xl font-extrabold text-white">0</span>
            <span class="text-slate-400 text-sm">คน</span>
          </div>
          <p class="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> เรียลไทม์ไม่ต้องกดรีเฟรช
          </p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
          👥
        </div>
      </div>

      <!-- Overall Average Score Card -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">คะแนนเฉลี่ยรวมทุกข้อ</p>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="overallAvg" class="text-4xl md:text-5xl font-extrabold text-indigo-400">0.00</span>
            <span class="text-slate-400 text-sm">/ 5.00</span>
          </div>
          <p id="starRating" class="text-sm mt-2 text-amber-400">⭐⭐⭐⭐⭐</p>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
          ⭐
        </div>
      </div>

      <!-- Likert Interpretation Card -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">ระดับความพึงพอใจ</p>
          <div class="mt-2">
            <span id="interpBadge" class="inline-block px-3.5 py-1.5 rounded-xl font-bold text-lg md:text-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              รอข้อมูล
            </span>
          </div>
          <p id="interpDesc" class="text-xs text-slate-400 mt-2">
            เกณฑ์: 4.51-5.00 มากที่สุด, 3.51-4.50 มาก, 2.51-3.50 ปานกลาง
          </p>
        </div>
      </div>

    </div>

    <!-- Main Content: Bar Charts & Comments -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left 2 Cols: Question Breakdown Chart -->
      <div class="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg space-y-6">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> <span>คะแนนเฉลี่ยรายข้อ (เกณฑ์ 5 ระดับ)</span>
          </h2>
          <span class="text-xs text-slate-400">เต็ม 5.00 คะแนน</span>
        </div>

        <div id="questionsContainer" class="space-y-5">
          <!-- Populated by JavaScript -->
        </div>
      </div>

      <!-- Right 1 Col: Live Comments Feed -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col h-[520px]">
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>💬</span> <span>ข้อเสนอแนะล่าสุด</span>
          </h2>
          <span id="commentCountBadge" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">0 ข้อความ</span>
        </div>

        <div id="commentsContainer" class="flex-1 overflow-y-auto space-y-3 pt-4 pr-1">
          <div class="text-center py-12 text-slate-500 text-sm">ยังไม่มีข้อเสนอแนะ</div>
        </div>
      </div>

    </div>

  </div>

  <!-- QR Code Modal -->
  <div id="qrModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl relative">
      <button id="closeQrBtn" class="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800">✕</button>
      <h3 class="text-xl font-bold text-white">สแกนเพื่อทำแบบประเมิน</h3>
      <p class="text-xs text-slate-400 mt-1">ใช้กล้องมือถือสแกนเพื่อเข้าสู่หน้าตอบได้ทันที</p>
      
      <div class="bg-white p-4 rounded-2xl inline-block my-5 shadow-inner">
        <div id="qrcode"></div>
      </div>

      <div class="flex flex-col gap-2">
        <input id="surveyUrlInput" type="text" readonly class="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 text-center select-all">
        <button id="copyUrlBtn" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition">
          📋 คัดลอกลิงก์
        </button>
      </div>
    </div>
  </div>

  <script>
    // 1. Firebase Config
    const firebaseConfig = ${firebaseConfigString};

    // Standard 5 Questions
    const questions = [
      { id: 'q1', text: '1. เนื้อหาหลักสูตรมีความชัดเจน ทันสมัย และตรงตามวัตถุประสงค์' },
      { id: 'q2', text: '2. วิทยากรมีความรู้ความเชี่ยวชาญ เทคนิคการถ่ายทอดน่าสนใจและเข้าใจง่าย' },
      { id: 'q3', text: '3. เอกสาร สื่อการสอน และตัวอย่าง Workshop มีความเหมาะสมและมีประโยชน์' },
      { id: 'q4', text: '4. ความพร้อมของสถานที่ อุปกรณ์ ระบบเครือข่าย และการประสานงาน' },
      { id: 'q5', text: '5. สามารถนำความรู้และทักษะที่ได้รับไปประยุกต์ใช้ในการทำงานได้จริง' }
    ];

    let submissionsData = [];

    // Initialize Firebase
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const db = firebase.database();
      
      // Listen to submissions in realtime
      db.ref('submissions').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          submissionsData = Object.keys(val).map(key => ({
            id: key,
            ...val[key]
          })).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
        } else {
          submissionsData = [];
        }
        renderDashboard();
      }, (err) => {
        console.error('Firebase error:', err);
      });

    } catch (e) {
      console.warn('Firebase init:', e);
    }

    // Likert Interpretation Helper
    function getInterpretation(score) {
      if (score >= 4.51) return { label: 'มากที่สุด', desc: 'ระดับยอดเยี่ยมสูงสุด ⭐⭐⭐⭐⭐', color: 'emerald' };
      if (score >= 3.51) return { label: 'มาก', desc: 'ผลการประเมินอยู่ในเกณฑ์ดี ⭐⭐⭐⭐', color: 'blue' };
      if (score >= 2.51) return { label: 'ปานกลาง', desc: 'ระดับปานกลางตามมาตรฐาน ⭐⭐⭐', color: 'amber' };
      if (score >= 1.51) return { label: 'น้อย', desc: 'ควรปรับปรุงในครั้งถัดไป ⭐⭐', color: 'orange' };
      if (score > 0) return { label: 'น้อยที่สุด', desc: 'จำเป็นต้องทบทวนอย่างเร่งด่วน ⭐', color: 'red' };
      return { label: 'รอข้อมูล', desc: 'ยังไม่มีการตอบแบบสอบถาม', color: 'slate' };
    }

    function renderDashboard() {
      const total = submissionsData.length;
      document.getElementById('totalCount').textContent = total;

      if (total === 0) {
        document.getElementById('overallAvg').textContent = '0.00';
        document.getElementById('interpBadge').textContent = 'รอข้อมูล';
        renderQuestionCharts({});
        renderComments([]);
        return;
      }

      // Calculate averages per question
      let totalAllSum = 0;
      let totalAllCount = 0;
      const questionAverages = {};

      questions.forEach(q => {
        let sum = 0;
        let count = 0;
        submissionsData.forEach(sub => {
          if (sub.scores && sub.scores[q.id]) {
            sum += sub.scores[q.id];
            count++;
          }
        });
        const avg = count > 0 ? (sum / count) : 0;
        questionAverages[q.id] = avg;
        totalAllSum += sum;
        totalAllCount += count;
      });

      const overall = totalAllCount > 0 ? (totalAllSum / totalAllCount) : 0;
      document.getElementById('overallAvg').textContent = overall.toFixed(2);
      
      const interp = getInterpretation(overall);
      const badge = document.getElementById('interpBadge');
      badge.textContent = interp.label;
      document.getElementById('interpDesc').textContent = interp.desc;

      renderQuestionCharts(questionAverages);
      
      const comments = submissionsData.filter(s => s.comment && s.comment.trim());
      renderComments(comments);
    }

    function renderQuestionCharts(averages) {
      const container = document.getElementById('questionsContainer');
      container.innerHTML = '';

      questions.forEach((q, i) => {
        const avg = averages[q.id] || 0;
        const pct = (avg / 5) * 100;
        const interp = getInterpretation(avg);

        const card = document.createElement('div');
        card.className = 'space-y-2';
        card.innerHTML = \`
          <div class="flex items-center justify-between text-xs sm:text-sm">
            <span class="font-medium text-slate-200">\${q.text}</span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-base">\${avg.toFixed(2)}</span>
              <span class="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-700/60">\${interp.label}</span>
            </div>
          </div>
          <div class="w-full bg-slate-700/60 rounded-full h-3.5 p-0.5 overflow-hidden">
            <div class="bar-animate bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 h-full rounded-full" style="width: \${pct}%"></div>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function renderComments(comments) {
      const container = document.getElementById('commentsContainer');
      document.getElementById('commentCountBadge').textContent = comments.length + ' ข้อความ';

      if (comments.length === 0) {
        container.innerHTML = '<div class="text-center py-12 text-slate-500 text-sm">ยังไม่มีข้อเสนอแนะเพิ่มเติม</div>';
        return;
      }

      container.innerHTML = comments.map(c => {
        const timeStr = c.timestamp ? new Date(c.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
        return \`
          <div class="p-3.5 rounded-xl bg-slate-750 bg-slate-700/40 border border-slate-700/60 space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-400">
              <span class="font-medium text-indigo-400">ผู้เข้าอบรม</span>
              <span>\${timeStr}</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">\${escapeHtml(c.comment)}</p>
          </div>
        \`;
      }).join('');
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // QR Code modal handling
    const qrModal = document.getElementById('qrModal');
    const surveyUrl = window.location.href.replace(/dashboard\\.html.*/i, 'survey.html');
    document.getElementById('surveyUrlInput').value = surveyUrl;

    let qrcodeObj = null;
    document.getElementById('showQrBtn').addEventListener('click', () => {
      qrModal.classList.remove('hidden');
      if (!qrcodeObj) {
        qrcodeObj = new QRCode(document.getElementById('qrcode'), {
          text: surveyUrl,
          width: 180,
          height: 180,
          colorDark : '#0f172a',
          colorLight : '#ffffff',
          correctLevel : QRCode.CorrectLevel.H
        });
      }
    });

    document.getElementById('closeQrBtn').addEventListener('click', () => {
      qrModal.classList.add('hidden');
    });

    document.getElementById('copyUrlBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(surveyUrl).then(() => {
        alert('คัดลอกลิงก์เรียบร้อยแล้ว!');
      });
    });

    // Fullscreen toggle
    document.getElementById('toggleFullscreenBtn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // CSV Export
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      if (submissionsData.length === 0) {
        alert('ยังไม่มีข้อมูลการตอบแบบประเมิน');
        return;
      }
      const BOM = '\\uFEFF';
      const rows = [];
      rows.push('"รายงานผลการประเมินความพึงพอใจการอบรม"');
      rows.push(\`"วันที่ส่งออก:","\${new Date().toLocaleString('th-TH')}"\`);
      rows.push('');
      rows.push(['ลำดับ', 'วัน-เวลา', 'ข้อ 1', 'ข้อ 2', 'ข้อ 3', 'ข้อ 4', 'ข้อ 5', 'ข้อเสนอแนะ'].map(c => \`"\${c}"\`).join(','));

      submissionsData.forEach((sub, i) => {
        const d = sub.timestamp ? new Date(sub.timestamp).toLocaleString('th-TH') : '-';
        const scores = questions.map(q => (sub.scores && sub.scores[q.id]) || '-');
        const comm = (sub.comment || '-').replace(/"/g, '""');
        rows.push([i+1, d, ...scores, comm].map(c => \`"\${c}"\`).join(','));
      });

      const blob = new Blob([BOM + rows.join('\\r\\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'training_evaluation_results.csv';
      a.click();
    });
  </script>
</body>
</html>`;
}

export function downloadStandaloneFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
