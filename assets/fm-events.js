/* ───────────────────────────────────────────────
   FM 事件匯流排 — 子系統間解耦通訊
   FM.on(evt, cb) / FM.off(evt, cb) / FM.emit(evt, data)
   callback 個別 try-catch 隔離，單一例外不影響其他訂閱者
   ─────────────────────────────────────────────── */
(function () {
  if (typeof FM === 'undefined') { console.error('fm-events: 需先載入 app.js'); return; }
  FM._hooks = FM._hooks || {};
  FM.on = function (evt, cb) {
    (FM._hooks[evt] = FM._hooks[evt] || []).push(cb);
    return cb;
  };
  FM.off = function (evt, cb) {
    const arr = FM._hooks[evt]; if (!arr) return;
    const i = arr.indexOf(cb); if (i >= 0) arr.splice(i, 1);
  };
  FM.emit = function (evt, data) {
    (FM._hooks[evt] || []).slice().forEach(function (cb) {  // slice() 複本迭代：避免 callback 中增刪訂閱者影響本輪遍歷
      try { cb(data); } catch (e) { console.error('fm-events callback 例外 [' + evt + ']', e); }
    });
  };
})();
