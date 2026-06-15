/* ───────────────────────────────────────────────
   FM 緊急 SOP 知識庫 + 事件紀錄 store + 值勤 checklist
   ─────────────────────────────────────────────── */
(function () {
  if (typeof FM === 'undefined') { console.error('fm-sop: 需先載入 app.js'); return; }
  const IKEY = 'fm_sop_incidents_v1', SEQKEY = 'fm_sop_seq';

  function load(key, mem) {
    try { const raw = localStorage.getItem(key); if (raw !== null) return JSON.parse(raw) || []; }
    catch (e) {}
    return mem || [];
  }
  function save(key, arr, setMem) {
    try { localStorage.setItem(key, JSON.stringify(arr)); }
    catch (e) { console.warn('fm-sop: localStorage 寫入失敗，使用記憶體暫存', e); setMem(arr); }
  }

  /* ─────────────────────────────────────────────── */
  /* A. SOP 知識庫 — 15 條標準流程                      */
  /* ─────────────────────────────────────────────── */
  FM.sopLibrary = [
    // 【安全類 security】
    {
      id: 'sop-violence',
      category: 'security',
      title: '醫療暴力/肢體衝突',
      icon: '🛡️',
      steps: [
        '確保自身與周邊安全、按櫃台緊急鈕呼叫保全',
        '口頭安撫保持安全距離避免單獨應對',
        '嚴重肢體攻擊立即撥110並記錄人物特徵',
        '保全主管到場接手、疏散周邊病患',
        '事後填事件報告、調閱CCTV、關懷受影響員工'
      ],
      notify: ['sec', 'mgr', '110'],
      cautions: '不與對方拉扯、優先保全人身安全',
      link: 'CCTV'
    },
    {
      id: 'sop-theft',
      category: 'security',
      title: '竊盜/失竊',
      icon: '🔍',
      steps: [
        '確認失竊物品時間地點範圍',
        '保全現場勿觸碰、立即調閱CCTV',
        '通報主管與保全評估報警',
        '撥110報案提供影像與清單',
        '填失竊紀錄、檢討門禁監控'
      ],
      notify: ['sec', 'mgr', '110'],
      cautions: '保留現場、勿破壞跡證',
      link: 'CCTV'
    },
    {
      id: 'sop-suspicious',
      category: 'security',
      title: '可疑人物/恐嚇威脅',
      icon: '⚠️',
      steps: [
        '不正面衝突、暗中通知保全與同仁',
        '觀察記錄特徵行為位置',
        '保全到場關懷查看',
        '威脅明確即撥110並啟動防護',
        '留存影像、加強巡邏'
      ],
      notify: ['sec', 'mgr'],
      cautions: '避免單獨應對、優先通報',
      link: 'SEC'
    },
    {
      id: 'sop-lost-item',
      category: 'security',
      title: '顧客物品遺失',
      icon: '🎒',
      steps: [
        '安撫顧客確認物品特徵與最後使用位置',
        '協助尋找並調閱CCTV',
        '填遺失物登記表',
        '拾獲登記招領、未尋獲提供報案協助',
        '逾期無人認領依規處理'
      ],
      notify: ['unit', 'mgr'],
      cautions: '全程禮貌、勿擅自承諾賠償',
      link: null
    },
    // 【醫療類 medical】
    {
      id: 'sop-complaint',
      category: 'medical',
      title: '醫療糾紛/客訴',
      icon: '⚖️',
      steps: [
        '同理傾聽、隔離至獨立空間避免擴大',
        '主管或醫療負責人到場接待',
        '記錄主訴、不當場承諾賠償或認錯',
        '釐清事實、調閱病歷與紀錄',
        '啟動爭議處理機制、必要時法務或醫責險'
      ],
      notify: ['mgr', 'nur'],
      cautions: '不在公開區爭論、保留完整紀錄',
      link: null
    },
    {
      id: 'sop-ohca',
      category: 'medical',
      title: '病患昏厥/OHCA急救',
      icon: '🫀',
      steps: [
        '評估意識與呼吸、立即呼救',
        '啟動院內急救取AED與急救箱',
        '實施CPR/AED並撥119',
        '持續急救至119到場交接',
        '記錄時間軸、通知家屬、事後檢討'
      ],
      notify: ['nur', 'mgr', '119', '全院廣播'],
      cautions: '把握黃金搶救時間、勿移動疑似脊椎傷患',
      link: null
    },
    {
      id: 'sop-fall',
      category: 'medical',
      title: '跌倒/受傷',
      icon: '🩹',
      steps: [
        '勿貿然移動、評估傷勢與意識',
        '醫護到場初步處置',
        '輕傷處置記錄、重傷119送醫',
        '調閱CCTV釐清原因、檢視環境風險',
        '填意外事件報告'
      ],
      notify: ['nur', 'mgr'],
      cautions: '先確認意識再決定是否移動',
      link: 'CCTV'
    },
    // 【設施災害類 facility】
    {
      id: 'sop-fire',
      category: 'facility',
      title: '火災疏散',
      icon: '🔥',
      steps: [
        '發現火源、小火以滅火器初期撲滅',
        '啟動火警通報並廣播疏散',
        '引導病患循逃生路線至集合點、協助行動不便者',
        '撥119並切斷相關電源氣體',
        '清點人數、禁止返回'
      ],
      notify: ['eng', 'mgr', '119', '全院廣播'],
      cautions: '濃煙時低姿勢、勿搭電梯、火勢過大勿逞強',
      link: 'FIRE'
    },
    {
      id: 'sop-blackout',
      category: 'facility',
      title: '停電應變',
      icon: '🔌',
      steps: [
        '確認停電範圍、啟動緊急照明與UPS',
        '維護治療中病患安全、醫療設備優先供電',
        '通報工務搶修並聯繫台電',
        '評估是否暫停門診',
        '復電後檢查設備並記錄'
      ],
      notify: ['eng', 'mgr'],
      cautions: '醫療設備供電優先、留意UPS續航',
      link: 'PWR'
    },
    {
      id: 'sop-flood',
      category: 'facility',
      title: '漏水/水災',
      icon: '💧',
      steps: [
        '關閉相關給水閥、鋪設防滑吸水',
        '移開電器、保護病歷與設備',
        '通報工務檢修漏點',
        '清理復原評估影響',
        '記錄與檢討'
      ],
      notify: ['eng'],
      cautions: '水電並存先斷電防漏電',
      link: 'WTR'
    },
    {
      id: 'sop-earthquake',
      category: 'facility',
      title: '地震應變',
      icon: '🌐',
      steps: [
        '就地避難趴下掩護穩住',
        '搖晃停止後評估結構與傷患',
        '必要時循火災路線疏散至空曠處',
        '關閉電源氣體、慎防餘震',
        '清點人數、回報災情'
      ],
      notify: ['mgr', '全院廣播'],
      cautions: '勿搭電梯、遠離窗戶與懸掛物',
      link: null
    },
    // 【值勤例行 duty】
    {
      id: 'sop-open-check',
      category: 'duty',
      title: '開店巡檢',
      icon: '🌅',
      steps: [
        '門禁鐵捲門開啟、警報解除',
        '巡視各區照明空調設備開機',
        '檢查消防通道淨空與滅火器',
        '確認醫療設備自檢與耗材庫存',
        '環境清潔確認、開診準備'
      ],
      notify: [],
      cautions: '逐項確認後簽核',
      link: null
    },
    {
      id: 'sop-close-check',
      category: 'duty',
      title: '閉店交接',
      icon: '🌙',
      steps: [
        '確認所有病患離場、各診間清潔',
        '設備關機、貴重物品與藥品上鎖',
        '巡檢水電火源、垃圾清運',
        '設定警報、門禁上鎖',
        '填交接日誌與異常記錄'
      ],
      notify: [],
      cautions: '水電火源務必逐項確認',
      link: null
    },
    {
      id: 'sop-night-watch',
      category: 'duty',
      title: '夜間值班',
      icon: '🔦',
      steps: [
        '定時巡邏每2小時並記錄巡邏點',
        '監控CCTV、異常即通報',
        '緊急聯絡清單置於明顯處',
        '交接班記錄'
      ],
      notify: [],
      cautions: '巡邏不可漏點、保持通訊暢通',
      link: 'CCTV'
    },
    {
      id: 'sop-drill',
      category: 'duty',
      title: '定期演練',
      icon: '📋',
      steps: [
        '消防演練每半年一次',
        '急救CPR訓練',
        '防暴保全演練',
        '演練記錄與檢討改善'
      ],
      notify: [],
      cautions: '演練後務必記錄並追蹤改善',
      link: null
    }
  ];

  /* ─────────────────────────────────────────────── */
  /* B. FM.sopIncidents 事件紀錄 store                */
  /* ─────────────────────────────────────────────── */
  FM.sopIncidents = {
    _cache: null, _mem: null, _lastSeq: null,
    list: function () { if (this._cache === null) this._cache = load(IKEY, this._mem); return this._cache; },
    get: function (id) { return this.list().find(function (inc) { return inc.id === id; }) || null; },
    active: function () { return this.list().filter(function (inc) { return inc.status !== '結案'; }); },
    _persist: function () { const s = this; save(IKEY, s.list(), function (a) { s._mem = a; }); },

    activate: function (sopId, byRole) {
      // 查 sopLibrary，若不存在回傳 null
      const sop = FM.sopLibrary.find(function (x) { return x.id === sopId; });
      if (!sop) return null;

      const list = this.list();
      let seq = Math.max(this._lastSeq || 0, parseInt(localStorage.getItem(SEQKEY) || '0', 10) || 0) + 1;
      this._lastSeq = seq;
      try { localStorage.setItem(SEQKEY, String(seq)); } catch (e) {}

      const inc = {
        id: 'EM-' + String(seq).padStart(4, '0'),
        sopId: sopId,
        title: sop.title,
        category: sop.category,
        status: '啟動中',
        startedAt: Date.now(),
        handler: byRole,
        log: [{ time: Date.now(), actor: byRole, action: '啟動應變' }]
      };
      list.unshift(inc);
      this._persist();

      // 推播：過濾掉外部字串 (110, 119, 全院廣播)，只推內部群組 key
      const groupKeys = (sop.notify || []).filter(function (k) { return k !== '110' && k !== '119' && k !== '全院廣播'; });
      if (groupKeys.length > 0) {
        FM.pushLine(groupKeys, '🚨 已啟動應變：' + sop.title + '（' + byRole + '）', 'crit', true);
      }

      return inc;
    },

    update: function (id, patch, logEntry) {
      const inc = this.get(id); if (!inc) return null;
      Object.assign(inc, patch);
      if (logEntry && Object.keys(logEntry).length > 0) {
        inc.log.push(Object.assign({ time: Date.now(), actor: 'system', action: '' }, logEntry));
      }
      this._persist();
      return inc;
    },

    resolve: function (id, byRole, note) {
      const inc = this.get(id); if (!inc) return null;
      inc.status = '結案';
      inc.log.push({ time: Date.now(), actor: byRole, action: '結案：' + (note || '') });
      this._persist();
      return inc;
    }
  };

  /* ─────────────────────────────────────────────── */
  /* C. FM.dutyChecklists 值勤 checklist              */
  /* ─────────────────────────────────────────────── */
  FM.dutyChecklists = function () {
    return FM.sopLibrary.filter(function (sop) { return sop.category === 'duty'; });
  };
})();
