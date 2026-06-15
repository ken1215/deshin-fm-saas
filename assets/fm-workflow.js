/* ───────────────────────────────────────────────
   FM Workflow 引擎 — 宣告式定義 + human-in-the-loop 關卡
   設計約束：
   1. 「closed」狀態只能由 signoff() 進入（Gate 2 全工單強制人工簽核）
   2. 整頁跳轉導航 → 進度用 stageSince 時間戳推進，狀態即時持久化
   3. 任一步驟例外 → status 'error' 進人工佇列（fail to human）
   ─────────────────────────────────────────────── */
(function () {
  if (typeof FM === 'undefined' || !FM.on || !FM.ticketStore || !FM.hermesTriage) { console.error('fm-workflow: 需先載入 app.js / fm-events / fm-tickets，且 app.js 須定義 FM.hermesTriage'); return; }

  /* ── HermesProvider adapter：當前 mock-rules 為同步版本；cloud-api provider 將支援 Promise ── */
  const SYS_TO_CAT = { PWR: 'power', HVAC: 'hvac', AIR: 'hvac', WTR: 'water', FIRE: 'fire', CCTV: 'it', SEC: 'sec', ACC: 'sec', SUP: 'supply', CLN: 'clean', AST: 'med', LGT: 'power' };
  FM.HermesProvider = FM.HermesProvider || {
    name: 'mock-rules（當前同步；cloud-api provider 支援 Promise）',
    triage: function (alert) {
      const rep = { desc: alert.msg || '', cat: SYS_TO_CAT[alert.system] || 'other', urgent: alert.level === 'crit' };
      return FM.hermesTriage(rep);
    },
  };

  const SIM = { toProgress: 8000, toDone: 16000 };   // 模擬技師進度（demo 時間軸）
  const PKEY = 'fm_wf_paused';

  FM.workflow = {
    defs: {},
    register: function (def) { this.defs[def.id] = def; },
    isPaused: function () { try { return localStorage.getItem(PKEY) === '1'; } catch (e) { return false; } },
    setPaused: function (v) {
      try { localStorage.setItem(PKEY, v ? '1' : '0'); } catch (e) {}
      if (FM.autoLoopLog) FM.autoLoopLog(v ? '⏸ Workflow 總開關：暫停所有自動步驟' : '▶ Workflow 總開關：恢復');
    },

    /* 入口：alert:created → triage → Gate1 分流 */
    handleAlert: function (alert) {
      if (this.isPaused() || alert.wfTicketId) return;
      // 設置防重 marker（防止 triage 非同步時重複建工單）
      alert._wfProcessing = true;
      const self = this;
      function onTriage(tri) {
        // 再次檢查防重（triage 執行期間若同一 alert 被重複 emit）
        if (alert.wfTicketId) return;
        const t = FM.ticketStore.create({
          alertId: alert.id, space: alert.space, system: alert.system, msg: alert.msg, level: alert.level,
          cat: tri.finalCat, team: tri.team, severity: tri.severity, sop: tri.sop, sla: tri.sla,
          autoEligible: tri.autoEligible, highRisk: !tri.autoEligible,
        });
        alert.wfTicketId = t.id;
        FM.ticketStore.update(t.id, { status: 'triaged' }, { actor: 'hermes-ai', action: 'AI 研判', aiSuggestion: tri.recommend + '｜' + tri.autoReason });
        if (tri.autoEligible) self._dispatch(t.id, 'system', 'Hermes 自動派工（低風險例行）');
        else {
          FM.ticketStore.update(t.id, { status: 'pending-dispatch' }, { actor: 'system', action: '進派工確認佇列（高風險，待主管核可）', aiSuggestion: tri.recommend });
          if (FM.pushLine) FM.pushLine(['mgr'], '🧑‍⚖️ 工單 ' + t.id + '（' + (alert.msg || '') + '）待主管派工核可', alert.level === 'crit' ? 'crit' : 'warn', true);
        }
      }
      function onFail(e) {
        console.error('fm-workflow triage 例外', e);
        const t = FM.ticketStore.create({ alertId: alert.id, space: alert.space, system: alert.system, msg: alert.msg, level: alert.level });
        alert.wfTicketId = t.id;
        FM.ticketStore.update(t.id, { status: 'error' }, { actor: 'system', action: '研判失敗，轉人工處理（fail to human）：' + (e && e.message) });
      }
      try {
        const r = FM.HermesProvider.triage(alert);
        if (r && typeof r.then === 'function') r.then(onTriage).catch(onFail);
        else onTriage(r);
      } catch (e) { onFail(e); }
    },

    _dispatch: function (id, actor, note) {
      const t = FM.ticketStore.get(id); if (!t) return;
      const tech = ['王技師', '李機電', '張檢修'][Math.floor(Math.random() * 3)];
      FM.ticketStore.update(id, { status: 'dispatched', assignee: tech },
        { actor: actor, action: '派工 ' + (t.team || '') + '/' + tech, aiSuggestion: note, humanDecision: actor === 'system' ? null : note });
      if (FM.pushLine) FM.pushLine(['eng'], '🔧 ' + id + ' 已派 ' + tech + '（' + (t.msg || '') + '）', 'info', true);
    },

    /* Gate 1：主管核可派工 */
    approveDispatch: function (id, byRole) {
      const t = FM.ticketStore.get(id);
      if (!t || t.status !== 'pending-dispatch') return false;
      this._dispatch(id, byRole, byRole + ' 核可派工');
      return true;
    },

    /* Gate 2：簽核結案（closed 的唯一入口）；reject 退回 in-progress */
    signoff: function (id, approve, byRole, note) {
      const t = FM.ticketStore.get(id);
      if (!t || t.status !== 'done-pending-signoff') return false;
      if (approve) {
        FM.ticketStore.update(id, { status: 'closed' }, { actor: byRole, action: '驗收簽核 → 結案', humanDecision: '核可' + (note ? '：' + note : '') });
        FM.assetHistory.add({ ticketId: id, space: t.space, system: t.system, msg: t.msg, team: t.team, assignee: t.assignee, signedBy: byRole });
        // 就地修改 FM.alerts 陣列（保持陣列引用完整性）
        for (let i = FM.alerts.length - 1; i >= 0; i--) {
          if (FM.alerts[i].wfTicketId === id) FM.alerts.splice(i, 1);
        }
        if (FM.emit) FM.emit('ticket:closed', t);
        if (FM.pushLine) FM.pushLine(['unit'], '✅ ' + id + ' 已由 ' + byRole + ' 簽核結案，履歷已回寫', 'info', true);
      } else {
        FM.ticketStore.update(id, { status: 'in-progress', rejectReason: note || '未通過驗收' },
          { actor: byRole, action: '驗收退回 → 重修', humanDecision: '退回：' + (note || '未通過驗收') });
      }
      return true;
    },

    batchSignoff: function (ids, byRole) {
      const self = this; let n = 0;
      ids.forEach(function (id) {
        const t = FM.ticketStore.get(id);
        if (t && !t.highRisk && self.signoff(id, true, byRole, '批次核可')) n++;  // 批次僅限低風險
      });
      return n;
    },

    takeover: function (id, byRole) {
      FM.ticketStore.update(id, { status: 'manual' }, { actor: byRole, action: '人工接管，自動流程停止', humanDecision: '接管' });
    },

    /* 時間戳驅動的進度模擬：dispatched →8s→ in-progress →16s→ done-pending-signoff */
    tick: function () {
      if (this.isPaused()) return;
      const now = Date.now();
      FM.ticketStore.active().forEach(function (t) {
        try {
          if (t.status === 'dispatched' && now - t.stageSince >= SIM.toProgress) {
            FM.ticketStore.update(t.id, { status: 'in-progress' }, { actor: 'system', action: '技師到場，開始處理（模擬）' });
          } else if (t.status === 'in-progress' && now - t.stageSince >= SIM.toDone) {
            FM.ticketStore.update(t.id, { status: 'done-pending-signoff' }, { actor: 'system', action: '完工回報，進驗收佇列（待人工簽核）' });
            if (FM.pushLine) FM.pushLine(['mgr'], '📝 ' + t.id + '（' + (t.msg || '') + '）完工，待驗收簽核', 'warn', true);
          }
        } catch (e) {
          console.error('fm-workflow tick 例外', e);
          FM.ticketStore.update(t.id, { status: 'error' }, { actor: 'system', action: '推進失敗，轉人工：' + (e && e.message) });
        }
      });
    },

    /* 佇列（由持久化狀態即時導出，天然跨頁） */
    queues: function () {
      const all = FM.ticketStore.list();
      return {
        dispatch: all.filter(function (t) { return t.status === 'pending-dispatch'; }),
        signoff: all.filter(function (t) { return t.status === 'done-pending-signoff'; }),
        error: all.filter(function (t) { return t.status === 'error'; }),
      };
    },
  };

  /* repair-loop 宣告式定義（文件化流程；引擎依此執行） */
  FM.workflow.register({
    id: 'repair-loop',
    trigger: 'alert:created',
    steps: [
      { id: 'triage', agent: 'HermesProvider' },
      { id: 'dispatch', gate: 'highRisk→human' },
      { id: 'progress', sim: 'technician' },
      { id: 'closure', gate: 'human' },          // 全工單人工簽核
      { id: 'history', action: 'asset.writeback' },
    ],
  });

  FM.on('alert:created', function (a) { FM.workflow.handleAlert(a); });
  FM.on('autoloop:tick', function () { FM.workflow.tick(); });
})();
