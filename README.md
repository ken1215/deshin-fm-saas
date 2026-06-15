# 德新行政管理平台 — 醫療場域智慧維運平台（Demo）

聯新台北運醫會館（健康21世紀大樓 7F，整層 542 坪）智慧維運中控系統的 Demo 級前端實作。以「空間編碼」為共用主鍵，貫穿**工務（機電）＋總務（庶務）＋行政（營運）**，並以 AI Agent 做跨系統告警分級與派工。

## 📚 文件索引
| 文件 | 用途 |
|------|------|
| [`ONBOARDING.md`](ONBOARDING.md) | **新 coding 快速接入**（10 分鐘上手、雷區、加子系統步驟） |
| [`ARCHITECTURE_SPEC.md`](ARCHITECTURE_SPEC.md) | 共用 API 完整參考（`FM.*` 全表）、頁面規範 |
| [`DEVLOG.md`](DEVLOG.md) | 開發過程 log（里程碑時間軸、決策、修復） |
| [`DEV_REPORT.md`](DEV_REPORT.md) | 過程報告（階段、模組完成度、現況、下一步） |
| [`現場設備清單_感測與地端AI.md`](現場設備清單_感測與地端AI.md) | 現場感測/控制設備 + 地端 AI 模型設備佈建清單 |
| [`設備預算_初步估算.md`](設備預算_初步估算.md) | 設備（含安裝）初步預算估算、分期與單價假設 |

## 如何開啟
- **雙擊 `index.html`** 用瀏覽器（Chrome/Edge/Safari）開啟即可。
- 純前端、零外部相依、可離線；無需安裝、無需啟動伺服器。
- 首頁頂部為 **7F 戰情主視覺**（深色戰情室：平面圖 Hero + 空品/稼動/溫度/告警/人流 5 圖層 + 自動輪播 + 告警脈動 + KPI 跳動 + 事件跑馬燈）。
- 載入即啟動 **自動閉環引擎**（事件→Hermes 研判/派工→LINE 推播→工單推進→結案→看診前簡報），中控底部可即時觀看與暫停/啟動。

## 模組清單（中控 + 17 子系統（含 LGT 照明）+ 管理工具）
| 頁面 | 子系統 | 空間碼前綴 |
|------|--------|-----------|
| `index.html` | 中控戰情總覽（**7F 戰情主視覺** Hero、全系統狀態格、即時告警流、能耗趨勢） | — |
| `modules/power.html` | 電力監測（含 B3 220V 震波專迴、UPS、契約容量、尖峰預測） | PWR |
| `modules/hvac.html` | 空調節能（VRV 多區控溫、空轉偵測、節能率） | HVAC |
| `modules/air.html` | 新風空品（CO₂/PM2.5/TVOC、全熱交換、DCV） | AIR |
| `modules/fire.html` | 消防安全（定檢到期、防火管理人、演練排程） | FIRE |
| `modules/water.html` | 給排水/漏水（漏水感測、關斷建議、用水監測） | WTR |
| `modules/asset.html` | 資產保固/法定申報（台帳、保固到期、法定申報行事曆） | AST |
| `modules/supplies.html` | 耗材布草/總務（安全庫存、自動採購建請） | SUP |
| `modules/access.html` | 門禁安防/環境清潔（門禁、滯留告警、清潔排程） | ACC·CLN |
| `modules/scheduling.html` | 排程稼動率（治療床/儀器/診間使用率） | SCH |
| `modules/dispatch.html` | **AI Agent 報修派工中控**（告警匯流、分級去重、工單、人工確認關卡） | DSP |
| `modules/cctv.html` | 影像監控 + 櫃檯熱力分析 | CCTV |
| `modules/security.html` | 保全排班 | SEC |
| `modules/staff.html` | 即時在線人員管理 | STF |
| `modules/vendor.html` | **外包商管理**（名冊/合約到期/績效評等/證照保險） | VND |
| `modules/lighting.html` | 照明控制（迴路監測、調光、故障告警） | LGT |
| `modules/hermes.html` | **Hermes AI 主管台**（待研判佇列、自動分流） | — |
| `modules/line.html` | LINE 推播中心（群組/規則/紀錄） | — |
| `modules/report.html` | 同仁回報**接收端**（Hermes triage → 人工決策） | RPT |
| `../staff-report-app/index.html` | 同仁回報**獨立 APP**（手機端，localStorage 同步） | RPT |

## 空間編碼 schema
格式：`[樓層]-[區域][房號]-[子系統]-[點位]`，例：
- `7-B3-PWR-01` — 7F 物理治療 B3 震波區 220V 專迴電表
- `7-E2-WTR-03` — 7F 輔助區 E2 漏水感測點

7F 分區：A 接待門診 / B 物理治療 / C 運動訓練 / D 後勤行政 / E 輔助（更衣淋浴冰敷）。

## 告警分級
- **緊急（crit/紅）**：即時通報
- **一般（warn/橘）**：開工單
- **資訊（info/綠）**：日報

AI Agent 流程：分級 → 去重 → 建議動作 → **人工確認關卡**（採購/關斷/派工等高風險動作需人工確認）。

## 技術架構
- `assets/style.css` — CIS 設計系統（聯新配色、戰情中控版面、卡片/徽章/表格）
- `assets/app.js` — 共用核心：`FM.spaces`（空間編碼主資料）、`FM.alerts`、`FM.renderShell()`（側欄+戰情列）、SVG 畫圖 helper（`FM.svgBar/svgDonut/svgLine/sparkline/gauge`）、`FM.statusBadge/spaceTag/createTable/showModal/confirmAlert` 等
- 各模組頁 link 共用資產 → 呼叫 `FM.renderShell(key, title)` → 用 helper 注入自身內容
- `ARCHITECTURE_SPEC.md` — 架構規格書

## 已知限制
- **Demo / mock 級**：所有感測數值、告警、工單為寫死的示範資料，未串接真實 IoT/BMS。
- 圖表為內聯 SVG 靜態繪製，部分為示意。
- 對應平台 Roadmap 的 **Phase 1（開幕基礎監控）儀表板雛形**；Phase 2 AI 推理、Phase 3 全模組深化、Phase 4 SaaS 多租戶為後續開發。

---
立德新股份有限公司／德新物業 ｜ 聯新國際醫療集團
