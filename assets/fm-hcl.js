/* ───────────────────────────────────────────────
   FM 人因照明 HCL 核心模組
   ───────────────────────────────────────────────
   晝夜節律、生理照度、場景管理、合規檢驗
   ─────────────────────────────────────────────── */
(function () {
  if (typeof FM === 'undefined') { console.error('fm-hcl: 需先載入 app.js'); return; }

  // ═══════════════════════════════════════════════════════════════
  // 晝夜曲線 — 6 時段
  // ═══════════════════════════════════════════════════════════════
  const SCHEDULE_6 = [
    {
      start: '06:00', end: '07:00', name: '晨間喚醒',
      cct: 3250,     lux: 400,    eml: 214,    cs: 0.48
    },
    {
      start: '07:00', end: '12:00', name: '上午促醒',
      cct: 5750,     lux: 750,    eml: 630,    cs: 0.60
    },
    {
      start: '12:00', end: '14:00', name: '中午維持',
      cct: 5750,     lux: 900,    eml: 756,    cs: 0.62
    },
    {
      start: '14:00', end: '17:00', name: '午後',
      cct: 4500,     lux: 650,    eml: 465,    cs: 0.58
    },
    {
      start: '17:00', end: '19:00', name: '傍晚過渡',
      cct: 3250,     lux: 350,    eml: 187,    cs: 0.46
    },
    {
      start: '19:00', end: '06:00', name: '晚間/夜間',
      cct: 2700,     lux: 125,    eml: 56,     cs: 0.25
    }
  ];

  // ═══════════════════════════════════════════════════════════════
  // 各空間合規目標（EN12464-1 / WELL）
  // ═══════════════════════════════════════════════════════════════
  const SPACE_TARGETS = {
    '候診區': {
      lux: [200, 300],      ra: 80,      cct: [3500, 4000],  ugr: 22
    },
    '掛號前台': {
      lux: [300, 500],      ra: 80,      cct: [4000, 4000],  ugr: 19
    },
    '診間': {
      lux: [500, 750],      ra: 90,      cct: [4000, 5000],  ugr: 19
    },
    '檢查室': {
      lux: [750, 1000],     ra: 90,      cct: [4500, 5000],  ugr: 19
    },
    '護理站': {
      lux: [500, 2000],     ra: 90,      cct: [4500, 5000],  ugr: 19
    },
    '走道': {
      lux: [200, 300],      ra: 80,      cct: [4000, 4500],  ugr: 22
    },
    '夜值班室': {
      lux: [30, 100],       ra: 70,      cct: [2200, 2700],  ugr: 25
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 臨床場景（6 種）
  // ═══════════════════════════════════════════════════════════════
  const SCENES = [
    { id: 'morning-alert', name: '晨間促醒', cct: 5500, dim: 85, note: '晨間快速喚醒' },
    { id: 'daytime-clinical', name: '日間診療', cct: 5000, dim: 90, note: '日間診療標準模式' },
    { id: 'evening-transition', name: '傍晚過渡', cct: 3500, dim: 65, note: '傍晚溫和過渡' },
    { id: 'night-eye-protection', name: '夜間護眼', cct: 2700, dim: 30, note: '夜間護眼低藍光' },
    { id: 'exam-high-cri', name: '檢查高顯色', cct: 5000, dim: 100, note: '檢查室高顯色指數' },
    { id: 'relax-waiting', name: '放鬆候診', cct: 3000, dim: 50, note: '候診區放鬆氛圍' }
  ];

  // ═══════════════════════════════════════════════════════════════
  // 輔助函式
  // ═══════════════════════════════════════════════════════════════

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round2(val) {
    return Math.round(val * 100) / 100;
  }

  function hhmm2hour(hhmm) {
    // "HH:MM" → hour as float (e.g., "14:30" → 14.5)
    if (typeof hhmm === 'number') return hhmm;
    const parts = String(hhmm).split(':');
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
  }

  function mDER(cct) {
    // 依 2700/4000/5000/6500 K 錨點線性內插
    // m-DER 範圍：2700→0.45, 4000→0.65, 5000→0.78, 6500→0.90
    cct = clamp(cct, 2700, 6500);
    if (cct <= 2700) return 0.45;
    if (cct >= 6500) return 0.90;
    if (cct <= 4000) {
      // 2700-4000 線性內插
      const ratio = (cct - 2700) / (4000 - 2700);
      return 0.45 + ratio * (0.65 - 0.45);
    }
    if (cct <= 5000) {
      // 4000-5000 線性內插
      const ratio = (cct - 4000) / (5000 - 4000);
      return 0.65 + ratio * (0.78 - 0.65);
    }
    // 5000-6500 線性內插
    const ratio = (cct - 5000) / (6500 - 5000);
    return 0.78 + ratio * (0.90 - 0.78);
  }

  function estimateEML(cct, lux) {
    // melanopic EDI ≈ lux × m-DER(cct)
    const m = mDER(cct);
    return Math.round(lux * m);
  }

  function estimateCS(eml) {
    // CS ≈ clamp(0.7 × (EML/(EML+100)), 0, 0.7)
    const val = (0.7 * eml) / (eml + 100);
    return round2(clamp(val, 0, 0.7));
  }

  function scheduleAt(hhmm) {
    // 回傳當下時段物件（支援 HH:MM 字串或 hour 數字）
    const hour = hhmm2hour(hhmm);
    // 晚間/夜間跨 19:00-06:00（夜間段）
    for (let i = 0; i < SCHEDULE_6.length; i++) {
      const seg = SCHEDULE_6[i];
      const startHr = hhmm2hour(seg.start);
      const endHr = hhmm2hour(seg.end);

      if (seg.name === '晚間/夜間') {
        // 特殊：跨夜 19:00-06:00 → 19<=h || h<6
        if (hour >= 19 || hour < 6) return seg;
      } else {
        if (hour >= startHr && hour < endHr) return seg;
      }
    }
    // fallback
    return SCHEDULE_6[SCHEDULE_6.length - 1];
  }

  function checkCompliance(spaceName, measures) {
    // measures = {lux, cct, ra, ugr}
    // 回傳 {lux, cct, ra, ugr, overall} — 'pass'|'warn'|'fail'
    const target = SPACE_TARGETS[spaceName];
    if (!target) return { lux: 'fail', cct: 'fail', ra: 'fail', ugr: 'fail', overall: 'fail' };

    const result = {};

    // lux: 範圍內 pass、±15% warn、外側 fail
    const [luxMin, luxMax] = target.lux;
    const luxMid = (luxMin + luxMax) / 2;
    const luxTol = luxMid * 0.15;
    if (measures.lux >= luxMin && measures.lux <= luxMax) {
      result.lux = 'pass';
    } else if (measures.lux >= luxMin - luxTol && measures.lux <= luxMax + luxTol) {
      result.lux = 'warn';
    } else {
      result.lux = 'fail';
    }

    // cct: 範圍內 pass，外側 fail
    const [cctMin, cctMax] = target.cct;
    result.cct = (measures.cct >= cctMin && measures.cct <= cctMax) ? 'pass' : 'fail';

    // ra: 達標 pass
    result.ra = (measures.ra >= target.ra) ? 'pass' : 'fail';

    // ugr: 達標 pass
    result.ugr = (measures.ugr <= target.ugr) ? 'pass' : 'fail';

    // overall: 全項 pass → pass，否則 fail
    result.overall = (result.lux === 'pass' && result.cct === 'pass' && result.ra === 'pass' && result.ugr === 'pass') ? 'pass' : 'fail';

    return result;
  }

  function nightBlueAlert(cct, hour) {
    // 夜間(19-6點)且 cct>3500 → true
    if ((hour >= 19 || hour < 6) && cct > 3500) return true;
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  // 公開 API
  // ═══════════════════════════════════════════════════════════════
  FM.hcl = {
    schedule: SCHEDULE_6,
    scheduleAt: scheduleAt,
    mDER: mDER,
    estimateEML: estimateEML,
    estimateCS: estimateCS,
    spaceTargets: SPACE_TARGETS,
    checkCompliance: checkCompliance,
    scenes: SCENES,
    nightBlueAlert: nightBlueAlert
  };

})();
