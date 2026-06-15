/* ───────────────────────────────────────────────
   FM 工單持久層 — workflow 工單 + 資產維修履歷
   導航為整頁跳轉：一切即時寫 localStorage，讀取時還原
   localStorage 失敗（滿載/隱私模式）→ 記憶體 fallback + console.warn
   ─────────────────────────────────────────────── */
(function () {
  if (typeof FM === 'undefined') { console.error('fm-tickets: 需先載入 app.js'); return; }
  const TKEY = 'fm_tickets_v1', HKEY = 'fm_asset_history_v1';

  function load(key, mem) {
    try { const raw = localStorage.getItem(key); if (raw !== null) return JSON.parse(raw) || []; }
    catch (e) {}
    return mem || [];
  }
  function save(key, arr, setMem) {
    try { localStorage.setItem(key, JSON.stringify(arr)); }
    catch (e) { console.warn('fm-tickets: localStorage 寫入失敗，使用記憶體暫存', e); setMem(arr); }
  }

  FM.ticketStore = {
    _cache: null, _mem: null, _lastSeq: null,
    list: function () { if (this._cache === null) this._cache = load(TKEY, this._mem); return this._cache; },
    get: function (id) { return this.list().find(function (t) { return t.id === id; }) || null; },
    active: function () { return this.list().filter(function (t) { return t.status !== 'closed'; }); },
    _persist: function () { const s = this; save(TKEY, s.list(), function (a) { s._mem = a; }); },
    create: function (data) {
      const list = this.list();
      let seq = Math.max(this._lastSeq || 0, parseInt(localStorage.getItem('fm_ticket_seq') || '0', 10) || 0) + 1;
      this._lastSeq = seq;
      try { localStorage.setItem('fm_ticket_seq', String(seq)); } catch (e) {}
      const t = Object.assign({
        id: 'WT-' + String(seq).padStart(4, '0'),
        status: 'created', stageSince: Date.now(), assignee: null,
        highRisk: false, rejectReason: null,
        audit: [{ time: Date.now(), actor: 'system', action: '工單建立', aiSuggestion: null, humanDecision: null }],
      }, data);
      list.unshift(t); this._persist();
      return t;
    },
    update: function (id, patch, auditEntry) {
      const t = this.get(id); if (!t) return null;
      Object.assign(t, patch);
      if (patch.status && !('stageSince' in patch)) t.stageSince = Date.now();
      if (auditEntry && Object.keys(auditEntry).length > 0) t.audit.push(Object.assign({ time: Date.now(), actor: 'system', action: '', aiSuggestion: null, humanDecision: null }, auditEntry));
      this._persist();
      return t;
    },
  };

  FM.assetHistory = {
    _cache: null, _mem: null,
    list: function () { if (this._cache === null) this._cache = load(HKEY, this._mem); return this._cache; },
    add: function (rec) {
      const arr = this.list();
      arr.unshift(Object.assign({ time: Date.now() }, rec));
      if (arr.length > 200) arr.splice(200);  // 防無限增長
      const s = this; save(HKEY, arr, function (a) { s._mem = a; s._cache = arr; });
    },
  };
})();
