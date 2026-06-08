/* ============================================================================
   德新行政管理平台 — 全域應用物件 (app.js)
   純前端、無 import/export、直接全域注入
   ============================================================================ */

const FM = {};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 1. 空間編碼主資料 — FM.spaces                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.spaces = {
  // 空間分區定義
  areas: {
    A: { name: '接待門診', abbr: 'Reception' },
    B: { name: '物理治療', abbr: 'PT' },
    C: { name: '運動訓練', abbr: 'Training' },
    D: { name: '後勤行政', abbr: 'Admin' },
    E: { name: '輔助(更衣淋浴冰敷)', abbr: 'Support' }
  },

  // 房間列表 [區域][房號] = 房間名稱
  rooms: {
    A: {
      1: '掛號大廳',
      2: '醫師診間',
      3: '候診區',
      4: '轉診窗口'
    },
    B: {
      1: '震波治療室',
      2: '運動推傷室',
      3: '牽引治療室',
      4: '冷療室'
    },
    C: {
      1: '有氧訓練區',
      2: '肌力訓練室',
      3: '矯正訓練區',
      4: '評測室'
    },
    D: {
      1: '辦公室',
      2: '會議室',
      3: '檔案室',
      4: '物品倉庫'
    },
    E: {
      1: '男更衣室',
      2: '女更衣室',
      3: '淋浴室',
      4: '冰敷室'
    }
  },

  // 子系統點位定義
  subsystems: {
    PWR: { name: '電力', prefix: 'PWR', color: '#FF6B35' },
    HVAC: { name: '空調', prefix: 'HVAC', color: '#004E89' },
    AIR: { name: '新風空品', prefix: 'AIR', color: '#1B998B' },
    FIRE: { name: '消防', prefix: 'FIRE', color: '#C0392B' },
    WTR: { name: '給排水漏水', prefix: 'WTR', color: '#2E86AB' },
    AST: { name: '資產保固', prefix: 'AST', color: '#A23B72' },
    SUP: { name: '耗材布草', prefix: 'SUP', color: '#F18F01' },
    ACC: { name: '門禁安防', prefix: 'ACC', color: '#624E88' },
    CLN: { name: '環境清潔', prefix: 'CLN', color: '#2A9D8F' },
    SCH: { name: '排程稼動', prefix: 'SCH', color: '#E76F51' },
    DSP: { name: '報修派工', prefix: 'DSP', color: '#D62828' },
    CCTV: { name: '影像監控', prefix: 'CCTV', color: '#3D5A80' },
    SEC: { name: '保全排班', prefix: 'SEC', color: '#7B6079' },
    STF: { name: '在線人員', prefix: 'STF', color: '#3A7CA5' },
    RPT: { name: '同仁回報', prefix: 'RPT', color: '#E07A5F' },
    VND: { name: '外包商管理', prefix: 'VND', color: '#6A4C93' }
  },

  // 空間碼生成：7-[Area][Room]-[Subsystem]-[Point]
  // 範例：7-A1-PWR-01 → 7樓、接待門診、診間1、電力、01號點位
  getCode: function(area, room, subsystem, point) {
    return `7-${area}${room}-${subsystem}-${String(point).padStart(2, '0')}`;
  },

  // 解析空間碼
  parseCode: function(code) {
    // 格式：7-A1-PWR-01
    const match = code.match(/^7-([A-E])(\d+)-([A-Z]+)-(\d+)$/);
    if (!match) return null;
    return {
      floor: 7,
      area: match[1],
      room: match[2],
      subsystem: match[3],
      point: match[4]
    };
  },

  // 取得空間完整名稱
  getFullName: function(code) {
    const parsed = this.parseCode(code);
    if (!parsed) return code;
    const areaName = this.areas[parsed.area]?.name || 'Unknown';
    const roomName = this.rooms[parsed.area]?.[parsed.room] || '未知房間';
    const subsysName = this.subsystems[parsed.subsystem]?.name || 'Unknown';
    return `${areaName}-${roomName} (${subsysName})`;
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 2. 共用告警陣列 — FM.alerts                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.alerts = [
  {
    id: 'ALT-001',
    level: 'crit',
    space: '7-B3-PWR-01',
    time: new Date(Date.now() - 5 * 60000),
    system: 'PWR',
    msg: 'B3振波治療室220V專迴電表過載',
    aiAction: '自動斷路+通知管理員',
    needConfirm: true,
    confirmed: false
  },
  {
    id: 'ALT-002',
    level: 'warn',
    space: '7-E2-WTR-03',
    time: new Date(Date.now() - 15 * 60000),
    system: 'WTR',
    msg: '輔助區漏水感測異常濕度',
    aiAction: '派工清潔檢查',
    needConfirm: false,
    confirmed: true
  },
  {
    id: 'ALT-003',
    level: 'info',
    space: '7-D1-SCH-01',
    time: new Date(Date.now() - 1 * 3600000),
    system: 'SCH',
    msg: '每週例行保養排程提醒',
    aiAction: '日報記錄',
    needConfirm: false,
    confirmed: true
  },
  {
    id: 'ALT-004',
    level: 'crit',
    space: '7-C1-HVAC-02',
    time: new Date(Date.now() - 2 * 60000),
    system: 'HVAC',
    msg: '有氧訓練區空調水溫異常高',
    aiAction: '自動關斷+緊急派工',
    needConfirm: true,
    confirmed: false
  },
  {
    id: 'ALT-005',
    level: 'warn',
    space: '7-A2-ACC-01',
    time: new Date(Date.now() - 30 * 60000),
    system: 'ACC',
    msg: '醫師診間門禁未解鎖',
    aiAction: '開工單+安全巡檢',
    needConfirm: false,
    confirmed: true
  }
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* 3. 模組定義 — 16 個子系統 + 中控首頁 + 3 個管理工具（Hermes/LINE/回報）       */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.modules = [
  { key: 'home', label: '戰情中控', icon: '📊' },
  { key: 'power', label: '電力 PWR', icon: '⚡' },
  { key: 'hvac', label: '空調 HVAC', icon: '❄️' },
  { key: 'air', label: '新風空品 AIR', icon: '💨' },
  { key: 'fire', label: '消防 FIRE', icon: '🔥' },
  { key: 'water', label: '給排水 WTR', icon: '💧' },
  { key: 'asset', label: '資產保固 AST', icon: '📦' },
  { key: 'supplies', label: '耗材布草 SUP', icon: '🧼' },
  { key: 'access', label: '門禁清潔 ACC·CLN', icon: '🔐' },
  { key: 'scheduling', label: '排程稼動 SCH', icon: '📅' },
  { key: 'dispatch', label: '報修派工 DSP', icon: '🚀' },
  { key: 'cctv', label: '影像監控 CCTV', icon: '📹' },
  { key: 'security', label: '保全排班 SEC', icon: '🛡️' },
  { key: 'staff', label: '在線人員 STF', icon: '🧑‍⚕️' },
  { key: 'hermes', label: 'Hermes AI 主管台', icon: '🤖' },
  { key: 'line', label: 'LINE 推播中心', icon: '💬' },
  { key: 'report', label: '同仁回報·接收端', icon: '📥' },
  { key: 'vendor', label: '外包商管理 VND', icon: '🤝' }
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4. renderShell(activeKey, title) — 注入側欄+頂部、統一 title 格式         */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.renderShell = function(activeKey, title) {
  // 自動產生統一格式的 document title（移除舊模組內手寫標題）
  document.title = `${title} | 德新行政管理平台`;

  // 判斷相對路徑基點（是否在 modules/ 子目錄）
  const isInModule = window.location.pathname.includes('/modules/');
  const basePath = isInModule ? '../' : '';

  // 建構側欄 HTML
  let navHtml = '<ul>';
  FM.modules.forEach(mod => {
    const isActive = mod.key === activeKey ? 'active' : '';
    let href = '#';

    if (mod.key === 'home') {
      href = `${basePath}index.html`;
    } else {
      href = `${basePath}modules/${mod.key}.html`;
    }

    navHtml += `
      <li>
        <a href="${href}" class="${isActive}">
          <span>${mod.icon}</span> ${mod.label}
        </a>
      </li>
    `;
  });
  navHtml += '</ul>';

  // 建構頂部告警徽章
  const critCount = FM.alerts.filter(a => a.level === 'crit' && !a.confirmed).length;
  const warnCount = FM.alerts.filter(a => a.level === 'warn' && !a.confirmed).length;
  const infoCount = FM.alerts.filter(a => a.level === 'info').length;

  let alertsHtml = '';
  if (critCount > 0) {
    alertsHtml += `<div class="alert-badge crit"><span class="dot"></span>緊急 ${critCount}</div>`;
  }
  if (warnCount > 0) {
    alertsHtml += `<div class="alert-badge warn"><span class="dot"></span>一般 ${warnCount}</div>`;
  }
  if (infoCount > 0) {
    alertsHtml += `<div class="alert-badge info"><span class="dot"></span>資訊 ${infoCount}</div>`;
  }
  if (critCount === 0 && warnCount === 0 && infoCount === 0) {
    alertsHtml += `<div class="alert-badge info">全部正常</div>`;
  }

  // 構建完整 shell HTML
  const shellHtml = `
    <div id="fm-sidebar">
      <h1>德新行政管理平台</h1>
      <nav>${navHtml}</nav>
    </div>
    <div id="fm-topbar">
      <h2>${title}</h2>
      <div id="fm-topbar-status" style="display:flex; gap:8px; align-items:center; margin-left:auto;">
        <span class="alert-badge" style="background:#E6F7EE; color:#1A7A4A; cursor:pointer;" onclick="location.href='${basePath}modules/hermes.html'" title="Hermes AI 主管台"><span class="dot" style="background:#00A94F;"></span>Hermes 在線</span>
        <span class="alert-badge" style="background:#E8F5E9; color:#06C755; cursor:pointer;" onclick="location.href='${basePath}modules/line.html'" title="LINE 推播中心"><span class="dot" style="background:#06C755;"></span>LINE 已連線</span>
      </div>
      <div id="fm-topbar-alerts">${alertsHtml}</div>
    </div>
    <div id="fm-shell">
      <div id="fm-content">
        <!-- 各模組內容注入此 -->
      </div>
    </div>
  `;

  // 注入到 body
  document.body.innerHTML = shellHtml;

  // 注入 Hermes AI 常駐對話面板（全頁）
  if (FM.renderAgentDock) FM.renderAgentDock();
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4b. LINE 推播引擎 — FM.pushLine / FM.lineGroups / FM.lineLog                 */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.lineGroups = [
  { key: 'mgr',  name: '主管群',     desc: '德新 FM 主管 + 院方窗口', members: 6 },
  { key: 'eng',  name: '工務群',     desc: '機電/維修值班', members: 8 },
  { key: 'nur',  name: '護理站群',   desc: '使用單位-護理站', members: 12 },
  { key: 'unit', name: '使用單位群', desc: '運醫會館營運團隊', members: 9 },
];
// 告警分級 → 預設推播群組
FM.linePushRules = { crit: ['mgr','eng','unit'], warn: ['eng','unit'], info: ['unit'] };
// 初始化推播日誌（含示範種子資料）— 單一真實來源由 app.js 管理
FM.lineLog = [
  { time:new Date(Date.now()-300000), groups:['主管群','工務群','使用單位群'], groupKeys:['mgr','eng','unit'], level:'crit', msg:'🔴緊急 7-B3-PWR-01\nB3 震波區 220V 專迴電表過載\n建議：自動斷路+通知管理員' },
  { time:new Date(Date.now()-1800000), groups:['工務群','使用單位群'], groupKeys:['eng','unit'], level:'warn', msg:'🟠注意 7-E2-WTR-03\n輔助區漏水感測異常濕度\n建議：派工清潔檢查' },
  { time:new Date(Date.now()-3600000), groups:['使用單位群'], groupKeys:['unit'], level:'info', msg:'🔵資訊 每週例行保養排程提醒' },
];

FM.pushLine = function(groupKeys, msg, level, silent) {
  level = level || 'info';
  const names = (groupKeys || []).map(k => (FM.lineGroups.find(g => g.key === k) || {}).name).filter(Boolean);
  const entry = { time: new Date(), groups: names, groupKeys: groupKeys || [], msg: msg, level: level };
  FM.lineLog.unshift(entry);
  if (!silent) FM.toast('已推播 LINE：' + names.join('、'), level);  // 自動推播 silent=true 不顯示
  return entry;
};
// 依告警自動推播（套用規則）— 自動觸發，靜音不跳 toast
FM.pushLineByAlert = function(alert) {
  const keys = FM.linePushRules[alert.level] || ['unit'];
  const tag = alert.level === 'crit' ? '🔴緊急' : alert.level === 'warn' ? '🟠注意' : '🔵資訊';
  // 驗證 space 碼格式
  let spaceStr = alert.space || '';
  if (spaceStr && !FM.spaces.parseCode(spaceStr)) {
    console.warn(`[FM.pushLineByAlert] 無效的空間碼：${spaceStr}`);
    // 若空間碼無效，使用備用資訊或清空
    spaceStr = `[無效空間] ${spaceStr}`;
  }
  return FM.pushLine(keys, `${tag} ${spaceStr}\n${alert.msg || alert.name || ''}\n建議：${alert.aiAction || '—'}`, alert.level, true);
};

/* 輕量 Toast 提示 */
FM.toast = function(msg, level) {
  if (typeof document === 'undefined' || !document.body) return;
  const colors = { crit: '#C0392B', warn: '#E8730C', info: '#06C755', ok: '#1A7A4A' };
  let wrap = document.getElementById('fm-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'fm-toast-wrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.style.cssText = `background:${colors[level]||'#06C755'};color:#fff;padding:10px 18px;border-radius:24px;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,.25);opacity:0;transition:opacity .25s;white-space:pre-line;text-align:center;`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.style.opacity = '1', 10);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4d. 即時聯絡名冊 — FM.contacts（保全 / 德新人員，LINE + 工務機）            */
/* 註：以下為示範號碼，正式版請填入實際聯絡方式                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.contacts = [
  { group:'保全',     name:'保全值班台',   role:'大廳崗 · 24h', ext:'#6001', phone:'0912-345-001', line:'@landseed-sec', urgent:true },
  { group:'保全',     name:'巡邏機動保全', role:'機動支援',     ext:'#6003', phone:'0912-345-003', line:'', urgent:false },
  { group:'德新工務', name:'機電值班',     role:'空調/電力/消防', ext:'#6101', phone:'0912-345-101', line:'@deshin-eng', urgent:true },
  { group:'德新工務', name:'維修/水電',    role:'維修/給排水',   ext:'#6102', phone:'0912-345-102', line:'', urgent:false },
  { group:'德新 FM',  name:'現場 FM 主管', role:'維運督導',     ext:'#6100', phone:'0912-345-100', line:'@deshin-fm', urgent:true },
  { group:'德新總務', name:'清潔/總務',    role:'清潔/耗材',     ext:'#6201', phone:'0912-345-201', line:'', urgent:false },
  { group:'緊急',     name:'火警/醫療急救', role:'院內分機 0 / 外線 119', ext:'#0', phone:'119', line:'', urgent:true },
];

// 聯絡卡片：FM.contactCard(c) → 含 撥打/工務機/LINE 按鈕
FM.contactCard = function(c) {
  const telPhone = (c.phone||'').replace(/[^0-9+]/g,'');
  const lineHref = c.line ? 'https://line.me/R/ti/p/' + encodeURIComponent(c.line) : '';
  const gColor = { '保全':'#7B6079', '德新工務':'#D35400', '德新 FM':'#0054A7', '德新總務':'#1A7A4A', '緊急':'#C0392B' }[c.group] || '#0054A7';
  return `<div class="card" style="border-left:4px solid ${gColor};">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>${c.name}</strong> ${c.urgent?'<span class="badge crit">即時</span>':''}<div class="text-muted text-sm">${c.group} · ${c.role}</div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
        <a class="btn btn-secondary btn-small" href="tel:${telPhone}" style="text-decoration:none;">📞 ${c.phone}</a>
        <span class="btn btn-secondary btn-small" style="background:#eef2f7;color:#3E3A39;cursor:default;">📟 工務機 ${c.ext}</span>
        ${c.line ? `<a class="btn btn-small" href="${lineHref}" target="_blank" style="background:#06C755;color:#fff;text-decoration:none;">💬 LINE ${c.line}</a>` : ''}
      </div>
    </div>
  </div>`;
};

// 聯絡名冊整體 HTML（依群組）：FM.renderContacts()
FM.renderContacts = function() {
  const groups = ['緊急','保全','德新工務','德新 FM','德新總務'];
  let h = '';
  groups.forEach(g => {
    const list = FM.contacts.filter(c => c.group === g);
    if (!list.length) return;
    h += `<div class="mb-3" style="margin-top:14px;"><h3 class="section-title">${g}</h3></div>`;
    h += `<div class="grid grid-cols-2 gap-3" style="--responsive-cols:auto;">${list.map(c => FM.contactCard(c)).join('')}</div>`;
  });
  h += '<div class="text-muted text-sm" style="margin-top:12px;">＊以上為示範聯絡方式；手機點「📞」可直接撥號、點「💬 LINE」可加入官方帳號。工務機為院內對講分機。</div>';
  return h;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4c. Hermes AI 主管台 — 全頁常駐對話面板（對話 / 管理 / 訓練）               */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.hermesHistory = [];
FM.hermesTraining = [];

// 模擬 Hermes 推理（依關鍵字 + 即時 FM 資料）
FM.hermesReply = function(text) {
  const t = (text || '').toLowerCase();
  const crit = FM.alerts.filter(a => a.level === 'crit' && !a.confirmed);
  const warn = FM.alerts.filter(a => a.level === 'warn' && !a.confirmed);
  if (/告警|緊急|狀況|問題|現在|目前/.test(text)) {
    if (crit.length === 0 && warn.length === 0) return '目前全系統正常，無待處理的緊急或一般告警。需要我幫您調閱某個子系統的即時狀態嗎？';
    let r = `目前有 ${crit.length} 件緊急、${warn.length} 件一般告警待處理。\n`;
    crit.slice(0,3).forEach(a => r += `• 🔴 ${a.space || ''}：${a.msg || a.name}\n`);
    r += '需要我把這些狀況一鍵推播到 LINE 主管群與使用單位群嗎？回覆「推播」即可。';
    return r;
  }
  if (/推播|line|通知/.test(text)) {
    const targets = crit.length ? crit : warn;
    if (!targets.length) { return '目前沒有需要推播的告警。若要測試推播，可到「LINE 推播中心」按測試。'; }
    targets.slice(0,3).forEach(a => FM.pushLineByAlert(a));
    return `已將 ${Math.min(targets.length,3)} 件告警推播至對應 LINE 群組（主管群／工務群／使用單位群）。可於「LINE 推播中心」查看推播紀錄。`;
  }
  if (/派工|工單|維修/.test(text)) return '目前派工中控有待指派工單。建議優先處理緊急等級（如電力過載、空調水溫異常）。要我幫您指派給工務群值班人員嗎？';
  if (/能耗|用電|電力|節能/.test(text)) return '本月空調為最大耗能項，AI 預估透過排程啟停與設定點優化可再省 10-25%。要我產生本週節能建議報告嗎？';
  if (/人員|在勤|保全|排班/.test(text)) return '目前在線人員與保全排班正常。若有人員超時或未到崗，我會即時提醒並可推播至主管群。要查看即時在線人員分布嗎？';
  if (/訓練|教你|修正|學習|記住/.test(text)) return '好的，已進入訓練模式。您可以對我的任何回覆按「✎ 修正」提供正確答覆，我會記錄並用於後續微調。也可以直接告訴我新的處理 SOP。';
  if (/你好|嗨|hi|hello|哈囉/.test(text)) return '您好，我是 Hermes，德新行政管理平台的 AI 主管助理。我可以即時回報全棟狀況、協助派工、推播 LINE、並接受您的對話訓練。請問需要什麼協助？';
  if (/佇列|待研判|幾件|多少件|待處理|回報/.test(text) && FM.loadReports) {
    const pend = FM.loadReports().filter(r => r.status === 'new' || r.status === 'returned');
    if (!pend.length) return '目前待研判佇列已清空，低風險案件我已自動派工。如需檢視全部回報，可至「同仁回報·接收端」。';
    let r = `目前待研判 ${pend.length} 件需您裁決：\n`;
    pend.slice(0,3).forEach(p => { const t = FM.hermesTriage(p); r += `• ${p.id}（${p.loc}）→ 我建議派 ${t.team}、${t.severity}${t.reclass?'、建議改類':''}\n`; });
    r += '請至「📥 待研判佇列」分頁逐件 採納／調整／退回。';
    return r;
  }
  return '我已收到您的指示。我可以協助：① 回報即時告警與狀況 ② 一鍵推播 LINE 群組 ③ 派工建議 ④ 能耗/人員分析 ⑤ 待研判佇列裁決 ⑥ 接受您的對話訓練。請問要從哪一項開始？';
};

/* Hermes 對「同仁回報」的初步研判（AI 初判 → 提供 human 決策） */
FM.hermesTriage = function(rep) {
  const d = rep.desc || '';
  const teamMap = { clean:'清潔組', fix:'工務組', sec:'保全組', hvac:'機電組', power:'機電組', water:'工務組', it:'資訊組', med:'醫工組', supply:'總務組', env:'感管組', safe:'安全組', fire:'消防權責', other:'總務組' };
  const sopMap = {
    hvac:['確認區域與設定溫度、回報時段','調閱空調模組稼動/水溫狀態','派機電到場調整或檢修','確認改善後回報並結案'],
    power:['確認跳電/燈具範圍與是否影響醫療設備','檢查迴路電表與是否過載','派機電復電/換修，必要時切換 UPS','確認供電穩定後結案'],
    water:['立即關閉相關水閥、鋪設防滑吸水避免擴大','派工務檢查漏點與排水','修復並確認無滲漏','清潔復原後結案'],
    clean:['確認污染/清潔範圍與是否影響感染管制','派清潔組到場處理','感管區依規範消毒','確認環境恢復後結案'],
    sec:['確認安全狀況、是否需現場警戒','通知保全值班/巡邏機動到場','排除狀況、必要時調閱影像','記錄並結案'],
    it:['確認受影響系統/設備與是否影響掛號診療','資訊組遠端或到場排除','確認系統恢復','結案並記錄'],
    med:['確認儀器型號與故障狀況、是否影響治療','停用並掛維修標示','通知醫工組/原廠','校正/維修確認後恢復使用'],
    fire:['確認是否為實際火警或設備異常','如實際火警→立即啟動疏散+119','設備異常→通知消防權責檢修','回報並結案'],
    safe:['確認風險點與是否已有人員受影響','現場警戒/隔離','派工務改善（防滑/修繕/標示）','確認安全後結案'],
    supply:['確認缺料品項與安全存量','總務調撥或建請採購','補貨上架','更新庫存後結案'],
    env:['確認污染源與感染管制等級','感管/清潔依規範處理','必要時隔離區域','確認後結案'],
    other:['確認需求與權責歸屬','指派對應組別','處理','回覆同仁並結案'],
  };
  // 安全關鍵字 → 升級緊急
  const critWords = ['漏電','觸電','火','煙','焦味','跌倒','受傷','骨折','淹水','大量','停電','瓦斯','暈倒','流血','滑倒'];
  const hitCrit = critWords.filter(w => d.includes(w));
  // 類別重判（描述與所選類別不符時建議改類）
  let reclass = null, reclassReason = '';
  if (/漏水|滲水|積水|馬桶|阻塞/.test(d) && rep.cat !== 'water') { reclass='water'; reclassReason='描述提及漏水/排水'; }
  else if (/跳電|沒電|斷電|插座|燈不亮|燈管/.test(d) && rep.cat !== 'power') { reclass='power'; reclassReason='描述提及電力/照明'; }
  else if (/網路|系統|當機|電腦|印表|連不上/.test(d) && rep.cat !== 'it') { reclass='it'; reclassReason='描述提及資訊/網路'; }
  else if (/儀器|機器|超音波|震波|雷射|校正/.test(d) && rep.cat !== 'med') { reclass='med'; reclassReason='描述提及醫療儀器'; }
  const finalCat = reclass || rep.cat;
  const severity = (rep.urgent || hitCrit.length) ? '緊急' : '一般';
  const team = teamMap[finalCat] || rep.assignee || '總務組';
  // 對應聯絡（群組）
  const teamToGroup = { '機電組':'德新工務', '工務組':'德新工務', '保全組':'保全', '清潔組':'德新總務', '總務組':'德新總務' };
  const contact = (FM.contacts || []).find(c => c.group === (teamToGroup[team] || '德新 FM')) || (FM.contacts||[])[0];
  const sla = severity === '緊急' ? '30 分鐘內到場' : '當班 4 小時內處理';
  const pushTargets = severity === '緊急' ? ['mgr','eng','unit'] : ['eng','unit'];
  const risk = hitCrit.length
    ? '⚠️ 含人身安全/設施風險字眼（' + hitCrit.join('、') + '）：建議同步聯繫保全/急救並現場警戒'
    : (severity === '緊急' ? '影響營運/體驗，建議優先處理' : '一般狀況，可依排程處理');
  // 自動分流資格：一般等級、無安全字眼、無改類、屬低風險例行類別 → Hermes 可自動派工，不需人工
  const AUTO_CATS = ['it','supply','clean','env'];
  const autoEligible = severity === '一般' && hitCrit.length === 0 && !reclass && AUTO_CATS.includes(finalCat);
  const autoReason = autoEligible ? '低風險例行（' + team + '）' : (severity === '緊急' ? '緊急·需人工' : reclass ? '建議改類·需人工確認' : '需人工確認');
  return {
    severity, reclass, reclassReason, finalCat, team, contact,
    sop: sopMap[finalCat] || sopMap.other, sla, pushTargets, risk,
    recommend: `派【${team}】處理，時限「${sla}」` + (severity === '緊急' ? '，並即時推播 LINE 主管群' : ''),
    confidence: reclass ? '中（建議改類後派工）' : '高',
    autoEligible, autoReason,
  };
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4e. 同仁回報資料層 + 決策（接收端 / 主管台共用；含 Hermes 自動分流）        */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.REPORT_KEY = 'fm_staff_reports';
FM._reportMem = null;
FM._seedTime = null;
FM.reportSeed = function() {
  // 首次調用定 seed time，後續保持一致
  if (!FM._seedTime) FM._seedTime = Date.now();
  const now = FM._seedTime;
  return [
    { id:'RPT-2041', cat:'hvac', loc:'C 運動訓練', urgent:true, desc:'運動訓練區下午悶熱，冷氣似乎不夠冷', by:'黃運醫師', device:'SEED', source:'staff-app', time:now-5400000, status:'doing', assignee:'機電組 王工', tl:[['同仁回報',now-5400000],['受理派工',now-4800000],['機電組到場檢查',now-1800000]] },
    { id:'RPT-2040', cat:'clean', loc:'E 輔助設施', urgent:false, desc:'女更衣室地面濕滑、垃圾桶已滿', by:'陳護理師', device:'SEED', source:'staff-app', time:now-9000000, status:'done', assignee:'清潔組 劉姐', tl:[['同仁回報',now-9000000],['受理',now-8400000],['完成清潔',now-7200000]] },
    { id:'RPT-2039', cat:'it', loc:'A 接待門診', urgent:false, desc:'櫃台報到系統偶爾卡頓、列印不出收據', by:'吳櫃台', device:'SEED', source:'staff-app', time:now-86400000, status:'new', assignee:'資訊組', tl:[['同仁回報',now-86400000],['自動派 資訊組',now-86400000]] },
  ];
};
FM.loadReports = function() {
  try { const raw = localStorage.getItem(FM.REPORT_KEY); if (raw === null) { const s = FM.reportSeed(); localStorage.setItem(FM.REPORT_KEY, JSON.stringify(s)); return s; } return JSON.parse(raw); }
  catch(e) { if (!FM._reportMem) FM._reportMem = FM.reportSeed(); return FM._reportMem; }
};
FM.saveReports = function(arr) { try { localStorage.setItem(FM.REPORT_KEY, JSON.stringify(arr)); } catch(e) { FM._reportMem = arr; } };
FM.autoMode = true;
// Hermes 自動分流：把低風險 new 回報自動派工，回傳處理筆數
FM.reportAutoProcess = function() {
  if (!FM.autoMode) return 0;
  const arr = FM.loadReports(); let n = 0;
  arr.forEach(r => {
    if (r.status === 'new') {
      const t = FM.hermesTriage(r);
      if (t.autoEligible) {
        r.status = 'doing'; r.assignee = t.team; r.autoBy = 'hermes';
        r.tl.push(['🤖 Hermes 自動派工（' + t.autoReason + '）→ ' + t.team, Date.now()]);
        FM.pushLine(t.pushTargets, '🤖 自動派工 ' + r.id + '\n' + r.loc + '｜' + r.desc + '\n權責：' + t.team + '（' + t.sla + '）', 'info', true);
        n++;
      }
    }
  });
  if (n) FM.saveReports(arr);
  return n;
};
FM.reportTake = function(id) {
  const arr = FM.loadReports(); const r = arr.find(x => x.id === id); if (!r) return null;
  const t = FM.hermesTriage(r);
  r.status = 'doing'; r.assignee = t.team; if (t.reclass) r.cat = t.finalCat;
  r.tl.push(['主管採納 Hermes 研判（' + t.severity + '）→ 派 ' + t.team, Date.now()]);
  FM.pushLine(t.pushTargets, (t.severity === '緊急' ? '🔴緊急' : '🟠') + '派工 ' + id + '\n' + r.loc + '｜' + r.desc + '\n權責：' + t.team + '（' + t.sla + '）', t.severity === '緊急' ? 'crit' : 'warn');
  FM.saveReports(arr); return t;
};
FM.reportAdjust = function(id, team) {
  const arr = FM.loadReports(); const r = arr.find(x => x.id === id); if (!r) return;
  const t = FM.hermesTriage(r);
  r.status = 'doing'; r.assignee = team || t.team;
  r.tl.push(['主管調整後派工 → ' + r.assignee, Date.now()]);
  FM.pushLine(t.pushTargets, '派工 ' + id + '（主管調整）\n' + r.loc + '｜' + r.desc + '\n權責：' + r.assignee, t.severity === '緊急' ? 'crit' : 'warn');
  FM.saveReports(arr);
};
FM.reportReject = function(id, reason) {
  const arr = FM.loadReports(); const r = arr.find(x => x.id === id); if (!r) return;
  r.status = 'returned'; r.tl.push(['主管退回：' + (reason || '需補件'), Date.now()]);
  FM.pushLine(['unit'], '↩️ 回報 ' + id + ' 已退回\n原因：' + (reason || '需補件'), 'info');
  FM.saveReports(arr);
};
FM.reportComplete = function(id) {
  const arr = FM.loadReports(); const r = arr.find(x => x.id === id); if (!r) return;
  r.status = 'done'; r.tl.push(['處理完成、結案', Date.now()]);
  FM.pushLine(['unit'], '✅ 回報 ' + id + ' 已處理完成並結案', 'info');
  FM.saveReports(arr);
};

FM.renderAgentDock = function() {
  const old = document.getElementById('hermes-dock'); if (old) old.remove();
  const oldBtn = document.getElementById('hermes-fab'); if (oldBtn) oldBtn.remove();
  if (FM.hermesHistory.length === 0) {
    FM.hermesHistory.push({ role: 'agent', id: 'h0', text: '您好，我是 Hermes AI 主管助理。輸入「目前狀況」可即時回報全棟告警；輸入「推播」可將狀況送到 LINE 群組。' });
  }
  // 浮動按鈕
  const fab = document.createElement('button');
  fab.id = 'hermes-fab';
  fab.innerHTML = '🤖';
  fab.title = 'Hermes AI 主管台';
  fab.style.cssText = 'position:fixed;right:22px;bottom:22px;width:56px;height:56px;border-radius:50%;border:none;background:linear-gradient(135deg,#0054A7,#008CD6);color:#fff;font-size:26px;cursor:pointer;box-shadow:0 6px 20px rgba(0,60,140,.4);z-index:9998;';
  fab.onclick = FM.toggleAgentDock;
  document.body.appendChild(fab);
  // 對話面板
  const dock = document.createElement('div');
  dock.id = 'hermes-dock';
  dock.style.cssText = 'position:fixed;right:22px;bottom:88px;width:360px;max-width:calc(100vw - 44px);height:520px;max-height:calc(100vh - 130px);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);z-index:9998;display:none;flex-direction:column;overflow:hidden;border:1px solid #e0e0e0;';
  dock.innerHTML = `
    <div style="background:linear-gradient(135deg,#0054A7,#008CD6);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:22px;">🤖</span>
      <div style="flex:1;"><div style="font-weight:700;">Hermes AI 主管台</div><div style="font-size:11px;opacity:.85;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#3DF;"></span> 在線 · 可對話/管理/訓練</div></div>
      <button onclick="FM.toggleAgentDock()" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;">×</button>
    </div>
    <div id="hermes-msgs" style="flex:1;overflow-y:auto;padding:14px;background:#f6f8fb;"></div>
    <div style="padding:10px;border-top:1px solid #eee;display:flex;gap:8px;">
      <input id="hermes-input" placeholder="輸入指示，或「目前狀況」「推播」「訓練」…" style="flex:1;border:1px solid #ddd;border-radius:20px;padding:9px 14px;font-size:13px;outline:none;" onkeydown="if(event.key==='Enter')FM.hermesSend()">
      <button onclick="FM.hermesSend()" style="background:#0054A7;color:#fff;border:none;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:16px;">➤</button>
    </div>
  `;
  document.body.appendChild(dock);
  FM.renderHermesMsgs();
};

FM.toggleAgentDock = function() {
  const d = document.getElementById('hermes-dock');
  if (d) { d.style.display = d.style.display === 'flex' ? 'none' : 'flex'; if (d.style.display === 'flex') FM.renderHermesMsgs(); }
};

FM.renderHermesMsgs = function() {
  const box = document.getElementById('hermes-msgs'); if (!box) return;
  box.innerHTML = FM.hermesHistory.map(m => {
    if (m.role === 'user') {
      return `<div style="text-align:right;margin-bottom:10px;"><span style="display:inline-block;background:#0054A7;color:#fff;padding:8px 12px;border-radius:14px 14px 2px 14px;font-size:13px;max-width:80%;text-align:left;white-space:pre-line;">${m.text}</span></div>`;
    }
    return `<div style="margin-bottom:10px;">
      <span style="display:inline-block;background:#fff;border:1px solid #e3e8ef;padding:8px 12px;border-radius:14px 14px 14px 2px;font-size:13px;max-width:85%;white-space:pre-line;box-shadow:0 1px 2px rgba(0,0,0,.04);">${m.text}</span>
      <div style="font-size:11px;color:#aaa;margin-top:3px;">
        <span style="cursor:pointer;" onclick="FM.hermesFeedback('${m.id}',1)" title="有幫助">👍</span>
        <span style="cursor:pointer;margin-left:6px;" onclick="FM.hermesFeedback('${m.id}',0)" title="不正確">👎</span>
        <span style="cursor:pointer;margin-left:6px;color:#0054A7;" onclick="FM.hermesTrain('${m.id}')" title="提供正確答覆以訓練">✎ 修正</span>
      </div>
    </div>`;
  }).join('');
  box.scrollTop = box.scrollHeight;
};

FM.hermesSend = function() {
  const inp = document.getElementById('hermes-input'); if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim(); inp.value = '';
  FM.hermesHistory.push({ role: 'user', id: 'u' + Date.now(), text });
  const reply = FM.hermesReply(text);
  FM.hermesHistory.push({ role: 'agent', id: 'a' + Date.now(), text: reply });
  FM.renderHermesMsgs();
};

FM.hermesFeedback = function(id, val) {
  FM.hermesTraining.push({ id, type: 'rating', value: val, time: new Date() });
  FM.toast(val ? '已記錄正向回饋（用於微調）' : '已記錄修正需求，請用「✎ 修正」提供正確答覆', val ? 'ok' : 'warn');
};

FM.hermesTrain = function(id) {
  const correct = window.prompt('請輸入此情境下「正確的回覆／SOP」，Hermes 將記錄並用於後續訓練：');
  if (correct && correct.trim()) {
    FM.hermesTraining.push({ id, type: 'correction', value: correct.trim(), time: new Date() });
    FM.hermesHistory.push({ role: 'agent', id: 'a' + Date.now(), text: '✓ 已記錄您的修正，並納入訓練集。下次遇到相似情境我會依此回覆。' });
    FM.renderHermesMsgs();
    FM.toast('訓練樣本已記錄', 'ok');
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 5. SVG 圖表 Helper                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

// 柱狀圖：FM.svgBar(data, opts)
// data: [{label, value}, ...]
// opts: {width, height, maxValue, color, animate}
FM.svgBar = function(data, opts = {}) {
  const width = opts.width || 400;
  const height = opts.height || 200;
  const maxValue = opts.maxValue || Math.max(...data.map(d => d.value));
  const color = opts.color || '#008CD6';
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // 背景
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;

  // 坐標軸
  svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#ddd" stroke-width="1"/>`;
  svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#ddd" stroke-width="1"/>`;

  const barWidth = chartWidth / data.length / 1.5;
  const barSpacing = chartWidth / data.length;

  // 柱子
  data.forEach((item, i) => {
    const x = padding + i * barSpacing + barSpacing / 4;
    const barHeight = (item.value / maxValue) * chartHeight;
    const y = height - padding - barHeight;

    svg += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}"
            style="animation: slideUp 0.5s ease-out;" />
      <text x="${x + barWidth / 2}" y="${height - padding + 20}" text-anchor="middle"
            font-size="12" fill="#333">${item.label}</text>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle"
            font-size="11" fill="#666" font-weight="bold">${item.value}</text>
    `;
  });

  svg += '</svg>';

  // 加入動畫樣式
  svg = `<style>
    @keyframes slideUp {
      from { height: 0; y: ${height - padding}; }
      to { height: auto; }
    }
  </style>` + svg;

  return svg;
};

// 甜甜圈圖：FM.svgDonut(segments)
// segments: [{label, value, color}, ...]
FM.svgDonut = function(segments) {
  const size = 200;
  const radius = 80;
  const innerRadius = 50;
  const cx = size / 2;
  const cy = size / 2;

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#f0f0f0" stroke-width="${radius - innerRadius}"/>`;

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let currentAngle = -90;

  segments.forEach(seg => {
    const sliceAngle = (seg.value / total) * 360;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const x1i = cx + innerRadius * Math.cos(startAngle);
    const y1i = cy + innerRadius * Math.sin(startAngle);
    const x2i = cx + innerRadius * Math.cos(endAngle);
    const y2i = cy + innerRadius * Math.sin(endAngle);

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x2i} ${y2i}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1i} ${y1i}
      Z
    `;

    svg += `<path d="${path}" fill="${seg.color}" stroke="white" stroke-width="1"/>`;

    // 標籤
    const labelAngle = (currentAngle + sliceAngle / 2) * Math.PI / 180;
    const labelRadius = (radius + innerRadius) / 2;
    const lx = cx + labelRadius * Math.cos(labelAngle);
    const ly = cy + labelRadius * Math.sin(labelAngle);
    const pct = ((seg.value / total) * 100).toFixed(0);

    svg += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="12" fill="white" font-weight="bold">${pct}%</text>`;

    currentAngle += sliceAngle;
  });

  svg += '</svg>';
  return svg;
};

// 折線圖：FM.svgLine(series)
// series: [{label, data: [values], color}, ...]
FM.svgLine = function(series) {
  const width = 400;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = series[0].data.length;
  const maxValue = Math.max(...series.flatMap(s => s.data));
  const xStep = chartWidth / (points - 1);

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;

  // 坐標軸
  svg += `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#ddd"/>`;
  svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#ddd"/>`;

  // 每條線
  series.forEach(s => {
    let pathD = '';
    s.data.forEach((val, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (val / maxValue) * chartHeight;
      pathD += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    });

    svg += `<path d="${pathD}" stroke="${s.color || '#008CD6'}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  });

  svg += '</svg>';
  return svg;
};

// 迷你線圖：FM.sparkline(values)
// values: [v1, v2, v3, ...]
FM.sparkline = function(values) {
  const width = 100;
  const height = 30;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const pointWidth = width / (values.length - 1 || 1);
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  let pathD = '';
  values.forEach((val, i) => {
    const x = i * pointWidth;
    const normalized = (val - minValue) / range;
    const y = height - normalized * (height - 4) - 2;
    pathD += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
  });

  svg += `<path d="${pathD}" stroke="#008CD6" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  svg += `<polyline points="${pathD}" fill="url(#grad)" opacity="0.3"/>`;
  svg += `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:#008CD6;stop-opacity:0.5" />
    <stop offset="100%" style="stop-color:#008CD6;stop-opacity:0" />
  </linearGradient></defs>`;
  svg += '</svg>';

  return svg;
};

// 儀表盤：FM.gauge(pct)
// pct: 0-100
FM.gauge = function(pct) {
  const size = 120;
  const radius = 40;
  const cx = size / 2;
  const cy = size / 2;

  // 角度：-135 到 135（270度範圍）
  const startAngle = -135;
  const endAngle = 135;
  const range = endAngle - startAngle;
  const currentAngle = startAngle + (pct / 100) * range;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const currentRad = (currentAngle * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const xc = cx + radius * Math.cos(currentRad);
  const yc = cy + radius * Math.sin(currentRad);

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;

  // 底圈
  svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e0e0e0" stroke-width="8"/>`;

  // 進度弧
  const largeArc = (pct > 50) ? 1 : 0;
  const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${xc} ${yc}`;
  const color = pct > 80 ? '#C0392B' : pct > 50 ? '#D35400' : '#1A7A4A';
  svg += `<path d="${path}" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"/>`;

  // 中心數字
  svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="bold" fill="#333">${pct}%</text>`;

  svg += '</svg>';
  return svg;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 6. 狀態與格式化 Helper                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

// 狀態徽章：FM.statusBadge(level)
// level: 'ok', 'warn', 'crit', 'info'
// 回傳帶有動畫點綴與標籤的 HTML span
FM.statusBadge = function(level) {
  const labelMap = { ok: '正常', warn: '警告', crit: '緊急', info: '資訊' };
  const colorMap = { ok: '#00A94F', warn: '#F18F01', crit: '#C0392B', info: '#008CD6' };
  const label = labelMap[level] || level;
  const color = colorMap[level] || '#999';
  return `<span class="badge ${level}" style="border-left: 3px solid ${color};"><span class="dot" style="background-color: ${color};"></span>${label}</span>`;
};

// 空間標籤：FM.spaceTag(code)
// 接收空間碼（如 '7-A1-PWR-01'），回傳帶顏色徽章的 span HTML
FM.spaceTag = function(code) {
  const parsed = FM.spaces.parseCode(code);
  if (!parsed) {
    return `<span class="space-tag" title="無效空間碼">📍 ${code}</span>`;
  }

  const subsysInfo = FM.spaces.subsystems[parsed.subsystem];
  const subsysColor = subsysInfo ? subsysInfo.color : '#999';
  const areaName = FM.spaces.areas[parsed.area]?.name || '未知';
  const roomName = FM.spaces.rooms[parsed.area]?.[parsed.room] || '未知房間';

  return `<span class="space-tag" style="background-color: ${subsysColor}20; border-left: 3px solid ${subsysColor};" title="${areaName}-${roomName}">
    📍 ${code}
  </span>`;
};

// 數字格式化：FM.fmtNum(n)
FM.fmtNum = function(n) {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M';
  } else if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }
  return n.toString();
};

// 相對時間：FM.timeAgo(timestamp)
FM.timeAgo = function(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '剛才';
  if (diffMins < 60) return `${diffMins}分鐘前`;
  if (diffHours < 24) return `${diffHours}小時前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-TW');
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 7. 模態框控制（增強版、含確認對話）                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

FM.showModal = function(title, content, buttons) {
  let modal = document.getElementById('fm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'fm-modal';
    document.body.appendChild(modal);
  }
  modal.className = 'modal open';

  let buttonsHtml = '';
  if (buttons) {
    buttons.forEach(btn => {
      const btnType = btn.type || 'primary';
      buttonsHtml += `<button class="btn btn-${btnType}" onclick="${btn.onclick}">${btn.label}</button>`;
    });
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="FM.closeModal()">×</button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
        ${buttonsHtml}
      </div>
    </div>
  `;
};

FM.closeModal = function() {
  const modal = document.getElementById('fm-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => { modal.innerHTML = ''; }, 300);
  }
};

// 確認告警狀態（單參數版本，用於派工確認）
FM.confirmAlert = function(alertId) {
  const alert = FM.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.confirmed = true;
  }
};

// 確認對話框：FM.showConfirmDialog(title, message, onConfirm, onCancel)
FM.showConfirmDialog = function(title, message, onConfirm, onCancel) {
  const confirmBtn = {
    label: '確認',
    type: 'primary',
    onclick: `(function() { FM.closeModal(); if(typeof ${onConfirm} === 'function') ${onConfirm}(); })()`
  };
  const cancelBtn = {
    label: '取消',
    type: 'secondary',
    onclick: `(function() { FM.closeModal(); if(typeof ${onCancel} === 'function') ${onCancel}(); })()`
  };

  FM.showModal(title, message, [cancelBtn, confirmBtn]);
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 8. 通用工具函式（8 個 Helper 完整實裝）                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

// [Helper 1] 取得特定系統的告警
FM.getAlertsForSystem = function(systemCode) {
  return FM.alerts.filter(a => a.system === systemCode);
};

// [Helper 2] 相對時間格式（已於第 6 段實裝）- 略

// [Helper 3] 狀態徽章（已於第 6 段實裝）- 略

// [Helper 4] 空間標籤（已於第 6 段實裝，增強版含區域/房間 tooltip）- 略

// [Helper 5] 生成表格
FM.createTable = function(columns, rows, options = {}) {
  let html = '<table class="dtable">';

  // 表頭
  html += '<thead><tr>';
  columns.forEach(col => {
    html += `<th>${col}</th>`;
  });
  html += '</tr></thead>';

  // 表身
  html += '<tbody>';
  rows.forEach((row, idx) => {
    const isAlert = options.alertRows && options.alertRows.includes(idx);
    const rowClass = isAlert ? 'alert-row' : '';
    html += `<tr class="${rowClass}">`;
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';

  html += '</table>';
  return html;
};

// [Helper 6] 顯示模態框（已於第 7 段實裝增強版）- 略

// [Helper 7] 確認對話框（已於第 7 段實裝）- 略

// [Helper 8] 關閉模態框（已於第 7 段實裝）- 略

// 取得特定空間的告警
FM.getAlertsForSpace = function(spaceCode) {
  return FM.alerts.filter(a => a.space === spaceCode);
};

// 統計告警數量
FM.getAlertStats = function() {
  return {
    total: FM.alerts.length,
    crit: FM.alerts.filter(a => a.level === 'crit').length,
    warn: FM.alerts.filter(a => a.level === 'warn').length,
    info: FM.alerts.filter(a => a.level === 'info').length,
    unconfirmed: FM.alerts.filter(a => !a.confirmed).length
  };
};

// 標記告警為已確認
FM.markAlertConfirmed = function(alertId) {
  const alert = FM.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.confirmed = true;
    return true;
  }
  return false;
};

// 載入內容到主區域
FM.loadContent = function(htmlContent) {
  const container = document.getElementById('fm-content');
  if (container) {
    container.innerHTML = htmlContent;
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9. Mock 資料集合                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

FM.mockData = {
  // 各系統運行統計
  systemStats: {
    PWR: { running: 98.5, alerts: 2 },
    HVAC: { running: 96.2, alerts: 1 },
    AIR: { running: 99.1, alerts: 0 },
    FIRE: { running: 100, alerts: 0 },
    WTR: { running: 94.8, alerts: 1 },
    AST: { running: 97.3, alerts: 0 },
    SUP: { running: 95.6, alerts: 0 },
    ACC: { running: 99.8, alerts: 1 },
    CLN: { running: 96.5, alerts: 0 },
    SCH: { running: 98.9, alerts: 0 },
    DSP: { running: 97.2, alerts: 1 },
    CCTV: { running: 96.8, alerts: 2 },
    SEC: { running: 99.0, alerts: 0 },
    STF: { running: 98.2, alerts: 1 },
    RPT: { running: 100, alerts: 0 },
    VND: { running: 97.0, alerts: 1 }
  },

  // 每日告警趨勢
  dailyAlerts: [
    { date: '6/1', crit: 2, warn: 5, info: 8 },
    { date: '6/2', crit: 1, warn: 3, info: 6 },
    { date: '6/3', crit: 3, warn: 7, info: 12 },
    { date: '6/4', crit: 2, warn: 4, info: 9 },
    { date: '6/5', crit: 4, warn: 6, info: 10 }
  ],

  // 區域利用率
  areaUtilization: [
    { label: '接待門診', value: 78 },
    { label: '物理治療', value: 65 },
    { label: '運動訓練', value: 82 },
    { label: '後勤行政', value: 45 },
    { label: '輔助設施', value: 38 }
  ]
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9b. 7樓平面圖資料層 — FM.floorZones （空品 / 稼動 / 溫濕度）                */
/* ─────────────────────────────────────────────────────────────────────────── */

FM.floorZones = {
  'A': {
    name: '接待門診',
    abbr: 'Reception',
    air: { co2: 650, pm25: 28, tvoc: 0.45 },
    env: { temp: 23.2, rh: 55 },
    utilization: 92,
    alerts: 0,
    online: 8
  },
  'B': {
    name: '物理治療',
    abbr: 'PT',
    air: { co2: 720, pm25: 32, tvoc: 0.52 },
    env: { temp: 22.8, rh: 52 },
    utilization: 87,
    alerts: 1,
    online: 12
  },
  'C': {
    name: '運動訓練',
    abbr: 'Training',
    air: { co2: 950, pm25: 48, tvoc: 0.78 },
    env: { temp: 24.1, rh: 58 },
    utilization: 94,
    alerts: 1,
    online: 24
  },
  'D': {
    name: '後勤行政',
    abbr: 'Admin',
    air: { co2: 580, pm25: 22, tvoc: 0.38 },
    env: { temp: 23.5, rh: 50 },
    utilization: 88,
    alerts: 0,
    online: 6
  },
  'E': {
    name: '輔助(更衣淋浴)',
    abbr: 'Support',
    air: { co2: 610, pm25: 25, tvoc: 0.42 },
    env: { temp: 23.0, rh: 53 },
    utilization: 76,
    alerts: 1,
    online: 9
  }
};

FM.floorState = {
  currentLayer: 'air'
};

FM.airLevel = function(co2, pm25, tvoc) {
  if (co2 > 800 || pm25 > 50 || tvoc > 0.7) return 'crit';
  if (co2 > 700 || pm25 > 35 || tvoc > 0.6) return 'warn';
  return 'ok';
};

// 深色戰情主視覺色盤（霓虹）：crit 一律 #FF5252（觸發脈動）
FM.zoneColor = function(zoneKey, layerType) {
  const zone = this.floorZones[zoneKey];
  if (!zone) return '#7F8C9B';

  const colors = {
    ok: '#00E676',
    good: '#66BB6A',
    warn: '#FFC107',
    crit: '#FF5252',
    cold: '#26C6DA',
    comfort: '#42A5F5'
  };

  switch (layerType) {
    case 'air':
      const airLvl = this.airLevel(zone.air.co2, zone.air.pm25, zone.air.tvoc);
      return airLvl === 'ok' ? colors.ok : airLvl === 'warn' ? colors.warn : colors.crit;

    case 'util':
      return zone.utilization >= 90 ? colors.ok
           : zone.utilization >= 80 ? colors.good
           : zone.utilization >= 70 ? colors.warn
           : colors.crit;

    case 'temp':
      return zone.env.temp < 22 ? colors.cold
           : zone.env.temp <= 24 ? colors.comfort
           : zone.env.temp <= 26 ? colors.warn
           : colors.crit;

    case 'alert':
      return zone.alerts === 0 ? colors.ok
           : zone.alerts <= 2 ? colors.warn
           : colors.crit;

    case 'people':
      return zone.online >= 20 ? colors.crit
           : zone.online >= 12 ? colors.warn
           : zone.online >= 6 ? colors.ok
           : colors.cold;

    default:
      return colors.ok;
  }
};

FM.switchFloorLayer = function(layerKey) {
  this.floorState.currentLayer = layerKey;
  this.updateFloorDiagram();
};

// 戰情圖層自動輪播（空品→稼動→溫度→告警→人流 循環）
FM.layerRotation = { timer: null, order: ['air', 'util', 'temp', 'alert', 'people'], intervalMs: 5000 };
FM.startLayerRotation = function() {
  if (FM.layerRotation.timer || typeof setInterval !== 'function') return;
  FM.layerRotation.timer = setInterval(function() {
    const ord = FM.layerRotation.order;
    const cur = (FM.floorState && FM.floorState.currentLayer) || 'air';
    FM.switchFloorLayer(ord[(ord.indexOf(cur) + 1) % ord.length]);
  }, FM.layerRotation.intervalMs);
};
FM.stopLayerRotation = function() {
  if (FM.layerRotation.timer && typeof clearInterval === 'function') clearInterval(FM.layerRotation.timer);
  FM.layerRotation.timer = null;
};
FM.toggleLayerRotation = function() {
  if (FM.layerRotation.timer) { FM.stopLayerRotation(); return false; }
  FM.startLayerRotation(); return true;
};

FM.updateFloorDiagram = function() {
  const layer = this.floorState.currentLayer;
  ['A', 'B', 'C', 'D', 'E'].forEach(zoneKey => {
    const color = this.zoneColor(zoneKey, layer);
    const isCrit = (color === '#FF5252');

    const rect = document.querySelector(`#zone-${zoneKey}-rect`);
    if (rect) {
      rect.setAttribute('stroke', color);
      if (rect.classList) rect.classList.toggle('zone-pulse', isCrit);
    }
    const bar = document.querySelector(`#zone-${zoneKey}-bar`);
    if (bar) bar.setAttribute('fill', color);
    const dot = document.querySelector(`#zone-${zoneKey}-dot`);
    if (dot) dot.setAttribute('fill', color);
  });

  const buttons = document.querySelectorAll('.war-layer-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-layer') === layer);
  });

  FM.updateLegend(layer);
};

// KPI 戰情帶數字跳動（純前端動畫）
FM.animateKpis = function() {
  const els = document.querySelectorAll('.war-kpi-num');
  els.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const dec = el.getAttribute('data-dec') === '1';
    const dur = 900;
    let startTs = null;
    const fmt = v => dec ? v.toFixed(1) : String(Math.round(v));
    function step(ts) {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * ease);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step);
    else el.textContent = fmt(target);
  });
};

FM.updateLegend = function(layerType) {
  const legendBox = document.getElementById('floor-legend-content');
  if (!legendBox) return;

  let legendHtml = '';
  switch (layerType) {
    case 'air':
      legendHtml = `
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #1A7A4A;"></span>
          <span style="font-size: 12px;">正常 (CO₂≤700, PM25≤35)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #D35400;"></span>
          <span style="font-size: 12px;">警告 (CO₂≤800, PM25≤50)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #C0392B;"></span>
          <span style="font-size: 12px;">異常 (CO₂>800 或 PM25>50)</span>
        </span>
      `;
      break;
    case 'util':
      legendHtml = `
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #1A7A4A;"></span>
          <span style="font-size: 12px;">優秀 (≥90%)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #00A94F;"></span>
          <span style="font-size: 12px;">良好 (80-90%)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #D35400;"></span>
          <span style="font-size: 12px;">預警 (70-80%)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #C0392B;"></span>
          <span style="font-size: 12px;">低迷 (<70%)</span>
        </span>
      `;
      break;
    case 'temp':
      legendHtml = `
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #1B998B;"></span>
          <span style="font-size: 12px;">冷 (<22°C)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #0054A7;"></span>
          <span style="font-size: 12px;">舒適 (22-24°C)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #D35400;"></span>
          <span style="font-size: 12px;">溫暖 (24-26°C)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #C0392B;"></span>
          <span style="font-size: 12px;">過熱 (>26°C)</span>
        </span>
      `;
      break;
    case 'alert':
      legendHtml = `
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #00E676;"></span>
          <span style="font-size: 12px;">無告警 (0件)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #FFC107;"></span>
          <span style="font-size: 12px;">低級 (1-2件)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #FF5252;"></span>
          <span style="font-size: 12px;">高級 (≥3件)</span>
        </span>
      `;
      break;
    case 'people':
      legendHtml = `
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #26C6DA;"></span>
          <span style="font-size: 12px;">清閒 (<6人)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #00E676;"></span>
          <span style="font-size: 12px;">正常 (6-11人)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px; margin-right: 16px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #FFC107;"></span>
          <span style="font-size: 12px;">偏多 (12-19人)</span>
        </span>
        <span style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #FF5252;"></span>
          <span style="font-size: 12px;">壅擠 (≥20人)</span>
        </span>
      `;
      break;
  }
  legendBox.innerHTML = legendHtml;
};

FM.showZoneDetail = function(zoneKey) {
  const zone = FM.floorZones[zoneKey];
  if (!zone) return;

  const airLvl = FM.airLevel(zone.air.co2, zone.air.pm25, zone.air.tvoc);
  const airLvlText = airLvl === 'ok' ? '正常' : airLvl === 'warn' ? '警告' : '異常';
  const airColor = airLvl === 'ok' ? '#1A7A4A' : airLvl === 'warn' ? '#D35400' : '#C0392B';

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
        <span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background: ${airColor};"></span>
        <span style="font-size: 14px; font-weight: bold; color: ${airColor};">空品狀態：${airLvlText}</span>
      </div>

      <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">空氣品質指標</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><span style="color: #666;">CO₂</span><div style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.air.co2} ppm</div></div>
          <div><span style="color: #666;">PM2.5</span><div style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.air.pm25} μg/m³</div></div>
          <div><span style="color: #666;">TVOC</span><div style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.air.tvoc} mg/m³</div></div>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">環境參數</div>
        <div style="display: flex; gap: 16px;">
          <div><span style="color: #666;">溫度</span><div style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.env.temp}°C</div></div>
          <div><span style="color: #666;">濕度</span><div style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.env.rh}%</div></div>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">稼動狀態</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 14px; font-weight: bold; color: #0054A7;">${zone.utilization}%</span>
          <div style="flex: 1; background: #e8e8e8; height: 6px; border-radius: 3px; overflow: hidden;">
            <div style="background: #1A7A4A; height: 100%; width: ${zone.utilization}%; border-radius: 3px;"></div>
          </div>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 12px; border-radius: 6px;">
        <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">告警數</div>
        <div style="display: inline-block; padding: 6px 12px; background: ${zone.alerts === 0 ? '#E6F7EE' : '#FFF3E0'}; color: ${zone.alerts === 0 ? '#1A7A4A' : '#D35400'}; border-radius: 4px; font-weight: bold;">
          ${zone.alerts} 件
        </div>
      </div>
    </div>
  `;

  FM.showModal(`區域 ${zoneKey} - ${zone.name}`, contentHtml);
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 10. 系統監控輔助函式（支援各模組戰情呈現）                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

// 渲染系統狀態卡（各模組首頁常用）
FM.renderSystemCard = function(systemCode) {
  const subsysInfo = FM.spaces.subsystems[systemCode];
  const stat = FM.mockData.systemStats[systemCode];
  const alerts = FM.getAlertsForSystem(systemCode);
  const critAlerts = alerts.filter(a => a.level === 'crit' && !a.confirmed).length;

  if (!subsysInfo || !stat) return '';

  const statusColor = stat.running >= 95 ? '#00A94F' : stat.running >= 80 ? '#F18F01' : '#C0392B';
  const statusLabel = stat.running >= 95 ? '正常' : stat.running >= 80 ? '降速' : '異常';

  return `
    <div class="system-card" style="border-left: 4px solid ${subsysInfo.color};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3>${subsysInfo.name}</h3>
          <p style="color: #666; font-size: 12px; margin: 4px 0;">${systemCode}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: bold; color: ${statusColor};">${stat.running}%</div>
          <div style="font-size: 11px; color: #999;">${statusLabel}</div>
        </div>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 8px;">
        <span class="badge" style="background-color: #f0f0f0; border-left: 2px solid #666;">
          <span class="dot" style="background-color: #666;"></span>告警 ${stat.alerts}
        </span>
        ${critAlerts > 0 ? `<span class="badge crit"><span class="dot"></span>緊急 ${critAlerts}</span>` : ''}
      </div>
    </div>
  `;
};

// 渲染告警面板
FM.renderAlertPanel = function(systemCode) {
  const alerts = FM.getAlertsForSystem(systemCode);
  if (alerts.length === 0) {
    return '<div style="padding: 20px; text-align: center; color: #999;">無告警</div>';
  }

  let html = '<div class="alert-panel">';
  alerts.forEach(alert => {
    const timeStr = FM.timeAgo(alert.time);
    const levelBadge = FM.statusBadge(alert.level);
    const spaceTag = FM.spaceTag(alert.space);

    html += `
      <div class="alert-item" style="border-left: 3px solid ${alert.level === 'crit' ? '#C0392B' : alert.level === 'warn' ? '#F18F01' : '#008CD6'}; padding: 12px; margin-bottom: 8px; background-color: #f9f9f9; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div>${levelBadge}</div>
          <span style="font-size: 11px; color: #999;">${timeStr}</span>
        </div>
        <div style="margin: 6px 0;">
          <p style="margin: 4px 0; font-weight: 500;">${alert.msg}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${spaceTag}</p>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <strong>建議動作：</strong> ${alert.aiAction}
        </div>
        ${alert.needConfirm && !alert.confirmed ? `
          <button onclick="FM.markAlertConfirmed('${alert.id}'); location.reload();" style="margin-top: 8px; padding: 6px 12px; background-color: #0054A7; color: white; border: none; border-radius: 4px; cursor: pointer;">確認已處理</button>
        ` : ''}
      </div>
    `;
  });
  html += '</div>';
  return html;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9c. HVAC 週期保養（共用）— 逾期/即將到期 自動推進告警＋LINE                  */
/* ─────────────────────────────────────────────────────────────────────────── */
// 改為絕對日期（lastMaintDate）計算，daysSinceLast 於使用時動態計算
FM.hvacMaintenance = [
  { item: '室內機濾網清洗', scope: '全區 VRV 室內機', cycleDays: 30, lastMaintDate: new Date('2026-05-03'), owner: '德新工務', note: '影響風量與能效' },
  { item: '除濕機濾網清潔', scope: 'B/E/D 吊隱式除濕機', cycleDays: 30, lastMaintDate: new Date('2026-05-12'), owner: '德新工務', note: '吊隱式·接空調冷凝排水' },
  { item: '室外機散熱片清潔', scope: '頂樓室外機', cycleDays: 90, lastMaintDate: new Date('2026-04-10'), owner: '空調協力廠', note: '散熱不良將增加耗電' },
  { item: '冷媒壓力檢查', scope: 'VRV 系統', cycleDays: 180, lastMaintDate: new Date('2025-12-23'), owner: '空調協力廠', note: '冷媒不足影響制冷' },
  { item: '冷凝水排水管疏通', scope: '各區排水（含除濕機）', cycleDays: 60, lastMaintDate: new Date('2026-04-27'), owner: '德新工務', note: '阻塞會導致漏水' },
  { item: '冰水主機水質檢測', scope: '冰水迴路 A/B', cycleDays: 90, lastMaintDate: new Date('2026-05-08'), owner: '空調協力廠', note: '水垢影響熱交換' },
  { item: '全熱交換器濾網更換', scope: '新風系統', cycleDays: 180, lastMaintDate: new Date('2026-03-08'), owner: '德新工務', note: '與 AIR 模組連動' },
  { item: '風管/出風口清潔', scope: '全樓風管', cycleDays: 365, lastMaintDate: new Date('2025-11-22'), owner: '空調協力廠', note: '院感防護重點' }
];

FM.maintInfo = function(m) {
  const now = new Date();
  const lastMaint = new Date(m.lastMaintDate);
  const daysSinceLast = Math.floor((now - lastMaint) / 86400000);
  const remain = m.cycleDays - daysSinceLast;
  return { remain, daysSinceLast, level: remain < 0 ? 'overdue' : remain <= 14 ? 'due' : 'ok' };
};

// 將逾期/即將到期保養同步成 FM.alerts 條目（→ 中控戰情 + dispatch 工單 + hvac 告警）
// 每筆唯一 space（7-HVAC-MNTn），避免 dispatch 以 space+system 去重時被併
FM.syncMaintenanceAlerts = function() {
  FM.alerts = FM.alerts.filter(a => a.kind !== 'maintenance');
  FM.hvacMaintenance.forEach((m, i) => {
    const { remain, daysSinceLast, level } = FM.maintInfo(m);
    if (level === 'ok') return;
    const overdue = level === 'overdue';
    FM.alerts.unshift({
      id: 'MNT-' + String(i + 1).padStart(2, '0'),
      level: overdue ? 'warn' : 'info',
      space: '7-HVAC-MNT' + (i + 1),
      time: new Date(Date.now() - (overdue ? Math.abs(remain) : 0) * 86400000),
      system: 'HVAC',
      msg: `[保養${overdue ? '逾期' : '即將到期'}] ${m.item}（${m.scope}）${overdue ? '已逾期 ' + Math.abs(remain) + ' 天' : '剩 ' + remain + ' 天'}（距上次 ${daysSinceLast} 天）`,
      aiAction: '建立派工單 → ' + m.owner + ' 安排保養',
      needConfirm: overdue,
      confirmed: false,
      kind: 'maintenance',
      maintIdx: i
    });
  });
  return FM.alerts;
};

// 逾期/即將到期保養 → LINE 推播（工務群＋主管群）
FM.pushMaintenanceLine = function(silent) {
  const rows = FM.hvacMaintenance.map(m => Object.assign({ m }, FM.maintInfo(m)));
  const overdue = rows.filter(x => x.level === 'overdue');
  const due = rows.filter(x => x.level === 'due');
  if (!overdue.length && !due.length) return null;
  const lines = overdue.map(x => `🔴逾期 ${x.m.item}（${Math.abs(x.remain)}天）`)
    .concat(due.map(x => `🟠將到期 ${x.m.item}（剩${x.remain}天）`));
  return FM.pushLine(['eng', 'mgr'], '【HVAC 保養警示】\n' + lines.join('\n'), overdue.length ? 'warn' : 'info', silent);
};

// 每日最多自動推播一次（避免每次開頁洗版）
FM.autoPushMaintenance = function() {
  let last = null;
  try { last = localStorage.getItem('fm_maint_line_date'); } catch (e) {}
  const today = new Date().toISOString().slice(0, 10);
  if (last === today) return null;
  const r = FM.pushMaintenanceLine(true);  // 自動排程，靜音
  if (r) { try { localStorage.setItem('fm_maint_line_date', today); } catch (e) {} }
  return r;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9d. 操作軌跡 Audit Log（localStorage 持久化）                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.AUDIT_KEY = 'fm_audit_log';
FM.loadAudit = function() {
  try { return JSON.parse(localStorage.getItem(FM.AUDIT_KEY)) || []; } catch (e) { return []; }
};
FM.saveAudit = function(arr) {
  try { localStorage.setItem(FM.AUDIT_KEY, JSON.stringify(arr.slice(0, 200))); } catch (e) {}
};
FM.logAction = function(action, target, detail) {
  const arr = FM.loadAudit();
  arr.unshift({ t: new Date().toISOString(), actor: '操作員', module: 'HVAC', action, target, detail: detail || '' });
  FM.saveAudit(arr);
  return arr;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9e. Hermes 看診前 Status Report — 給院方主管 + 德新物業副總                   */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.statusReportAudience = ['院方主管', '德新物業副總'];

// 昨夜值班 / 保全交接
FM.nightShift = {
  guard: '陳志明',
  shift: '22:00–06:00',
  patrols: 6,
  patrolsPlanned: 6,
  events: [
    { time: '01:20', msg: 'B 區感應燈異常，已復歸' },
    { time: '03:48', msg: '東側逃生門感測誤觸，巡查無異常' }
  ],
  handoverTo: '日班 王志成',
  handoverTime: '08:00',
  status: 'ok'   // ok / warn（交接待確認）
};

// 今日門診排程與稼動預估（依預約量）
FM.todaySchedule = {
  sessions: [
    { name: '上午診', time: '09:00–12:00', booked: 78, capacity: 90 },
    { name: '下午診', time: '14:00–17:00', booked: 65, capacity: 90 },
    { name: '晚診', time: '18:00–21:00', booked: 52, capacity: 80 }
  ]
};
FM.scheduleForecast = function() {
  const s = FM.todaySchedule.sessions.map(x => Object.assign({ est: Math.round(x.booked / x.capacity * 100) }, x));
  const booked = s.reduce((a, x) => a + x.booked, 0);
  const capacity = s.reduce((a, x) => a + x.capacity, 0);
  return { sessions: s, booked, capacity, util: Math.round(booked / capacity * 100) };
};

FM.generateStatusReport = function() {
  const alerts = FM.alerts || [];
  const crit = alerts.filter(a => a.level === 'crit');
  const warn = alerts.filter(a => a.level === 'warn');
  const info = alerts.filter(a => a.level === 'info');
  const unconfirmed = alerts.filter(a => a.needConfirm && !a.confirmed);

  // 子系統紅黃綠燈（依該系統最嚴重告警）— 包含所有 16 個子系統
  const SYS = [['PWR', '電力'], ['HVAC', '空調'], ['AIR', '新風空品'], ['FIRE', '消防'], ['WTR', '給排水'], ['AST', '資產保固'], ['SUP', '耗材布草'], ['ACC', '門禁'], ['CLN', '清潔'], ['SCH', '排程'], ['DSP', '派工'], ['CCTV', '監控'], ['SEC', '保全'], ['STF', '人員'], ['RPT', '回報'], ['VND', '外包']];
  const systems = SYS.map(([code, name]) => {
    const sa = alerts.filter(a => a.system === code);
    const level = sa.some(a => a.level === 'crit') ? 'crit' : sa.some(a => a.level === 'warn') ? 'warn' : 'ok';
    return { code, name, level, count: sa.length };
  });

  // 空品（依 floorZones）
  const zones = Object.keys(FM.floorZones || {}).map(k => Object.assign({ k }, FM.floorZones[k]));
  const airBad = zones.map(z => ({ k: z.k, name: z.name, co2: z.air.co2, level: FM.airLevel(z.air.co2, z.air.pm25, z.air.tvoc) }))
    .filter(z => z.level !== 'ok');
  const online = zones.reduce((s, z) => s + (z.online || 0), 0);

  // 逾期/即將到期保養
  const maint = (FM.hvacMaintenance || []).map((m, i) => Object.assign({ i }, m, FM.maintInfo(m)));
  const overdue = maint.filter(x => x.level === 'overdue');
  const dueSoon = maint.filter(x => x.level === 'due');

  // 就緒度評分
  let score = 100;
  score -= crit.length * 15;
  score -= unconfirmed.length * 8;
  score -= overdue.length * 5;
  score -= warn.length * 3;
  score = Math.max(40, Math.min(100, score));
  const status = (crit.length || unconfirmed.length) ? 'HOLD' : score >= 85 ? 'GO' : 'CAUTION';

  return {
    time: new Date(), audience: FM.statusReportAudience,
    score, status, crit, warn, info, unconfirmed,
    systems, airBad, online, maint, overdue, dueSoon, zones,
    nightShift: FM.nightShift, schedule: FM.scheduleForecast()
  };
};

// 純文字版（供 LINE / 複製）
FM.statusReportText = function() {
  const r = FM.generateStatusReport();
  const t = r.time;
  const hhmm = t.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const icon = r.status === 'GO' ? '🟢' : r.status === 'CAUTION' ? '🟡' : '🔴';
  const verdict = r.status === 'GO' ? '可正常開診' : r.status === 'CAUTION' ? '可開診（留意下列項目）' : '建議處置後開診';
  const sysIcon = s => s.level === 'crit' ? '🔴' : s.level === 'warn' ? '🟠' : '🟢';
  const L = [];
  L.push(`${icon}【看診前 Status Report】${t.toLocaleDateString('zh-TW')} ${hhmm}`);
  L.push(`致：${r.audience.join('、')}`);
  L.push(`整體就緒度 ${r.score}％ · 判定：${verdict}`);
  L.push(`告警 🔴${r.crit.length} 🟠${r.warn.length} 🔵${r.info.length}（待確認 ${r.unconfirmed.length}）`);
  L.push('子系統 ' + r.systems.map(s => sysIcon(s) + s.name).join(' '));
  const ns = r.nightShift;
  L.push(`昨夜保全：${ns.guard}（${ns.shift}）巡邏 ${ns.patrols}/${ns.patrolsPlanned}、夜間事件 ${ns.events.length} 件、交接${ns.status === 'ok' ? '正常' : '待確認'}（→ ${ns.handoverTo}）`);
  L.push(`今日門診預估稼動 ${r.schedule.util}％（預約 ${r.schedule.booked}/${r.schedule.capacity}）` + ' ' + r.schedule.sessions.map(s => `${s.name}${s.est}%`).join(' '));
  L.push(`全樓在線 ${r.online} 人`);
  if (r.airBad.length) L.push('空品注意：' + r.airBad.map(z => `${z.name} CO₂ ${z.co2}ppm`).join('、'));
  if (r.overdue.length) L.push('逾期保養 ' + r.overdue.length + ' 項：' + r.overdue.map(x => x.item).join('、'));
  if (r.unconfirmed.length) {
    L.push('待裁示：');
    r.unconfirmed.slice(0, 5).forEach(a => L.push(`· ${a.msg}（建議：${a.aiAction}）`));
  } else {
    L.push('待裁示：無');
  }
  L.push('— Hermes AI 自動彙整');
  return L.join('\n');
};

// 推播看診前簡報到主管群（含德新副總）；silent=true 不跳 toast
FM.pushStatusReport = function(silent) {
  const r = FM.generateStatusReport();
  return FM.pushLine(['mgr'], FM.statusReportText(), r.status === 'HOLD' ? 'warn' : 'info', silent);
};

// 每日 08:00 自動排程（Demo：頁面開啟期間以分鐘輪詢；正式版改雲端 cron）
FM.statusSchedule = { enabled: true, hour: 8, minute: 0, timer: null };
FM.statusPushedToday = function() {
  try { return localStorage.getItem('fm_status_report_date') === new Date().toISOString().slice(0, 10); } catch (e) { return false; }
};
FM.markStatusPushed = function() {
  try { localStorage.setItem('fm_status_report_date', new Date().toISOString().slice(0, 10)); } catch (e) {}
};
FM.nextStatusRun = function() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(FM.statusSchedule.hour, FM.statusSchedule.minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
};
FM.tickStatusSchedule = function() {
  if (!FM.statusSchedule.enabled) return;
  const now = new Date();
  if (now.getHours() === FM.statusSchedule.hour && now.getMinutes() >= FM.statusSchedule.minute && !FM.statusPushedToday()) {
    FM.pushStatusReport(true);  // 自動排程，靜音
    FM.markStatusPushed();
  }
};
FM.startStatusSchedule = function() {
  if (FM.statusSchedule.timer) return;
  if (typeof setInterval === 'function') FM.statusSchedule.timer = setInterval(FM.tickStatusSchedule, 60000);
};
// 手動模擬一次自動推播（demo 用）
FM.runStatusScheduleNow = function() {
  const r = FM.pushStatusReport(true);
  FM.markStatusPushed();
  if (FM.toast) FM.toast('看診前 Status Report 已推播主管群（含副總）', 'ok');  // 手動觸發保留單一提示
  return r;
};
FM.startStatusSchedule();

// 啟動時同步一次保養告警（讓中控/派工/hvac 一致）
FM.syncMaintenanceAlerts();

/* ─────────────────────────────────────────────────────────────────────────── */
/* 9f. 自動閉環引擎 — 事件→研判→派工→LINE→推進→結案→回到監控                  */
/* ─────────────────────────────────────────────────────────────────────────── */
FM.autoLoop = { running: false, timer: null, tickMs: 4000, ticks: 0, log: [], onTick: null,
  stats: { spawned: 0, dispatched: 0, completed: 0, pushed: 0 } };

FM.autoLoopLog = function(msg) {
  FM.autoLoop.log.unshift({ time: new Date(), msg });
  if (FM.autoLoop.log.length > 60) FM.autoLoop.log.length = 60;
};

// 事件樣本池（跨子系統）
FM.eventPool = [
  { system: 'PWR', level: 'warn', space: '7-A1-PWR-02', msg: '掛號區插座迴路電流偏高', aiAction: '派工務檢查負載分配' },
  { system: 'WTR', level: 'crit', space: '7-E3-WTR-01', msg: '淋浴間地排回水偵測', aiAction: '關閉區域給水 + 派工搶修' },
  { system: 'AIR', level: 'warn', space: '7-C1-AIR-01', msg: '運動訓練區 CO₂ 升至 920ppm', aiAction: '新風機提速至 95%' },
  { system: 'ACC', level: 'info', space: '7-A4-ACC-01', msg: '轉診窗口門禁多次刷卡失敗', aiAction: '通知櫃檯協助' },
  { system: 'HVAC', level: 'warn', space: '7-B1-HVAC-02', msg: '震波室室溫升至 25.5°C', aiAction: '增加冷量 / 提高風量' },
  { system: 'CCTV', level: 'info', space: '7-D3-CCTV-01', msg: '檔案室攝影機畫面短暫遺失', aiAction: '巡檢線路與電源' },
  { system: 'SEC', level: 'warn', space: '7-A3-SEC-01', msg: '候診區滯留人員偵測', aiAction: '保全前往關懷查看' },
  { system: 'FIRE', level: 'info', space: '7-C2-FIRE-01', msg: '偵煙器定期自檢通過', aiAction: '紀錄存查' }
];

// 產生新事件 → 自動開工單 + 套規則推播 LINE
FM.spawnEvent = function() {
  const tmpl = FM.eventPool[Math.floor(Math.random() * FM.eventPool.length)];
  FM._evtSeq = (FM._evtSeq || 0) + 1;
  const a = Object.assign({}, tmpl, {
    id: 'EVT-' + String(FM._evtSeq).padStart(3, '0'),
    time: new Date(),
    needConfirm: tmpl.level === 'crit',
    confirmed: false,
    status: '待指派',
    priority: tmpl.level === 'crit' ? '高' : tmpl.level === 'warn' ? '中' : '低',
    assignee: '未指派',
    ticketId: 'TK-' + String(7000 + FM._evtSeq),
    kind: 'auto',
    bornTick: FM.autoLoop.ticks
  });
  FM.alerts.unshift(a);
  FM.pushLineByAlert(a);
  FM.autoLoop.stats.spawned++;
  FM.autoLoop.stats.pushed++;
  FM.autoLoopLog('🆕 ' + a.id + '｜' + a.msg + '（' + a.level + '）→ 開工單 + LINE 推播');
  return a;
};

// 推進工單生命週期：待指派→進行中→完成→封存
FM.progressWorkOrders = function() {
  FM.alerts.forEach(a => {
    if (a.kind !== 'auto') return;
    const age = FM.autoLoop.ticks - (a.bornTick || 0);
    if (a.status === '待指派' && age >= 1) {
      a.status = '進行中';
      a.assignee = ['王技師', '李機電', '張檢修'][Math.floor(Math.random() * 3)];
      FM.autoLoop.stats.dispatched++;
      FM.autoLoopLog('🔧 ' + a.id + ' 已派 ' + a.assignee + '（進行中）');
    } else if (a.status === '進行中' && age >= 3) {
      a.status = '完成';
      a.confirmed = true;
      FM.autoLoop.stats.completed++;
      FM.autoLoopLog('✅ ' + a.id + ' 處理完成並結案');
    }
  });
  // 封存：完成逾 6 tick 的自動事件移除，避免無限增長
  FM.alerts = FM.alerts.filter(a => !(a.kind === 'auto' && a.status === '完成' && (FM.autoLoop.ticks - (a.bornTick || 0)) > 6));
};

FM.autoLoopTick = function() {
  FM.autoLoop.ticks++;
  FM.progressWorkOrders();
  const activeAuto = FM.alerts.filter(a => a.kind === 'auto' && a.status !== '完成').length;
  if (FM.autoLoop.ticks % 2 === 0 && activeAuto < 6) FM.spawnEvent();
  if (FM.reportAutoProcess) FM.reportAutoProcess();   // 同仁回報自動分流
  if (FM.tickStatusSchedule) FM.tickStatusSchedule();  // 看診前簡報每日排程
  if (typeof FM.autoLoop.onTick === 'function') { try { FM.autoLoop.onTick(); } catch (e) {} }
};

FM.startAutoLoop = function() {
  if (FM.autoLoop.running) return;
  FM.autoLoop.running = true;
  if (typeof setInterval === 'function') FM.autoLoop.timer = setInterval(FM.autoLoopTick, FM.autoLoop.tickMs);
  FM.autoLoopLog('▶ 自動閉環啟動（事件→研判→派工→推播→結案）');
};
FM.stopAutoLoop = function() {
  FM.autoLoop.running = false;
  if (FM.autoLoop.timer && typeof clearInterval === 'function') clearInterval(FM.autoLoop.timer);
  FM.autoLoop.timer = null;
  FM.autoLoopLog('⏸ 自動閉環暫停');
};
FM.toggleAutoLoop = function() { FM.autoLoop.running ? FM.stopAutoLoop() : FM.startAutoLoop(); return FM.autoLoop.running; };

// 平台載入即啟動自動閉環（持續無人值守運行）
FM.startAutoLoop();

console.log('FM 全域應用物件已初始化 (8 Helper 已補實)');
