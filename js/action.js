/* 활동형 미니게임 — 모두 키보드만으로 할 수 있어요 (터치는 보조).
   playAction(spec) -> Promise<{ok, score, skipped}>
   spec: {type, title, goal, how, learn, time, data, boosts:[{icon,label}], mod:{...}}
   흐름: 안내 카드(Space) -> 3·2·1 -> 게임 -> 결과 카드(Space). G 포기하기(글자 입력 게임은 길게) · 결과 화면 R 다시하기 */
import { sound } from './common.js';

const CSS = `
#ag{word-break:keep-all;overflow-wrap:break-word;text-wrap:pretty;position:fixed;inset:0;z-index:40;display:grid;place-items:center;background:rgba(14,12,26,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:14px;font-family:'Noto Sans KR',system-ui,sans-serif;color:#2c2733}
#ag[hidden],#ag [hidden]{display:none!important}
#ag,#ag *{box-sizing:border-box}
#ag .agbox{position:relative;width:min(1060px,100%);height:min(740px,100%);background:#fffdf9;border:3px solid #2c2733;border-radius:26px;box-shadow:0 9px 0 #2c2733;display:grid;grid-template-rows:auto auto 1fr auto;gap:12px;padding:20px 26px 14px;overflow:hidden}
#ag .ag-hd{display:flex;align-items:center;gap:14px;min-width:0}
#ag .ag-day{flex:none;font-family:Jua,'Noto Sans KR',sans-serif;font-size:19px;line-height:1;padding:8px 13px;border:2px solid #2c2733;border-radius:11px;background:#f4efe6;box-shadow:0 3px 0 #2c2733}
#ag .ag-tt{min-width:0}
#ag .ag-tt h3{font-family:Jua,'Noto Sans KR',sans-serif;font-weight:400;font-size:clamp(22px,3vw,31px);line-height:1.1;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ag .ag-tt small{display:block;font-size:12.5px;color:#7b7285;margin-top:3px}
#ag .ag-quit{margin-left:auto;flex:none;font:700 14px 'Noto Sans KR',sans-serif;color:#2c2733;background:#fffdf9;border:2px solid #2c2733;border-radius:12px;padding:9px 18px;box-shadow:0 4px 0 #2c2733;cursor:pointer}
#ag .ag-quit:active{transform:translateY(2px);box-shadow:0 2px 0 #2c2733}
#ag .ag-quit.off{visibility:hidden}
#ag #agSkip{margin-left:10px}
#ag .ag-st{display:flex;align-items:center;gap:18px;min-height:30px}
#ag .ag-st b{font:800 24px 'Noto Sans KR',sans-serif;font-variant-numeric:tabular-nums;min-width:72px}
#ag .ag-pb{flex:0 1 40%;height:13px;border:2px solid #2c2733;border-radius:99px;background:#ece7ef;overflow:hidden}
#ag .ag-pb i{display:block;height:100%;width:0;background:#e08a1e;transition:width .15s linear}
#ag .ag-st span{flex:0 1 auto;font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#ag .ag-hearts{margin-left:auto;color:#d9473a;font-size:24px;letter-spacing:3px;line-height:1;flex:none}
#ag .ag-hearts .off{color:#d8d1dc}
#ag .ag-mon{position:relative;background:#20253a;border:3px solid #2c2733;border-radius:18px;display:grid;grid-template-rows:42px 1fr;min-height:0;overflow:hidden}
#ag .ag-monhd{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid #353c5a;color:#cdd3e6;font-size:12.5px;letter-spacing:.03em;white-space:nowrap;overflow:hidden}
#ag .ag-monhd i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#17a99a;box-shadow:0 0 8px #3fd6bd;margin-right:9px;vertical-align:1px}
#ag .ag-monhd #agGear{color:#3fd6bd;overflow:hidden;text-overflow:ellipsis}
#ag .ag-cv{position:relative;min-height:0}
#ag canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
#ag .ag-ft{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px}
#ag .ag-ft #agTip{font-size:14.5px;color:#4b4452;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#ag .ag-keys{display:flex;gap:14px;flex:0 1 auto;flex-wrap:wrap;justify-content:flex-end;min-width:0}
#ag .ag-keys span{display:flex;align-items:center;gap:7px}
#ag .ag-keys kbd{min-width:44px;height:34px;padding:0 10px;display:inline-grid;place-items:center;font:800 15px 'Noto Sans KR',sans-serif;background:#fffdf9;color:#2c2733;border:2px solid #2c2733;border-radius:9px;box-shadow:0 3px 0 #2c2733}
#ag .ag-keys em{font-style:normal;font-family:Jua,'Noto Sans KR',sans-serif;font-size:15px;line-height:1.05;white-space:nowrap}
#ag .agcard{position:absolute;inset:42px 0 0 0;display:grid;place-items:center;padding:14px;background:rgba(20,22,36,.62);z-index:2}
#ag .agcard>div{background:#fffdf9;border:2.5px solid #2c2733;border-radius:18px;box-shadow:0 5px 0 #2c2733;padding:18px 22px;max-width:620px;width:100%;text-align:center;max-height:100%;overflow:auto}
#ag h2{font-family:Jua,'Noto Sans KR',sans-serif;font-weight:400;font-size:28px;line-height:1.15;margin:4px 0 0}
#ag .tag{display:inline-block;font-size:12px;font-weight:700;color:#17a99a;border:1.5px solid #17a99a;border-radius:8px;padding:2px 10px}
#ag .row{display:grid;grid-template-columns:58px 1fr;gap:10px;align-items:start;text-align:left;margin-top:10px;background:#f4efe6;border-radius:12px;padding:10px 12px}
#ag .row b{font-family:Jua,sans-serif;font-weight:400;font-size:16px;color:#2c2733}
#ag .row p{font-size:14px;line-height:1.55;margin:0}
#ag .row ol{margin:0;padding-left:18px;font-size:13px;line-height:1.45;text-align:left}#ag .row ol li{margin:1px 0}#ag .row.how,#ag .row{margin-top:7px;padding:8px 12px}#ag .row p{font-size:13px;line-height:1.45}#ag .agcard>div{padding:14px 20px;max-width:680px}#ag .boost{margin-top:8px}#ag .row ol li::marker{color:#17a99a;font-weight:700}
#ag .agcard.full{position:fixed;inset:0;z-index:60;padding:3vh 16px;background:rgba(14,15,26,.74);backdrop-filter:blur(2px)}
#ag .agcard>div.tut{max-width:min(880px,96vw);max-height:94vh;padding:14px 22px 14px;display:flex;flex-direction:column;overflow:hidden;gap:0}#ag .tut>*{flex:none}
#ag .tuthd{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}#ag .tuthd .tag{justify-self:start}#ag .tuthd .tutdots{justify-self:end;margin:0}
#ag .tutttl{text-align:center;line-height:1.1}#ag .tutttl small{display:block;font:800 11px 'Noto Sans KR',sans-serif;letter-spacing:.12em;color:#17a99a;margin-bottom:2px}#ag .tut h4{font:400 26px Jua,sans-serif;margin:0;color:#2c2733}
#ag .tut .tutimg{flex:0 1 auto;min-height:0;align-self:center;max-width:100%;margin-top:12px;border:2.5px solid #2c2733;border-radius:14px;overflow:hidden;background:#1d2030;line-height:0;box-shadow:0 4px 0 #2c2733}#ag .tutimg img{display:block;max-width:100%;max-height:calc(94vh - 300px);width:auto;height:auto}
#ag .tutcap{margin-top:14px;background:#f4efe6;border-radius:14px;padding:10px 16px;display:flex;gap:12px;align-items:center;text-align:left}#ag .tutcap .ic{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:18px;background:#fffdf9;border:2px solid #2c2733}
#ag .tuttx{font-size:15px;font-weight:700;line-height:1.5;margin:0;color:#2c2733}#ag .tutgoal{font-size:12.5px;line-height:1.45;margin:3px 0 0;color:#5c5566;font-weight:500}#ag .tutgoal b{color:#17a99a;margin-right:5px}
#ag .tut .keys{margin-top:10px}#ag .tut .boost{margin-top:10px}
#ag .tutdots{display:flex;gap:5px;align-items:center}#ag .tutdots i{width:8px;height:8px;border-radius:50%;background:#d8d1dc;transition:width .2s}#ag .tutdots i.on{background:#17a99a;width:24px;border-radius:4px}#ag .tutdots i.done{background:#9fd9cf}
#ag .tutft{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-top:12px;gap:10px}#ag .tutft .hint{margin:0;justify-self:start;text-align:left}#ag .tutft .tutbtns{grid-column:2}
#ag .tutbtns{display:flex;gap:10px;justify-content:center;align-items:center}#ag .tutbtns button{margin-top:0!important;padding:7px 24px!important;font-size:18px!important;min-width:150px}#ag .tutback{background:#fffdf9!important;color:#2c2733!important;min-width:110px!important}
#ag .keys{display:flex;gap:8px 14px;flex-wrap:wrap;justify-content:center;margin-top:10px;font-size:13px;font-weight:700;color:#2c2733}#ag .keys span{display:inline-flex;align-items:center;gap:6px}
#ag kbd{display:inline-block;font:800 12.5px 'Noto Sans KR',sans-serif;background:#fffdf9;color:#2c2733;border:1.5px solid #2c2733;border-radius:6px;padding:0 7px;margin:0 2px;box-shadow:0 2px 0 #2c2733}
#ag .boost{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:12px}
#ag .boost span{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#0f6f63;border:1.5px solid #17a99a;background:#e9f8f4;border-radius:999px;padding:3px 10px 3px 3px}
#ag .boost img{width:24px;height:24px;border-radius:50%}
#ag .boost span.none{color:#7b7285;border-color:#d8d1dc;background:#f4efe6;padding:3px 10px}
#ag .agcard button{font-family:Jua,'Noto Sans KR',sans-serif;font-size:20px;color:#fff;background:#d9473a;border:2.5px solid #2c2733;border-radius:14px;padding:9px 26px;cursor:pointer;box-shadow:0 4px 0 #2c2733;margin-top:16px}
#ag .agcard button:active{transform:translateY(2px);box-shadow:0 2px 0 #2c2733}
#ag .big{font-family:Jua,sans-serif;font-size:min(22vw,150px);color:#fff;text-shadow:0 8px 0 #07080f}
#ag .learn{margin-top:12px;font-size:14px;line-height:1.6;background:#fff4cf;border:1.5px solid #e8cf7a;border-radius:12px;padding:10px 12px;text-align:left}
#ag .score{font-family:Jua,sans-serif;font-size:42px;margin-top:2px}
#ag .rico{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin:2px auto 0;font:800 30px 'Noto Sans KR',sans-serif;color:#fff;border:2.5px solid #2c2733;box-shadow:0 3px 0 #2c2733}
#ag .score.scoreHi{color:#17a99a;animation:agpop .45s}#ag .score.scoreMid{color:#2c2733;animation:agpop .35s}#ag .score.scoreLow{color:#d9473a}@keyframes agpop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
#ag .hint{font-size:12px;color:#7b7285;margin-top:8px}
#ag .tbtns{position:absolute;left:0;right:0;bottom:6px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:0 10px;z-index:3}
#ag .tbtns button{margin:0;font:700 15px 'Noto Sans KR',sans-serif;padding:9px 12px;background:#fffdf9;color:#2c2733;border:2px solid #2c2733;border-radius:10px;box-shadow:0 3px 0 #2c2733;min-width:90px}
@media (max-width:1100px){#ag .ag-keys{gap:10px}#ag .ag-keys kbd{min-width:38px;height:30px;font-size:13px}#ag .ag-keys em{font-size:13.5px}}
@media (max-width:760px){#ag .agbox{padding:14px 14px 10px;gap:9px}#ag .ag-keys em{display:none}#ag .ag-ft #agTip{font-size:12.5px}#ag .ag-pb{flex-basis:30%}}
`;
let root, cv, g, W = 0, H = 0, DPR = 1, raf = 0, game = null, resolveFn = null, ended = false, stage = 'off';
const coarse = () => matchMedia('(pointer:coarse)').matches;
const ui = {};
function ensure() {
  if (root) return;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  root = document.createElement('div'); root.id = 'ag'; root.hidden = true;
  root.innerHTML = `<div class="agbox">
    <div class="ag-hd"><span class="ag-day" id="agDay">DAY 1</span><div class="ag-tt"><h3 id="agTitle"></h3><small>루프랩 보안팀, 7일의 방어 · 보안 미니게임</small></div><button class="ag-quit off" id="agRe" type="button">다시하기 (R)</button><button class="ag-quit off" id="agSkip" type="button">포기하기 (G)</button></div>
    <div class="ag-st"><b id="agClock">00:00</b><div class="ag-pb"><i id="agBar"></i></div><span id="agStat"></span><span class="ag-hearts" id="agHearts"></span></div>
    <div class="ag-mon"><div class="ag-monhd"><span><i></i>BUNKER CONTROL / 보안 관제 연결됨</span><span id="agGear"></span></div><div class="ag-cv"><canvas></canvas></div><div class="agcard" id="agCard"></div></div>
    <div class="ag-ft"><span id="agTip"></span><div class="ag-keys" id="agKeys"></div></div>
    <div class="tbtns" id="agT" hidden></div></div>`;
  document.body.appendChild(root); cv = root.querySelector('canvas'); g = cv.getContext('2d');
  for (const id of ['agDay', 'agTitle', 'agSkip', 'agRe', 'agClock', 'agBar', 'agStat', 'agHearts', 'agGear', 'agTip', 'agKeys']) ui[id] = root.querySelector('#' + id);
  addEventListener('resize', size);
  ui.agSkip.onclick = () => { if (stage === 'play') finish(false, 0, true); }; ui.agRe.onclick = () => restart();
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKeyUp, true);
}
function size() { if (!cv) return; const r = cv.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0); }
const $c = () => root.querySelector('#agCard');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FONT = (s, b) => `${b ? '700 ' : ''}${s}px "Noto Sans KR",system-ui,sans-serif`;
const MONO = (s, b = 1) => `${b ? '700 ' : ''}${s}px ui-monospace,Menlo,Consolas,"D2Coding",monospace`;
const JUA = s => `${s}px Jua,"Noto Sans KR",sans-serif`;
const rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const cover = (im, x, y, w, h, fy = 0.3) => { const iw = im.naturalWidth, ih = im.naturalHeight, r = w / h; let sw = iw, sh = iw / r; if (sh > ih) { sh = ih; sw = ih * r; } g.drawImage(im, (iw - sw) / 2, (ih - sh) * fy, sw, sh, x, y, w, h); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
function rr(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/* 어절(띄어쓰기) 단위 줄바꿈 + 줄 길이 고르게(균형) 맞추기. 한 어절이 너무 길 때만 글자 단위로 끊어요 */
function greedy(words, maxW) { const out = []; let line = ''; const W2 = w => g.measureText(w).width;
  for (const w of words) { const tt = line ? line + ' ' + w : w; if (W2(tt) <= maxW || !line) { if (W2(tt) > maxW && !line) { let part = ''; for (const ch of w) { if (W2(part + ch) > maxW && part) { out.push(part); part = ch; } else part += ch; } line = part; } else line = tt; } else { out.push(line); line = ''; if (W2(w) > maxW) { let part = ''; for (const ch of w) { if (W2(part + ch) > maxW && part) { out.push(part); part = ch; } else part += ch; } line = part; } else line = w; } }
  if (line) out.push(line); return out; }
function lines(t, maxW) { const out = []; for (const para of String(t).split('\n')) { const words = para.split(/ +/).filter(Boolean); if (!words.length) { out.push(''); continue; }
    let L = greedy(words, maxW); if (L.length > 1) { let lo = maxW * 0.5, hi = maxW; for (let k = 0; k < 7; k++) { const mid = (lo + hi) / 2; if (greedy(words, mid).length > L.length) lo = mid; else hi = mid; } const B = greedy(words, hi); if (B.length === L.length) L = B; }
    out.push(...L); } return out; }
function wrap(t, x, y, maxW, lh, max = 99) { const L = lines(t, maxW).slice(0, max); L.forEach((l, i) => g.fillText(l, x, y + i * lh)); return L.length; }
/* ---- palette & drawing kit (시안: 크림 카드 + 어두운 관제 모니터) ---- */
const PAL = { mon: '#20253a', panel: '#282e47', panel2: '#2f3550', line: '#3b4262', cream: '#fffdf9', ink: '#2c2733', muted: '#9aa3bf', sub: '#cdd3e6', teal: '#17a99a', tealHi: '#3fd6bd', red: '#d9473a', redHi: '#ff7a6e', orange: '#e08a1e', blue: '#3d7fe0', blueHi: '#6aa7ff', gray: '#7b7285' };
function bg() { g.fillStyle = PAL.mon; g.fillRect(0, 0, W, H); }
function panel(x, y, w, h, r = 12, fill = PAL.panel, stroke = PAL.line) { g.fillStyle = fill; rr(x, y, w, h, r); g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); } }
function card(x, y, w, h, r = 14) { g.fillStyle = '#12131c'; rr(x, y + 4, w, h, r); g.fill(); g.fillStyle = PAL.cream; rr(x, y, w, h, r); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); }
function chip(x, y, t, col, o = {}) { g.font = FONT(o.s || 11.5, 1); const pad = o.pad || 16, tw = g.measureText(t).width + pad, h = o.h || 22; if (o.fill) { g.fillStyle = o.fill; rr(x, y, tw, h, o.r ?? 7); g.fill(); } g.strokeStyle = col; g.lineWidth = 1.5; rr(x, y, tw, h, o.r ?? 7); g.stroke(); g.fillStyle = o.tc || col; g.textAlign = 'left'; g.fillText(t, x + pad / 2, y + h / 2 + 4); return tw; }
function keycap(x, y, label, on, w) { g.font = FONT(13, 1); const tw = w || Math.max(32, g.measureText(label).width + 18); g.fillStyle = '#12131c'; rr(x, y + 3, tw, 28, 7); g.fill(); g.fillStyle = on ? '#ffd75e' : PAL.cream; rr(x, y, tw, 28, 7); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); g.fillStyle = PAL.ink; g.textAlign = 'center'; g.fillText(label, x + tw / 2, y + 19); return tw; }
function toast(fb, fbT, y) { if (!(fbT > 0 && fb)) return; g.globalAlpha = Math.min(1, fbT * 3); g.font = FONT(13.5, 1); const L = lines(fb.t, W - 120).slice(0, 2), tw = Math.min(W - 60, Math.max(...L.map(l => g.measureText(l).width)) + 44), h = 16 + L.length * 19, yy = y ?? H - h - 14;
  g.fillStyle = '#12131c'; rr(W / 2 - tw / 2, yy + 3, tw, h, 10); g.fill(); g.fillStyle = fb.ok ? '#e6f7f2' : '#fdeae7'; rr(W / 2 - tw / 2, yy, tw, h, 10); g.fill(); g.strokeStyle = fb.ok ? PAL.teal : PAL.red; g.lineWidth = 2; g.stroke();
  g.fillStyle = fb.ok ? '#0f6f63' : '#a8322a'; g.textAlign = 'center'; L.forEach((l, i) => g.fillText(l, W / 2, yy + 22 + i * 19)); g.globalAlpha = 1; }
const IMGS = {};
function img(src) { if (!src) return null; if (!IMGS[src]) { const im = new Image(); im.onerror = () => im.bad = true; im.src = src; IMGS[src] = im; } const im = IMGS[src]; return im.complete && im.naturalWidth && !im.bad ? im : null; }
/* ---- 상단 상태줄 (DOM): 시간 · 진행 막대 · 상태 글자 · 하트 ---- */
const BARC = { firewall: '#e08a1e', sort: '#d9473a', mfa: '#3d7fe0', deepcall: '#e08a1e', gate: '#e08a1e', slice: '#17a99a', type: '#d9473a', backup: '#17a99a', redact: '#17a99a', databal: '#7a5af5', greek: '#3d7fe0', cipher: '#17a99a' };
let clockV = null, heartsV = null, playT = 0; const uiCache = {};
function setUI(k, v, fn) { if (uiCache[k] === v) return; uiCache[k] = v; fn(v); }
let clkPrev = null; // 제한 시간 마지막 3·2·1초에 삑 소리
function clock(sec) { clockV = sec; const n = Math.ceil(sec); if (stage === 'play' && !ended && n >= 1 && n <= 3 && clkPrev !== null && n < clkPrev) sound.play('tick'); clkPrev = n; }
function bar(frac, label) { const f = Math.max(0, Math.min(1, frac)); setUI('bar', Math.round(f * 400), v => ui.agBar.style.width = (v / 4) + '%');
  if (label != null) setUI('stat', String(label).replace(/\s*·\s*남은 시간\s*\d+초/, ''), v => ui.agStat.textContent = v); }
function hearts(n, max) { heartsV = [n, max]; }
function flushUI() { const s = clockV != null ? Math.max(0, Math.ceil(clockV)) : Math.floor(playT); setUI('clock', s, v => ui.agClock.textContent = `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`);
  setUI('hearts', heartsV ? heartsV.join('/') : '', v => { ui.agHearts.innerHTML = heartsV ? Array.from({ length: heartsV[1] }, (_, i) => `<span class="${i < heartsV[0] ? '' : 'off'}">♥</span>`).join('') : ''; }); }
/* ---- 하단 안내 · 조작 키 ---- */
const FOOT = {
  firewall: ['노란 테두리 패킷의 앞쪽이 관문에 닿는 순간 판정돼요.', s => (s.data.lanes || []).map((l, k) => [String(k + 1), l.short || l.name])],
  sort: ['보낸 사람 이름보다 회신 주소와 요청 내용을 확인하세요.', () => [['←', '안전'], ['→', '위험 신고']]],
  mfa: ['내가 요청하지 않은 로그인은 승인하지 마세요.', () => [['←', '거부'], ['→', '승인']]],
  deepcall: ['카운트다운 안에 흔적을 잡고, 둘만 아는 질문으로 확인하세요.', () => [['1', '영상'], ['2', '음성'], ['3', '요구'], ['↑↓', '고르기'], ['SPACE', '선택']]],
  gate: ['실제 얼굴과 출입증 사진·정보를 비교하고, 꼬리 물기는 막으세요.', () => [['←', '제지'], ['→', '통과']]],
  slice: ['빨간 선(악성 행동)만 끊고, 파란 선(정상 동작)은 그대로 두세요.', () => [['마우스', '그어서 끊기'], ['Q W E · A D · Z X C', '대상 키']]],
  type: ['경보 카드의 영어 또는 숫자를 그대로 입력하면 바로 막아요.', () => [['영어·숫자', '입력'], ['⌫', '지우기']]],
  backup: ['첫 침입 흔적을 찾고, 그보다 앞선 가장 최근 백업을 선택하세요.', () => [['← →', '시점 선택'], ['SPACE', '복구']]],
  redact: ['개인정보만 가리고, 요약에 필요한 업무 내용은 남겨 주세요.', () => [['← →', '단어 이동'], ['SPACE', '가리기'], ['E', '바로 전송']]],
  databal: ['라벨이 틀린 데이터는 버리고, 저울이 기울지 않게 채우세요.', () => [['←', '버리기'], ['→', '넣기']]],
  factcheck: ['원본에 없는 출처·숫자·법 조항은 AI가 지어냈을 가능성이 커요.', () => [['↑↓ · 1~5', '문장 고르기'], ['SPACE', '지어냄 표시'], ['E', '제출']]],
  greek: ['대응표(키)로 그리스 문자를 한글 자모로 바꿔 입력하세요.', () => [['두벌식', '자모 입력'], ['⌫', '지우기']]],
  cipher: ['카이사르 암호는 가능한 키가 26개라 빠르게 대입할 수 있어요.', () => [['← →', '키 변경'], ['SPACE', '확정']]],
};
/* 시작 전 안내 팝업: 어떻게 하는 게임인지 3단계로 보여 줘요 */
const HOWTO = {
  firewall: ['통로마다 패킷이 관문 쪽으로 흘러오고, 통로마다 통과 규칙이 달라요.', '통로 번호 키(1·2·3)를 누르면 그 통로의 관문이 열리거나 닫혀요.', '빨갛게 반짝이는 패킷은 위험해요. 노란 테두리(다음 판정) 패킷이 닿기 전에, 위험하면 닫고 안전하면 열어요.'],
  sort: ['메일·문자·메신저 카드가 위에서 떨어져요.', '보낸 사람, 회신 주소, 링크, 요청 내용을 꼼꼼히 봐요.', '바닥에 닿기 전에 안전하면 ←, 위험하면 → 로 보내요.'],
  mfa: ['왼쪽 관제 화면에는 지금 실제로 로그인 중인 직원이, 오른쪽 휴대폰에는 로그인 승인 요청이 떠요.', '이름 · 위치 · 기기 · 번호를 양쪽에서 비교해요. 하나라도 다르거나 로그인 중인 직원이 없으면 수상해요.', '본인 요청이면 → 승인, 아니면 ← 거부. 시간이 지나면 자동으로 거부돼요.'],
  deepcall: ['대표님 얼굴과 목소리로 급한 송금을 요구하는 영상통화가 와요. ① 흔적 잡기 → ② 질문하기, 두 단계예요.', '① 장면마다 3·2·1 카운트다운이 돌아요. 그 안에 이상한 흔적을 종류에 맞게 1 영상 · 2 음성 · 3 요구 키로 잡아요. 평범한 장면은 그냥 두세요.', '② ↑↓·Space로 진짜 대표님만 답할 수 있는 질문 2개를 골라요. 둘만 아는 질문에 얼버무리면 가짜라는 증거예요!'],
  gate: ['출입하려는 사람이 한 명씩 다가와요. 왼쪽은 실제 얼굴, 오른쪽은 제시한 출입증이에요.', '얼굴과 사진, 이름, 유효기간(오늘 날짜와 비교), 출입 구역, 카드 리더 결과를 확인해요.', '문제없으면 → 통과, 아니면 ← 제지. 문이 열린 사이 뒤따라오는 사람이 있으면 바로 ← 제지!'],
  slice: ['USB 파일이 실행되면 가운데에서 주변 자원으로 선이 뻗어 나가요.', '빨간 선(악성 행동)은 대상에 닿기 전에 마우스로 그어 끊어요. 대상 옆 글자 키를 눌러도 돼요.', '파란 점선(정상 동작)은 끊지 말고 그대로 두세요.'],
  type: ['공격 경보 카드가 위에서 떨어져요.', '카드에 적힌 영어 글자나 숫자를 그대로 입력해요. 띄어쓰기는 없어요.', '맞게 입력하면 바로 막혀요. 빨간 선에 닿기 전에 막아요.'],
  backup: ['시간순으로 쌓인 기록과 백업 시점이 보여요.', '← → 로 시점을 옮기며 첫 침입 흔적이 언제인지 찾아요.', '침입 직전의 가장 최근 백업에서 SPACE를 눌러 복구해요.'],
  redact: ['파일이 한 줄씩 외부 AI로 전송되기 직전이에요.', '← → 로 단어를 옮기고, 개인정보(이름·연락처·주소 등)에서 SPACE를 눌러 가려요.', '업무 내용은 남겨 두고, 다 가렸으면 E로 바로 전송해요.'],
  databal: ['학습 데이터 카드가 한 장씩 나와요.', '라벨이 틀린 데이터는 ← 버리기, 올바른 데이터는 → 넣기.', '한쪽 집단에 쏠리지 않게 저울의 균형을 맞춰요.'],
  factcheck: ['왼쪽은 원본 자료(사실), 오른쪽은 같은 내용을 요약한 AI 비서 픽스의 답변이에요.', 'AI 답변을 한 문장씩 원본과 비교해요. 원본에 없는 출처·숫자·법 조항이나, 원본과 다른 내용이 있으면 Space(또는 클릭)로 "지어냄" 표시!', '지어낸 문장을 모두 표시했으면 E로 제출해요. 하나라도 놓치거나 사실을 잘못 표시하면 하트가 1개 줄어요.'],
  greek: ['침입자의 메모가 그리스 문자로 적혀 있어요.', '아래 대응표에서 각 그리스 문자에 맞는 한글 자모를 찾아요.', '자모를 두벌식 키보드로 순서대로 입력해 문장을 완성해요.'],
  cipher: ['가로챈 암호문은 글자를 일정한 칸수만큼 밀어 만든 카이사르 암호예요.', '← → 로 키(밀어낸 칸수)를 바꾸면 해독 결과가 바로 보여요.', '말이 되는 문장이 나오면 SPACE로 확정해요.'],
};
function setFrame(spec) {
  ui.agDay.hidden = !spec.day; ui.agDay.textContent = 'DAY ' + (spec.day || '');
  ui.agTitle.textContent = spec.title || '';
  const gear = (spec.boosts || []).filter(b => b.icon).map(b => b.label.replace(/\s*\((설치됨|가방)\)/, '')); ui.agGear.textContent = gear.join('   ·   ');
  const f = FOOT[spec.type] || ['', () => []]; ui.agTip.textContent = spec.tip || f[0];
  ui.agKeys.innerHTML = f[1](spec).map(([k, l]) => `<span><kbd>${esc(k)}</kbd><em>${esc(l)}</em></span>`).join('');
  for (const k in uiCache) delete uiCache[k]; ui.agBar.style.background = BARC[spec.type] || '#e08a1e'; ui.agBar.style.width = '100%'; ui.agStat.textContent = ''; ui.agHearts.innerHTML = ''; ui.agClock.textContent = '00:00';
}
const fx = [];
function pop(x, y, text, col) { fx.push({ x, y, text, col, t: 0 }); }
function drawFx(dt) { for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; if (f.t > 1.1) { fx.splice(i, 1); continue; } g.globalAlpha = Math.max(0, 1 - f.t); g.fillStyle = f.col; g.font = JUA(22); g.textAlign = 'center'; g.fillText(f.text, f.x, f.y - f.t * 40); g.globalAlpha = 1; } }
function tbtns(list) { const tb = root.querySelector('#agT'); if (!coarse() || !list) { tb.hidden = true; tb.innerHTML = ''; return; } tb.hidden = false; tb.innerHTML = list.map((b, i) => `<button type="button" data-i="${i}">${esc(b[0])}</button>`).join(''); tb.querySelectorAll('button').forEach(b => b.onclick = () => list[+b.dataset.i][1]()); }
const api = { end: (ok, score) => finish(ok, score, false) };

/* =================================================================
   1) 터미널 방어 (type) — 떨어지는 공격 로그를 읽고 방어 명령 입력
   ================================================================= */
const IP = () => `${pick([45, 91, 103, 185, 194, 203])}.${rint(10, 250)}.${rint(1, 250)}.${rint(2, 250)}`;
const TPL = {
  brute: () => { const a = IP(); return { sev: 'CRIT', src: 'sshd', msg: `${rint(300, 900)} failed logins from ${a}`, cmd: `block ${a}` }; },
  token: () => { const u = pick(['kang', 'shin', 'yoo', 'hr-bot']); return { sev: 'HIGH', src: 'auth', msg: `session token of '${u}' reused on unknown device`, cmd: `revoke ${u}` }; },
  ransom: () => { const p = rint(1200, 9800); return { sev: 'CRIT', src: 'edr', msg: `pid ${p} encrypting /share/*.docx (${rint(40, 300)} files/s)`, cmd: `kill ${p}` }; },
  lateral: () => { const h = pick(['srv-02', 'db-01', 'web-03', 'nas-01', 'hr-pc7']); return { sev: 'HIGH', src: 'ids', msg: `${h} scanning SMB on 10.0.0.0/24`, cmd: `isolate ${h}` }; },
  exfil: () => { const d = pick(['drop-x.io', 'files-sync.cc', 'cdn-l00plab.net']); return { sev: 'CRIT', src: 'proxy', msg: `${rint(1, 9)}.${rint(1, 9)}GB upload to ${d}`, cmd: `deny ${d}` }; },
  rogue: () => { const n = pick(['svc-temp', 'admin2', 'root_bk', 'it-help']); return { sev: 'HIGH', src: 'iam', msg: `new admin account '${n}' created 03:${rint(10, 59)}`, cmd: `disable ${n}` }; },
  update: () => { const p = pick(['agent-7.2', 'vpn-3.1', 'office-9']); return { sev: 'MED', src: 'pkg', msg: `unsigned update ${p} pushed to 42 hosts`, cmd: `verify ${p}` }; },
  logwipe: () => { const h = pick(['srv-02', 'db-01', 'fw-01']); return { sev: 'HIGH', src: 'auditd', msg: `audit log cleared on ${h}`, cmd: `audit ${h}` }; },
  inject: () => { const n = rint(10, 99); return { sev: 'HIGH', src: 'ai-gw', msg: `hidden instruction in doc-${n} sent to AI assistant`, cmd: `quarantine doc-${n}` }; },
};
const SEVK = { CRIT: { t: '긴급', c: '#d9473a' }, HIGH: { t: '위험', c: '#e08a1e' }, MED: { t: '주의', c: '#6aa7ff' } };
const KRSRC = { sshd: '무차별 로그인 시도', auth: '세션 토큰 재사용', edr: '악성 프로세스 실행', ids: '내부 확산 시도', proxy: '수상한 외부 전송', iam: '계정 권한 악용', pkg: '서명 없는 업데이트', auditd: '기록 삭제 시도', 'ai-gw': 'AI 지시 주입' };
const SEVC = { CRIT: '#ff5a6e', HIGH: '#ffb84d', MED: '#7cc4ff' };
function GAME_type(spec) {
  const T = spec.time || 60, need = spec.data.need || 8, slow = spec.mod?.slow ? 1.35 : 1, set = spec.data.set || Object.keys(TPL);
  let left = T, hp = 3, buf = '', killed = 0, list = [], spawn = 0.3, shake = 0, out = [`looplab-soc defense shell v2.4 — ${set.length} threat feeds online`, `type the code shown on each alert — letters only or numbers only, no spaces`];
  const cols = 3, floor = () => H - 104; globalThis.__agType = () => list.map(a => a.cmd); // 안내 화면 캡처용
  // 한 카드에는 '영어 글자만' 또는 '숫자만' 나와요 (띄어쓰기·특수문자 없음)
  const mk = () => { for (let tries = 0; tries < 20; tries++) { const a = TPL[pick(set)](), [verb, tgt = ''] = a.cmd.split(' '); let cmd, kind;
      if (Math.random() < 0.5) { kind = 'abc'; const tl = tgt.replace(/[^a-z]/g, ''); cmd = verb.length >= 7 || !tl ? verb : verb + tl.slice(0, 5); }
      else { kind = '123'; const d = tgt.replace(/\D/g, ''); cmd = d.length >= 3 ? d.slice(-5) : String(rint(1000, 99999)); }
      if (!list.some(q => q.cmd.startsWith(cmd) || cmd.startsWith(q.cmd))) return { ...a, cmd, kind }; } return null; };
  const say = (s, c = '#9fb3c8') => { out.push([s, c]); if (out.length > 5) out.shift(); };
  const kill = a => { list.splice(list.indexOf(a), 1); killed++; sound.play('done'); pop(a.x + a.w / 2, a.y, 'BLOCKED', '#5ef2b0'); say(`[ok] ${a.cmd}  → ${a.src} rule applied`, '#5ef2b0'); buf = ''; touch(); if (killed >= need) api.end(true, Math.max(0.35, 0.45 + hp / 3 * 0.35 + left / T * 0.2)); };
  const submit = () => { if (!buf.trim()) return; const a = list.find(q => q.cmd === buf.trim()); if (a) return kill(a); say(`bash: '${buf}' — 일치하는 위협 없음`, '#ff8fa3'); shake = 0.3; sound.play('alert'); buf = ''; };
  const touch = () => tbtns(list.length ? shuffle([...new Set([...list.map(a => a.cmd), ...list.map(a => a.kind === '123' ? String(rint(1000, 99999)) : a.cmd.slice(0, -1) + 'x')])]).slice(0, 5).map(c => [c, () => { buf = c; submit(); }]) : null);
  return {
    key(code, down, e) { if (!down) return;
      if (code === 'Backspace') { buf = buf.slice(0, -1); return; }
      let ch = ''; if (code === 'Space') return; else if (/^Key[A-Z]$/.test(code)) ch = code.slice(3).toLowerCase(); else if (/^Digit\d$/.test(code)) ch = code.slice(5); else if (/^Numpad\d$/.test(code)) ch = code.slice(6);
      else if (code === 'Minus' || code === 'NumpadSubtract') ch = e.shiftKey ? '_' : '-'; else if (code === 'Period' || code === 'NumpadDecimal') ch = '.'; else if (code === 'Slash') ch = '/';
      if (ch) { buf += ch; const t = buf.trimStart(); if (list.some(q => q.cmd === t)) return submit(); if (t && !list.some(q => q.cmd.startsWith(t))) return submit(); } },
    update(dt) { left -= dt; shake = Math.max(0, shake - dt); spawn -= dt; const prog = 1 - left / T;
      if (spawn <= 0 && list.length < 5) { spawn = rnd(1.25, 1.9) * (1 - prog * 0.3) * (slow > 1 ? 1.15 : 1);
        const a = mk(); const free = !a ? [] : [0, 1, 2].filter(c => !list.some(q => q.col === c && q.y < 140)); if (free.length) { const c = pick(free); list.push({ ...a, col: c, y: 10, v: (floor() - 82) / ((7.2 - prog * 2.4) * slow) }); touch(); } }
      for (const a of [...list]) { a.y += a.v * dt; if (a.y > floor() - 72) { list.splice(list.indexOf(a), 1); hp--; sound.play('alert'); say(`[!!] ${a.src}: ${a.msg} — 서버 도달`, '#ff5a6e'); touch(); if (hp <= 0) return api.end(false, killed / need * 0.5); } }
      if (left <= 0) api.end(killed >= need * 0.75, killed / need * 0.8); },
    draw(dt, t) { bg(); clock(left); bar(killed / need, `차단 ${killed} / ${need}`); hearts(hp, 3);
      const cw = (W - 40) / 3, tb = buf.trimStart(), target = tb ? list.filter(a => a.cmd.startsWith(tb)).sort((a, b) => b.y - a.y)[0] : null;
      for (const a of list) { a.w = cw - 18; a.x = 20 + a.col * cw + 9; const lv = SEVK[a.sev] || SEVK.MED, on = a === target;
        g.fillStyle = on ? '#2c3a4a' : PAL.panel; rr(a.x, a.y, a.w, 72, 10); g.fill(); g.strokeStyle = on ? PAL.tealHi : lv.c; g.lineWidth = 2; g.stroke();
        chip(a.x + 12, a.y + 10, `${lv.t} · ${KRSRC[a.src] || a.src}`, lv.c, { s: 11, h: 20 }); g.fillStyle = a.kind === '123' ? '#ffd75e' : '#9fe3d3'; g.font = FONT(11, 1); g.textAlign = 'right'; g.fillText(a.kind === '123' ? '숫자' : '영어', a.x + a.w - 12, a.y + 25);
        g.font = MONO(17); g.textAlign = 'left'; const typed = on ? tb : ''; g.fillStyle = PAL.tealHi; g.fillText('$ ' + typed, a.x + 14, a.y + 56); g.fillStyle = '#fff'; g.fillText(a.cmd.slice(typed.length), a.x + 14 + g.measureText('$ ' + typed).width, a.y + 56); }
      const fy = floor(); g.strokeStyle = PAL.red; g.lineWidth = 2; g.beginPath(); g.moveTo(16, fy); g.lineTo(W - 16, fy); g.stroke();
      g.fillStyle = '#ff9a90'; g.font = FONT(11.5, 1); g.textAlign = 'left'; g.fillText('서버 방어선 · 경보가 닿기 전에 명령을 입력하세요', 16, fy + 17);
      const lo = out[out.length - 1]; if (lo) { const [s, c] = Array.isArray(lo) ? lo : [lo, '#7d86a6']; g.fillStyle = c; g.font = MONO(11.5, 0); g.textAlign = 'right'; g.fillText(s.length > 80 ? s.slice(0, 78) + '…' : s, W - 16, fy + 17); }
      const ix = 16 + (shake ? Math.sin(t * 90) * 5 : 0), iy = H - 58; g.fillStyle = '#151827'; rr(ix, iy, W - 32, 46, 10); g.fill(); g.strokeStyle = shake ? PAL.red : '#5a6286'; g.lineWidth = 2; g.stroke();
      g.font = MONO(19); g.fillStyle = PAL.tealHi; g.textAlign = 'left'; g.fillText('$', ix + 18, iy + 30); g.fillStyle = '#fff'; g.fillText(buf, ix + 42, iy + 30); const bw = g.measureText(buf).width;
      if (Math.sin(t * 7) > -0.2) { g.fillStyle = PAL.tealHi; g.fillRect(ix + 44 + bw, iy + 12, 10, 22); }
    },
  };
}

/* =================================================================
   2) 메일·메시지 분류 (sort) — 빠르게 떨어지는 카드를 ← 안전 / → 위험
   ================================================================= */
function GAME_sort(spec) {
  const cards = shuffle(spec.data.cards).slice(0, spec.data.count || 10).map(c => ({ ...c, tilt: (Math.random() < 0.5 ? -1 : 1) * rnd(0.014, 0.034) })), n = cards.length, slow = spec.mod?.slow ? 1.3 : 1;
  const Ltxt = spec.data.left || '안전', Rtxt = spec.data.right || '위험 · 신고';
  let i = 0, y = -200, lives = 3, right = 0, fb = null, fbT = 0, slide = 0, dir = 0, pause = 0;
  const CH = 214;
  const decide = d => { if (dir || i >= n || pause > 0) return; const c = cards[i], ok = (d > 0) === !!c.bad;
    if (ok) { right++; sound.play('store'); fb = { ok: true, t: `✓ ${c.type || (c.bad ? '위험' : '정상')}` }; fbT = 0.9; }
    else { lives--; sound.play('alert'); fb = { ok: false, t: `✗ ${c.type ? c.type + ' — ' : ''}${c.why || ''}` }; fbT = 2.6; pause = 1.6; }
    dir = d; };
  tbtns([['← ' + Ltxt, () => decide(-1)], [Rtxt + ' →', () => decide(1)]]);
  return {
    key(code, down) { if (!down) return; if (['ArrowLeft', 'KeyA'].includes(code)) decide(-1); if (['ArrowRight', 'KeyD'].includes(code)) decide(1); },
    update(dt) { fbT = Math.max(0, fbT - dt); pause = Math.max(0, pause - dt);
      if (dir) { slide += dir * dt * 2400; if (Math.abs(slide) > W) { slide = 0; dir = 0; i++; y = -200; if (lives <= 0) return api.end(false, right / n * 0.6); if (i >= n) return api.end(right >= n - 2, right / n); } return; }
      if (pause > 0 || i >= n) return;
      const fall = Math.max(3.0, (spec.data.fall || 5.4) - i * 0.22) * slow;
      y += (H - 64 - CH + 200) / fall * dt;
      if (y > H - 64 - CH) { const c = cards[i]; lives--; sound.play('alert'); fb = { ok: false, t: `⏱ 시간 초과 — ${c.type ? c.type + ': ' : ''}${c.why || ''}` }; fbT = 2.6; pause = 1.4; dir = c.bad ? 1 : -1; } },
    draw(dt, t) { bg(); bar(1 - i / n, `오분류 ${3 - lives} / 3 · 남은 메시지 ${n - i}`); hearts(lives, 3);
      const bw = Math.min(540, W - 330), bx = W / 2 - bw / 2, fl = H - 64;
      const zone = (x, ok) => { g.textAlign = 'center'; g.fillStyle = ok ? PAL.tealHi : PAL.redHi; g.font = JUA(44); g.fillText(ok ? '✓' : '!', x, H / 2 - 34); g.fillStyle = '#fff'; g.font = JUA(26); g.fillText(ok ? Ltxt : Rtxt, x, H / 2 + 6); g.fillStyle = PAL.muted; g.font = FONT(12.5); g.fillText(ok ? '신뢰할 수 있는 메시지' : '의심스러운 단서 발견', x, H / 2 + 30);
        g.fillStyle = ok ? PAL.tealHi : PAL.redHi; g.font = FONT(13, 1); g.fillText(ok ? '← 또는 A' : '→ 또는 D', x, H / 2 + 54); };
      zone(bx / 2, true); zone(bx + bw + (W - bx - bw) / 2, false);
      g.strokeStyle = PAL.red; g.setLineDash([11, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(22, fl); g.lineTo(W - 22, fl); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#ff9a90'; g.font = FONT(11.5, 1); g.textAlign = 'left'; g.fillText('이 선에 닿기 전에 분류하세요', 22, fl + 19);
      if (i < n) { const c = cards[i], cx = bx + slide, cy = y, cw = bw;
        g.save(); g.translate(cx + cw / 2, cy + CH / 2); g.rotate(c.tilt + slide / W * 0.35); g.translate(-(cx + cw / 2), -(cy + CH / 2));
        card(cx, cy, cw, CH, 14);
        const kind = { ai: 'AI 비서', sms: '문자', chat: '메신저', call: '음성 메시지' }[c.kind] || '메일', kc = { ai: '#7a5af5', sms: PAL.teal, chat: PAL.orange, call: PAL.red }[c.kind] || PAL.blue;
        chip(cx + 18, cy + 16, kind, kc, { s: 11, h: 21 }); if (c.time) { g.fillStyle = PAL.gray; g.font = FONT(11.5); g.textAlign = 'right'; g.fillText(c.time, cx + cw - 18, cy + 31); }
        g.fillStyle = PAL.ink; g.font = JUA(21); g.textAlign = 'left'; wrap(c.subj || (kind + '가 도착했어요'), cx + 18, cy + 66, cw - 36, 23, 1);
        let yy = cy + 92; const field = (k, v) => { g.fillStyle = PAL.gray; g.font = FONT(12.5); g.fillText(k, cx + 18, yy); g.fillStyle = PAL.ink; g.font = FONT(12.5, 1); wrap(v, cx + 92, yy, cw - 110, 15, 1); yy += 19; };
        field('보낸 사람', c.from); if (c.reply) field('회신 주소', c.reply);
        g.strokeStyle = '#e4dee8'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 18, yy - 6); g.lineTo(cx + cw - 18, yy - 6); g.stroke();
        g.fillStyle = PAL.ink; g.font = FONT(13.5); yy += 12; yy += (wrap(c.text, cx + 18, yy, cw - 36, 18, 3) - 1) * 18;
        if (c.att) { g.font = FONT(11.5, 1); const aw = g.measureText('첨부 · ' + c.att).width + 18; yy += 14; g.strokeStyle = PAL.ink; g.lineWidth = 1.5; rr(cx + 18, yy, aw, 22, 7); g.stroke(); g.fillStyle = PAL.ink; g.fillText('첨부 · ' + c.att, cx + 27, yy + 15); }
        g.restore(); }
      toast(fb, fbT, 10);
    },
  };
}

/* =================================================================
   3) 방화벽 관문 (firewall) — 1·2·3으로 구역별 관문을 여닫아 패킷 통과/차단
   ================================================================= */
function GAME_firewall(spec) {
  const T = spec.time || 42, lanes = spec.data.lanes, pk = spec.data.packets, hint = !!spec.mod?.hint;
  const open = lanes.map(() => false); let left = T, list = [], spawn = 0.4, lives = 3, good = 0, total = 0, blockedOk = 0;
  const toggle = k => { if (k >= lanes.length) return; open[k] = !open[k]; sound.play('click'); };
  const tx0 = () => Math.max(190, W * 0.21), gateX = () => W * 0.73, pxOf = p => tx0() + 26 + p.x / 0.78 * (gateX() - tx0() - 26);
  tbtns(lanes.map((l, k) => [`${k + 1} · ${l.short || l.name}`, () => toggle(k)]));
  return {
    key(code, down) { if (!down) return; const m = code.match(/^(?:Digit|Numpad)([1-9])$/); if (m) toggle(+m[1] - 1); const q = { KeyQ: 0, KeyW: 1, KeyE: 2 }[code]; if (q != null) toggle(q); },
    update(dt) { left -= dt; spawn -= dt; const prog = 1 - left / T;
      if (spawn <= 0) { spawn = rnd(0.75, 1.25) * (1 - prog * 0.3); const p = pick(pk), inLane = list.filter(q => q.lane === p.lane && !q.dead);
        const lastQ = inLane.sort((a, b) => a.x - b.x)[0];
        if (!lastQ || lastQ.x > 0.36) { g.font = FONT(13, 1); const w = g.measureText((hint ? '✓ ' : '') + p.label).width + 26; let v = rnd(0.16, 0.19) * (1 + prog * 0.55); if (lastQ) v = Math.min(v, lastQ.v); list.push({ ...p, x: 0, v, w }); } }
      for (const p of [...list]) {
        if (p.dead) { p.deadT -= dt; if (p.deadT <= 0) list.splice(list.indexOf(p), 1); continue; }
        p.x += p.v * dt; const y = laneY(p.lane);
        if (!p.judged && pxOf(p) + p.w / 2 >= gateX() - 12) { p.judged = true; total++;
          if (open[p.lane]) { if (p.ok) { good++; pop(gateX() + 60, y - 30, '통과', '#3fd6bd'); } else { lives--; sound.play('alert'); pop(gateX() + 60, y - 30, '침입!', '#ff7a6e'); p.breach = true; } }
          else { p.dead = true; p.deadT = 0.5; if (p.ok) { p.jam = true; pop(gateX() - 60, y - 30, '업무 막힘', '#ffb84d'); } else { good++; blockedOk++; pop(gateX() - 60, y - 30, '차단!', '#3fd6bd'); } }
          if (lives <= 0) return api.end(false, good / Math.max(1, total) * 0.5); }
        if (p.x > 1.1) list.splice(list.indexOf(p), 1); }
      if (left <= 0) { const s = good / Math.max(1, total); api.end(s >= 0.7, s); } },
    draw(dt, t) { bg(); clock(left); bar(left / T, `허용·차단 판단 중 · 정확도 ${total ? Math.round(good / total * 100) : 100}%`); hearts(lives, 3);
      const n = lanes.length, top = 8, rowH = (H - 16) / n, lx = 26, tx0 = Math.max(190, W * 0.21), gx = W * 0.73, sw = Math.min(120, W * 0.12), sx = gx + 30, kx = sx + sw + 16;
      lanes.forEach((l, k) => { const y = top + rowH * (k + 0.5);
        if (k) { g.strokeStyle = PAL.line; g.lineWidth = 1; g.beginPath(); g.moveTo(lx, top + rowH * k); g.lineTo(W - 22, top + rowH * k); g.stroke(); }
        g.fillStyle = '#fff'; g.font = JUA(20); g.textAlign = 'left'; g.fillText(l.name, lx, y - 3); g.fillStyle = PAL.muted; g.font = FONT(12); wrap(l.rule, lx, y + 17, tx0 - lx - 16, 15, 2);
        g.fillStyle = '#262c44'; rr(tx0, y - 30, gx - tx0 - 22, 60, 10); g.fill(); g.setLineDash([5, 5]); g.strokeStyle = '#4a5274'; g.lineWidth = 1.3; g.stroke(); g.setLineDash([]);
        g.fillStyle = '#5c6386'; g.font = FONT(15, 1); g.textAlign = 'right'; g.fillText('→ →', gx - 40, y + 5);
        const oc = open[k] ? PAL.teal : PAL.red; g.save(); g.shadowColor = open[k] ? '#2fe3c6' : '#ff5a4e'; g.shadowBlur = 22; g.fillStyle = open[k] ? 'rgba(23,169,154,.30)' : 'rgba(217,71,58,.28)'; rr(gx - 17, y - 46, 34, 92, 17); g.fill(); g.restore();
        g.fillStyle = oc; rr(gx - 7, y - 33, 14, 66, 7); g.fill();
        g.fillStyle = open[k] ? '#7ff0dc' : '#ff9a90'; g.font = FONT(11.5, 1); g.textAlign = 'center'; g.fillText(open[k] ? '열림' : '닫힘', gx, y - 52);
        panel(sx, y - 31, sw, 62, 10, '#353b56', '#7a82a6'); g.fillStyle = '#e9ecf5'; g.font = FONT(12, 1); g.textAlign = 'center'; g.fillText('▤', sx + sw / 2, y - 6); g.fillText(l.dest || '서버', sx + sw / 2, y + 15);
        keycap(kx, y - 15, String(k + 1), open[k], 36); });
      const nextOf = {}; for (const p of list) if (!p.judged && !p.dead && (!nextOf[p.lane] || p.x > nextOf[p.lane].x)) nextOf[p.lane] = p;
      g.save(); g.beginPath(); g.rect(tx0 + 2, 0, W - tx0, H); g.clip();
      for (const p of list) { const y = top + rowH * (p.lane + 0.5), x = pxOf(p), tw = p.w; if (x > W - 10) continue; const lab = hint ? (p.ok ? '✓ ' : '! ') + p.label : p.label;
        g.globalAlpha = p.dead ? Math.max(0, p.deadT / 0.5) : 1; const nx = nextOf[p.lane] === p;
        const bad = !p.ok && !p.dead && !p.breach, on = hint ? 1 : 0.5 + 0.5 * Math.sin(t * 9);
        g.fillStyle = p.breach ? PAL.red : p.dead ? '#3a2430' : '#1c2b3a'; rr(x - tw / 2, y - 17, tw, 34, 8); g.fill();
        if (bad) { g.save(); g.globalAlpha *= hint ? 0.85 : 0.25 + 0.6 * on; g.shadowColor = '#ff4a3d'; g.shadowBlur = hint ? 10 : 8 + 14 * on; g.fillStyle = '#b8323a'; rr(x - tw / 2, y - 17, tw, 34, 8); g.fill(); g.restore(); }
        g.lineWidth = nx ? 3 : 2; g.strokeStyle = nx ? '#ffd75e' : p.breach ? '#ffb1a8' : bad ? (hint || on > 0.5 ? '#ff6a5e' : '#8f97b8') : hint ? PAL.teal : '#8f97b8'; g.stroke();
        g.fillStyle = '#fff'; g.font = FONT(13, 1); g.textAlign = 'center'; g.fillText(lab, x, y + 5);
        if (p.dead) { g.strokeStyle = p.jam ? '#ffb84d' : PAL.tealHi; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 10, y - 10); g.lineTo(x + 10, y + 10); g.moveTo(x + 10, y - 10); g.lineTo(x - 10, y + 10); g.stroke(); }
        if (nx) { const d = gateX() - 12 - (x + tw / 2); if (d < 120) { g.fillStyle = '#ffd75e'; g.font = FONT(11, 1); g.fillText('다음 판정', x, y - 24); } }
        g.globalAlpha = 1; }
      g.restore();
    },
  };
  function laneY(k) { return 8 + (k + 0.5) * ((H - 16) / lanes.length); }
}

/* =================================================================
   4) MFA 푸시 폭탄 (mfa) — 실제 로그인 화면과 맞는 요청만 Y 승인
   ================================================================= */
function GAME_mfa(spec) {
  const n = spec.data.count || 12, match = true, T0 = spec.mod?.match ? 5.6 : 4, people = spec.data.people || ['서보안', '홍채린', '강차단', '신무결', '유복구'];
  const seq = []; for (let k = 0; k < n; k++) { const legit = Math.random() < 0.45; const who = pick(people); const code = rint(10, 99);
    if (legit) seq.push({ legit, who, where: '루프랩 사무실', dev: pick(['업무 PC', '업무 노트북']), code, shown: code, why: '' });
    else { const kind = pick(['bomb', 'abroad', 'mismatch', 'mismatch', 'night']);
      if (kind === 'mismatch') seq.push({ legit, screen: true, who, where: '루프랩 사무실', dev: '업무 PC', code, shown: (code + rint(3, 40)) % 80 + 10, why: '관제 화면 번호와 휴대폰 요청 번호가 달라요 — 누군가 같은 계정으로 동시에 로그인 중!' });
      else if (kind === 'abroad') seq.push({ legit, who, where: pick(['상트페테르부르크', '라고스', '알 수 없음(VPN)']), dev: '알 수 없는 브라우저', code, shown: null, why: '본인이 로그인하지 않은 해외 위치예요' });
      else if (kind === 'night') seq.push({ legit, who, where: '서울(가정 IP?)', dev: 'Linux · curl', code, shown: null, why: '사람이 아닌 프로그램(curl)이 로그인해요' });
      else seq.push({ legit, who, where: '루프랩 사무실(?)', dev: '같은 요청 반복 ×6', code, shown: null, why: '거절해도 계속 보내는 푸시 폭탄이에요' }); } }
  // 번호 불일치(관제 화면에 로그인 중인 직원이 있는데 휴대폰 요청 번호가 다름)는 판마다 최소 3번, 첫 번째는 앞쪽(2~3번째)에 꼭 나와요
  const mm = k => { const who = pick(people), code = rint(10, 99); let sh = rint(10, 99); while (sh === code) sh = rint(10, 99); seq[k] = { legit: false, screen: true, who, where: '루프랩 사무실', dev: pick(['업무 PC', '업무 노트북']), code, shown: sh, why: `관제 화면 번호(${code})와 휴대폰 요청 번호(${sh})가 달라요 — 누군가 같은 계정으로 동시에 로그인 중!` }; };
  { const slots = shuffle([...Array(n).keys()].filter(k => k > 3)).slice(0, 2); [rint(1, 2), ...slots].forEach(mm); }
  let i = 0, tleft = T0, lives = 3, right = 0, fb = null, fbT = 0;
  const answer = yes => { if (i >= n || fbT > 0.9) return; const p = seq[i]; const ok = yes === p.legit;
    if (ok) { right++; sound.play('store'); fb = { ok: true, t: yes ? '✓ 본인 로그인 승인' : '✓ 거부 — ' + p.why }; }
    else { lives--; sound.play('alert'); fb = { ok: false, t: yes ? '✗ 공격자에게 문을 열어 줬어요 — ' + p.why : '✗ 본인 로그인을 막았어요 (업무 지연)' }; }
    fbT = ok ? 1.0 : 2.0; i++; tleft = Math.max(T0 * 0.6, T0 - i * 0.14); if (lives <= 0) setTimeout(() => api.end(false, right / n * 0.6), 400); else if (i >= n) setTimeout(() => api.end(right >= n - 2, right / n), 700); };
  tbtns([['← 거부', () => answer(false)], ['승인 →', () => answer(true)]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowRight' || code === 'KeyD') answer(true); if (code === 'ArrowLeft' || code === 'KeyA') answer(false); },
    update(dt) { fbT = Math.max(0, fbT - dt); if (i < n && fbT <= 0.9) { tleft -= dt; if (tleft <= 0) { const p = seq[i]; if (p.legit) { fb = { ok: false, t: '⏱ 응답이 없어 본인 로그인이 실패했어요' }; } else { right++; fb = { ok: true, t: '⏱ 응답 없음 → 자동 거부 (안전)' }; } fbT = 1.4; i++; tleft = Math.max(T0 * 0.6, T0 - i * 0.14); if (i >= n) setTimeout(() => api.end(right >= n - 2, right / n), 600); } } },
    draw(dt, t) { bg(); bar(1 - i / n, `요청 대조 중 · ${Math.min(i + 1, n)} / ${n}`); hearts(lives, 3);
      const p = seq[Math.min(i, n - 1)], top = 18, lx = 24, lw = Math.min(W * 0.48, 560);
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText('관제 화면 / 실제 로그인 중인 직원', lx, top + 10);
      const ch = Math.min(232, H - 110); card(lx, top + 24, lw, ch);
      if (i < n && (p.legit || p.screen)) { g.fillStyle = PAL.ink; g.font = JUA(24); g.fillText(p.who, lx + 22, top + 64); g.font = JUA(24); const nw = g.measureText(p.who).width; chip(lx + 30 + nw, top + 46, '로그인 중', PAL.teal, { s: 11, h: 21 });
        g.font = FONT(13.5); g.fillStyle = PAL.gray; g.fillText('위치', lx + 22, top + 96); g.fillText('기기', lx + 22, top + 120); g.fillStyle = PAL.ink; g.fillText(p.where, lx + 64, top + 96); g.fillText(p.dev, lx + 64, top + 120);
        if (match) { g.strokeStyle = '#e4dee8'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx + 22, top + 138); g.lineTo(lx + lw - 22, top + 138); g.stroke(); g.fillStyle = PAL.gray; g.font = FONT(13); g.fillText('직원에게 표시된 번호', lx + 22, top + 162); g.fillStyle = PAL.blue; g.font = JUA(50); g.fillText(String(p.code), lx + 22, top + 212); } }
      else { g.fillStyle = PAL.gray; g.font = JUA(20); g.fillText('지금 로그인 중인 직원이 없어요', lx + 22, top + 70); g.font = FONT(13); wrap('아무도 로그인하지 않았는데 승인 요청이 왔다면, 누군가 비밀번호를 알고 시도하는 거예요.', lx + 22, top + 100, lw - 44, 19, 3); }
      g.fillStyle = PAL.muted; g.font = FONT(12.5); wrap('요청의 이름 · 위치 · 기기 · 번호를 대조하세요.', lx, top + 24 + ch + 28, lw, 17, 2);
      const pw = Math.min(330, W * 0.33), ph = Math.min(H - 40, 380), px = lx + lw + Math.max(30, (W - lx - lw - pw) / 2), py = (H - ph) / 2;
      g.fillStyle = '#151827'; rr(px, py, pw, ph, 34); g.fill(); g.strokeStyle = '#6a7194'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#4c5373'; rr(px + pw / 2 - 40, py + 14, 80, 6, 3); g.fill();
      if (i < n) { const sh = tleft < 1 ? Math.sin(t * 30) * 2 : 0, sx = px + 18 + sh, sy = py + 34, sw2 = pw - 36, shh = ph - 52; g.fillStyle = PAL.cream; rr(sx, sy, sw2, shh, 18); g.fill();
        chip(sx + 16, sy + 16, '로그인 승인 요청', PAL.blue, { s: 11, h: 21 }); g.fillStyle = PAL.ink; g.font = JUA(24); g.textAlign = 'left'; g.fillText(p.who, sx + 16, sy + 70);
        g.font = FONT(13); g.fillStyle = PAL.gray; g.fillText('위치', sx + 16, sy + 100); g.fillText('기기', sx + 16, sy + 122); g.fillStyle = PAL.ink; wrap(p.where, sx + 54, sy + 100, sw2 - 64, 15, 1); wrap(p.dev, sx + 54, sy + 122, sw2 - 64, 15, 1);
        g.strokeStyle = '#e4dee8'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + 16, sy + 140); g.lineTo(sx + sw2 - 16, sy + 140); g.stroke();
        if (match) { g.fillStyle = PAL.gray; g.font = FONT(13); g.fillText('요청 번호', sx + 16, sy + 176); g.fillStyle = PAL.blue; g.font = JUA(34); g.fillText(p.shown == null ? '—' : String(p.shown), sx + 86, sy + 180); }
        g.fillStyle = '#ece7ef'; rr(sx + 16, sy + shh - 96, sw2 - 32, 7, 4); g.fill(); g.fillStyle = tleft < 1.2 ? PAL.red : PAL.blue; rr(sx + 16, sy + shh - 96, (sw2 - 32) * Math.max(0, tleft / T0), 7, 4); g.fill();
        const bw2 = (sw2 - 44) / 2, by = sy + shh - 70; g.fillStyle = PAL.ink; rr(sx + 16, by + 4, bw2, 44, 10); g.fill(); rr(sx + 28 + bw2, by + 4, bw2, 44, 10); g.fill();
        g.fillStyle = '#efeaf0'; rr(sx + 16, by, bw2, 44, 10); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); g.fillStyle = PAL.blue; rr(sx + 28 + bw2, by, bw2, 44, 10); g.fill(); g.stroke();
        g.font = JUA(19); g.textAlign = 'center'; g.fillStyle = PAL.ink; g.fillText('← 거부', sx + 16 + bw2 / 2, by + 29); g.fillStyle = '#fff'; g.fillText('승인 →', sx + 28 + bw2 * 1.5, by + 29); }
      toast(fb, fbT);
    },
  };
}

/* =================================================================
   5) 줄 단위 검토 (review) — ↑↓로 이동, 스페이스로 표시, Enter로 제출
      딥페이크 통화 기록, AI 답변 팩트체크 등에 사용
   ================================================================= */
function GAME_review(spec) {
  const L = spec.data.lines, T = spec.time || 45, img = spec.data.img ? Object.assign(new Image(), { src: spec.data.img }) : null, reveal = spec.data.reveal ?? 1.4;
  let left = T, shown = 1, rt = reveal, cur = 0, mark = L.map(() => false), done = false, review = 0;
  const submit = () => { if (done) return; done = true; review = 3.2; sound.play('click');
    const need = L.filter(l => l.flag).length; let tp = 0, fp = 0; L.forEach((l, k) => { if (mark[k] && l.flag) tp++; if (mark[k] && !l.flag) fp++; });
    const s = Math.max(0, (tp - fp * 0.7) / need); setTimeout(() => api.end(s >= 0.6, s), 3000); };
  tbtns([['↑', () => cur = Math.max(0, cur - 1)], ['↓', () => cur = Math.min(shown - 1, cur + 1)], ['표시', () => { if (!done) mark[cur] = !mark[cur]; }], ['제출', submit]]);
  return {
    key(code, down) { if (!down || done) return; if (code === 'ArrowUp' || code === 'KeyW') cur = Math.max(0, cur - 1); if (code === 'ArrowDown' || code === 'KeyS') cur = Math.min(shown - 1, cur + 1);
      if (code === 'Space') { mark[cur] = !mark[cur]; sound.play('page'); } if (code === 'KeyE') submit(); },
    update(dt) { if (done) { review -= dt; return; } left -= dt; rt -= dt; if (rt <= 0 && shown < L.length) { shown++; rt = reveal; if (cur === shown - 2) cur = shown - 1; } if (left <= 0) submit(); },
    draw(dt, t) { g.fillStyle = '#121a2e'; g.fillRect(0, 0, W, H); bar(left / T, done ? '결과 확인 중…' : `표시 ${mark.filter(Boolean).length}개 · 남은 시간 ${Math.ceil(left)}초`, '#ffd75e');
      let x0 = 20; if (img) { const S = Math.min(200, W * 0.24); g.save(); rr(20, 60, S, S, 14); g.clip(); if (img.complete && img.naturalWidth) g.drawImage(img, 20, 60, S, S);
        if (spec.data.glitch) for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(120,255,220,.14)'; g.fillRect(20, 60 + ((t * 80 + k * 60) % S), S, 5); } g.restore();
        g.fillStyle = '#cfe0ff'; g.font = FONT(12, 1); g.textAlign = 'left'; wrap(spec.data.caption || '', 20, 60 + S + 20, S, 15, 3); x0 = 40 + S; }
      const lw = W - x0 - 20, lh = Math.min(50, (H - 120) / L.length);
      g.fillStyle = '#9fb3e8'; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText(spec.data.head || '수상한 줄에 표시하세요', x0, 66);
      for (let k = 0; k < shown; k++) { const l = L[k], y = 80 + k * lh; const on = k === cur && !done;
        let bg = on ? '#26365e' : '#1a2340'; if (done) bg = l.flag && mark[k] ? '#1e5a3e' : l.flag ? '#6a5320' : mark[k] ? '#5a1e2c' : '#1a2340';
        g.fillStyle = bg; rr(x0, y, lw, lh - 6, 8); g.fill(); if (on) { g.strokeStyle = '#ffd75e'; g.lineWidth = 2; g.stroke(); }
        g.fillStyle = mark[k] ? '#ff8fa3' : '#5c6b80'; g.font = FONT(15, 1); g.fillText(mark[k] ? '⚑' : '·', x0 + 10, y + lh / 2 + 2);
        g.fillStyle = '#9fb3e8'; g.font = FONT(11.5, 1); g.fillText(l.who || '', x0 + 30, y + 15);
        g.fillStyle = '#e9f1ff'; g.font = FONT(13.5); wrap(k === shown - 1 && !done ? l.t.slice(0, Math.ceil(l.t.length * (1 - rt / reveal) * 1.6)) : l.t, x0 + 30, y + 32, lw - 40, 15, 1);
        if (done && (l.flag || mark[k])) { g.fillStyle = '#fff'; g.font = FONT(11, 1); g.textAlign = 'right'; g.fillText(l.flag ? (mark[k] ? '✓ 찾음' : '놓침: ' + (l.why || '')) : '정상이었어요', x0 + lw - 10, y + 15); g.textAlign = 'left'; } }
      if (!done) { g.fillStyle = '#7f8ea3'; g.font = FONT(12, 1); g.textAlign = 'center'; g.fillText('↑↓ 이동 · 스페이스 표시 · E 제출 (다 보기 전에 제출해도 돼요)', W / 2, H - 12); }
    },
  };
}

/* =================================================================
   6) 출입 관문 (gate) — 스페이스 통과, X 제지. 꼬리 물기는 문 열린 사이 X!
   ================================================================= */
function GAME_gate(spec) {
  const P = (() => { const all = spec.data.people.map(p => ({ ...p })); if (!spec.data.pick) return all;
    const ok = shuffle(all.filter(p => !p.tail && p.ok)), no = shuffle(all.filter(p => !p.tail && !p.ok)), tl = shuffle(all.filter(p => p.tail)).slice(0, spec.data.tails || 2);
    const nOk = Math.min(ok.length, Math.max(3, Math.round(spec.data.pick / 2))), main = shuffle([...ok.slice(0, nOk), ...no.slice(0, spec.data.pick - nOk)]);
    const oks = main.map((p, k) => p.ok && k < main.length - 1 ? k : -1).filter(k => k >= 0), at = shuffle(oks).slice(0, tl.length).sort((a, b) => b - a);
    at.forEach((k, j) => main.splice(k + 1, 0, tl[j])); return main.map(p => p.vars ? { ...p, ...pick(p.vars) } : p); })(), bio = !!spec.mod?.bio, TODAY = spec.data.today || ''; let i = 0, state = 'walk', px = 0, open = 0, lives = 3, right = 0, fb = null, fbT = 0, tail = null;
  const cur = () => P[i];
  const next = () => { i++; while (P[i] && P[i].handled) i++; px = 0; state = 'walk'; if (i >= P.length) setTimeout(() => api.end(lives > 0 && right >= P.length - 2, right / P.length), 500); };
  const say = (ok, t) => { fb = { ok, t }; fbT = ok ? 1.1 : 2.2; sound.play(ok ? 'store' : 'alert'); if (ok) right++; else lives--; if (lives <= 0) setTimeout(() => api.end(false, right / P.length * 0.6), 300); };
  const allow = () => { if (state === 'wait') { const p = cur(); if (p.ok) { say(true, '✓ 본인 인증 완료 · 통과'); } else say(false, '✗ ' + p.why); state = 'pass'; open = 1.6;
      if (P[i + 1] && P[i + 1].tail) { P[i + 1].handled = true; tail = { ...P[i + 1], x: -0.3 }; open = 3.0; setTimeout(() => sound.play('alert'), 250); } } };
  const stop = () => { if (tail && open > 0) { say(true, '✓ 꼬리 물기 제지! 각자 인증해야 해요'); tail = null; return; } if (state === 'wait') { const p = cur(); if (!p.ok) say(true, '✓ 제지 · ' + p.why); else say(false, '✗ 정상 직원을 막았어요 (업무 지연)'); state = 'back'; } };
  tbtns([['← 제지', stop], ['통과 →', allow]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowRight' || code === 'KeyD') allow(); if (code === 'ArrowLeft' || code === 'KeyA') stop(); },
    update(dt) { fbT = Math.max(0, fbT - dt); if (i >= P.length) return; const p = cur();
      if (p && p.tail && state === 'walk' && px === 0) { p.handled = true; next(); return; }
      if (state === 'walk') { px += dt * 0.55; if (px >= 0.5) { px = 0.5; state = 'wait'; } }
      else if (state === 'pass') { px += dt * 0.7; open -= dt; if (tail) { tail.x += dt * 0.42; if (tail.x >= 0.55 && open > 0) { say(false, '✗ 문이 열린 사이 ' + tail.name + '이 따라 들어왔어요'); tail = null; } }
        if (px > 1.05 && open <= 0) { if (tail) { say(false, '✗ ' + tail.name + '이 따라 들어왔어요'); tail = null; } next(); } }
      else if (state === 'back') { px -= dt * 0.7; if (px < -0.05) next(); } },
    draw(dt, t) { bg(); bar(1 - i / P.length, `방문자 확인 중 · ${Math.min(i + 1, P.length)} / ${P.length}`); hearts(lives, 3);
      const top = 14, cs = Math.min(H - 28, W * 0.42), cx = 20, cy = top;
      // ---- 출입 카메라 (실제 얼굴)
      panel(cx, cy, cs, cs, 14, '#151827', '#4a5274'); const ih = cs - 52;
      g.fillStyle = PAL.red; g.beginPath(); g.arc(cx + 18, cy + 20, 5, 0, 7); g.fill(); g.fillStyle = PAL.sub; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText('출입 카메라 · 실시간 (실제 얼굴)', cx + 30, cy + 25);
      const p = cur(); const fx0 = cx + 12, fy0 = cy + 40, fw = cs - 24;
      g.save(); rr(fx0, fy0, fw, ih, 10); g.clip(); g.fillStyle = '#2a2f45'; g.fillRect(fx0, fy0, fw, ih);
      if (p && !p.tail) { let al = 1, dx = 0; if (state === 'walk') { al = Math.min(1, px * 2.4); dx = (1 - Math.min(1, px * 2)) * -40; } else if (state === 'pass') { al = Math.max(0, 1 - (px - 0.5) * 2.2); dx = (px - 0.5) * fw * 0.9; } else if (state === 'back') { al = Math.max(0, px * 2); dx = -(0.5 - px) * fw; }
        const im = img(p.img); g.globalAlpha = al; if (im) { const r = ih / fw, sw = im.naturalWidth, sh = sw * r; g.drawImage(im, 0, Math.max(0, (im.naturalHeight - sh) * 0.35), sw, Math.min(sh, im.naturalHeight), fx0 + dx, fy0, fw, ih); } else { g.fillStyle = '#6b7294'; g.font = JUA(60); g.textAlign = 'center'; g.fillText('?', fx0 + fw / 2 + dx, fy0 + ih / 2 + 20); } g.globalAlpha = 1; }
      g.fillStyle = 'rgba(120,255,220,.04)'; for (let y = fy0; y < fy0 + ih; y += 4) g.fillRect(fx0, y, fw, 1); g.restore();
      g.font = FONT(12, 1); const st2 = open > 0 ? '● 문 열림 · 통과 중' : '● 문 닫힘 · 인증 대기', sw2 = g.measureText(st2).width + 20; g.fillStyle = 'rgba(20,22,36,.85)'; rr(fx0 + 8, fy0 + ih - 34, sw2, 26, 8); g.fill(); g.fillStyle = open > 0 ? PAL.tealHi : '#ff8a80'; g.textAlign = 'left'; g.fillText(st2, fx0 + 18, fy0 + ih - 16);
      // 꼬리 물기 예고: 앞사람이 기다리는 동안 뒤에 누군가 어른거려요
      if (state === 'wait' && P[i + 1] && P[i + 1].tail) { const nI = img(P[i + 1].img), w3 = Math.min(96, fw * 0.26), x3 = fx0 + fw - w3 - 12, y3 = fy0 + 12; g.save(); g.globalAlpha = 0.55 + Math.sin(t * 3) * 0.15; g.filter = 'blur(2px) grayscale(.6)'; rr(x3, y3, w3, w3, 8); g.clip(); if (nI) cover(nI, x3, y3, w3, w3, 0.2); g.restore(); g.filter = 'none';
        g.fillStyle = 'rgba(20,22,36,.85)'; rr(x3 - 30, y3 + w3 + 4, w3 + 42, 22, 6); g.fill(); g.fillStyle = '#ffc27a'; g.font = FONT(11, 1); g.textAlign = 'center'; g.fillText('뒤에 누가 서 있어요…', x3 + w3 / 2 - 9, y3 + w3 + 19); }
      if (tail) { const blink = Math.sin(t * 14) > 0, prog = Math.max(0, Math.min(1, (tail.x + 0.3) / 0.85));
        g.strokeStyle = blink ? '#ff9a2e' : '#ff3b2e'; g.lineWidth = 6; rr(cx + 2, cy + 2, cs - 4, cs - 4, 14); g.stroke();
        const tI = img(tail.img), tw2 = Math.min(200, fw * 0.5, ih - 120), tx2 = fx0 + (fw - tw2) / 2, ty2 = fy0 + 70; g.fillStyle = 'rgba(20,22,36,.92)'; rr(tx2 - 5, ty2 - 5, tw2 + 10, tw2 + 34, 12); g.fill(); g.strokeStyle = PAL.orange; g.lineWidth = 3; g.stroke();
        g.save(); rr(tx2, ty2, tw2, tw2, 8); g.clip(); if (tI) cover(tI, tx2, ty2, tw2, tw2, 0.2); else { g.fillStyle = '#6b7294'; g.fillRect(tx2, ty2, tw2, tw2); } g.restore();
        g.fillStyle = '#3a3f58'; rr(tx2, ty2 + tw2 + 8, tw2, 8, 4); g.fill(); g.fillStyle = prog > 0.7 ? '#ff3b2e' : PAL.orange; rr(tx2, ty2 + tw2 + 8, tw2 * prog, 8, 4); g.fill();
        g.fillStyle = blink ? '#d9473a' : '#b8321f'; rr(fx0, fy0, fw, 56, 10); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = JUA(22); g.fillText('⚠ 꼬리 물기 감지!', fx0 + fw / 2, fy0 + 25); g.font = FONT(13, 1); g.fillText('뒤따라 들어오는 ' + tail.name + ' — 문 닫기 전에 ← 제지', fx0 + fw / 2, fy0 + 46); }
      // ---- 출입증 카드
      const rx = cx + cs + 34, rw = W - rx - 20; g.fillStyle = PAL.tealHi; g.font = JUA(26); g.textAlign = 'center'; g.fillText('↔', cx + cs + 17, cy + cs * 0.42);
      g.fillStyle = PAL.sub; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText('제시한 출입증', rx, cy + 12); if (TODAY) { g.fillStyle = '#ffd75e'; g.textAlign = 'right'; g.fillText('오늘 ' + TODAY, rx + rw, cy + 12); g.textAlign = 'left'; }
      const kh = Math.min(cs * 0.6, 250), ky = cy + 22;
      if (p && !p.tail && state !== 'walk') { const c = p.card || { kind: 'none' };
        if (c.kind === 'none') { g.setLineDash([7, 6]); g.strokeStyle = '#6b7294'; g.lineWidth = 2; rr(rx, ky, rw, kh, 14); g.stroke(); g.setLineDash([]); g.fillStyle = PAL.muted; g.font = JUA(22); g.textAlign = 'center'; g.fillText('제시한 출입증이 없어요', rx + rw / 2, ky + kh / 2 + 8); }
        else { card(rx, ky, rw, kh, 14); const vis = c.kind === 'visitor', tmp = c.kind === 'temp', hc = vis ? PAL.orange : tmp ? '#c9a21a' : PAL.blue; g.save(); rr(rx, ky, rw, 40, 14); g.clip(); g.fillStyle = hc; g.fillRect(rx, ky, rw, 40); g.restore(); g.fillStyle = hc; g.fillRect(rx + 1, ky + 26, rw - 2, 14);
          g.fillStyle = '#fff'; g.font = JUA(19); g.textAlign = 'left'; g.fillText(vis ? 'VISITOR · 방문증' : tmp ? 'TEMP · 임시 출입증' : (c.logo || 'LOOPLAB') + ' · 사원증', rx + 16, ky + 27);
          const ps = Math.min(kh - 64, rw * 0.36), pxx = rx + 16, pyy = ky + 52, idI = img(p.idImg || p.img); g.save(); rr(pxx, pyy, ps, ps, 8); g.clip(); if (idI) cover(idI, pxx, pyy, ps, ps, 0.25); else { g.fillStyle = '#c9c2d6'; g.fillRect(pxx, pyy, ps, ps); } g.restore(); g.strokeStyle = PAL.ink; g.lineWidth = 2; rr(pxx, pyy, ps, ps, 8); g.stroke();
          const fx = pxx + ps + 18, fw2 = rx + rw - fx - 14; const row = (k, v, y, b) => { g.fillStyle = PAL.gray; g.font = FONT(12); g.textAlign = 'left'; g.fillText(k, fx, y); g.fillStyle = PAL.ink; g.font = b ? JUA(21) : FONT(13.5, 1); wrap(v, fx, y + (b ? 24 : 18), fw2, 17, 1); };
          row('이름', p.name, pyy + 10, true); row('소속', c.dept || '', pyy + 56); row('유효기간', c.until || '', pyy + 96); row('출입 구역', c.zone || (vis ? '안내 구역' : '전 구역'), pyy + 136); } }
      else if (p && !p.tail) { g.fillStyle = PAL.muted; g.font = JUA(20); g.textAlign = 'center'; g.fillText('다가오는 중…', rx + rw / 2, ky + kh / 2); }
      // ---- 확인 사항
      const ny = ky + kh + 16, nh = cy + cs - ny; if (p && !p.tail && state !== 'walk' && nh > 50) { panel(rx, ny, rw, nh, 12, PAL.panel2, '#4a5274');
        g.fillStyle = PAL.sub; g.font = FONT(12, 1); g.textAlign = 'left'; g.fillText('하는 말 · 상황', rx + 16, ny + 22); g.fillStyle = '#fff'; g.font = FONT(14.5, 1); wrap(p.look || '', rx + 16, ny + 46, rw - 32, 19, 2);
        const cr = !p.card || p.card.kind === 'none' ? '찍을 카드 없음' : (p.card.reader || '정상 카드'); g.fillStyle = PAL.sub; g.font = FONT(12, 1); g.fillText('카드 리더', rx + 16, ny + nh - 40); g.fillStyle = /정상/.test(cr) ? '#fff' : '#ff9a90'; g.font = FONT(13.5, 1); g.fillText(cr, rx + 96, ny + nh - 40);
        g.fillStyle = PAL.sub; g.font = FONT(12, 1); g.fillText('지문 인증', rx + 16, ny + nh - 16); g.fillStyle = bio ? '#fff' : PAL.muted; g.font = FONT(13.5, 1); g.fillText(bio ? (p.bio || (p.ok ? '지문 ✓ 일치' : '지문 미등록')) : '지문 인증 단말 없음 (BIO 필요)', rx + 96, ny + nh - 16); }


      toast(fb, fbT, 10);
    },
  };
}

/* =================================================================
   7) 샌드박스 행동 감시 (sandbox) — 위험한 행동이 뜨는 순간 스페이스로 증거 저장
   ================================================================= */
function GAME_sandbox(spec) {
  const T = spec.time || 36, need = spec.data.need || 5, ev = spec.data.events, gap = (spec.mod?.slow ? 1.25 : 1) * (spec.data.gap || 0.95);
  let left = T, log = [], st = 0.3, got = 0, miss = 0, wrong = 0, flash = 0;
  const mark = () => { const e = log[log.length - 1]; if (!e || e.marked) return; e.marked = true; if (e.bad) { got++; sound.play('store'); pop(W / 2, H - 120, '증거 저장!', '#5ef2b0'); if (got >= need) api.end(true, Math.max(0.3, 1 - wrong * 0.12 - miss * 0.08)); } else { wrong++; left -= 2; sound.play('alert'); pop(W / 2, H - 120, '정상 동작이에요 -2초', '#ff6b5a'); flash = 0.3; } };
  tbtns([['스페이스 · 증거 저장', mark]]);
  return {
    key(code, down) { if (down && code === 'Space') mark(); },
    update(dt) { left -= dt; st -= dt; flash = Math.max(0, flash - dt);
      if (st <= 0) { const prev = log[log.length - 1]; if (prev && prev.bad && !prev.marked) { miss++; prev.missed = true; }
        const e = Math.random() < 0.38 ? pick(ev.filter(q => q.bad)) : pick(ev.filter(q => !q.bad)); log.push({ ...e, ts: (T - left).toFixed(1) }); if (log.length > 14) log.shift(); st = gap * rnd(0.85, 1.25); }
      if (left <= 0) api.end(got >= need - 1, got / need * 0.8); },
    draw(dt, t) { g.fillStyle = flash ? '#2a1218' : '#06090f'; g.fillRect(0, 0, W, H); bar(left / T, `증거 ${got}/${need} · 놓침 ${miss} · 남은 시간 ${Math.ceil(left)}초`, '#5ef2b0');
      g.fillStyle = '#10161f'; rr(16, 54, W - 32, H - 130, 10); g.fill(); g.fillStyle = '#7f8ea3'; g.font = MONO(12, 0); g.textAlign = 'left'; g.fillText('sandbox://isolated-vm-01  (네트워크 차단 · 스냅샷 보호)  — usb_contents.zip 실행 중', 28, 76);
      const lh = 26, y0 = H - 100 - log.length * lh; log.forEach((e, k) => { const y = y0 + k * lh, last = k === log.length - 1;
        if (last) { g.fillStyle = 'rgba(255,215,94,.10)'; g.fillRect(20, y - 17, W - 40, 24); }
        g.font = MONO(13, last ? 1 : 0); g.fillStyle = e.marked ? (e.bad ? '#5ef2b0' : '#ff8fa3') : e.missed ? '#ff5a6e' : last ? '#fff' : '#8a97ab';
        g.fillText(`[${String(e.ts).padStart(5, ' ')}s] ${e.p || 'macro.exe'}  ${e.t}${e.marked ? (e.bad ? '   ← 증거' : '   ← 오탐') : e.missed ? '   ← 놓침' : ''}`, 28, y); });
      keycap(W / 2 - 90, H - 46, '스페이스 = 방금 줄을 증거로', false, 180);
    },
  };
}

/* =================================================================
   8) 백업 시점 고르기 (backup) — ←→로 스냅샷 선택, Enter
   ================================================================= */
function GAME_backup(spec) {
  const R = spec.data.rounds; let r = 0, cur = 0, scores = [], fb = null, fbT = 0, tl = spec.data.per || 22, left = tl;
  const choose = () => { if (fbT > 0) return; const rd = R[r], s = rd.snaps[cur], ti = rd.snaps.indexOf(rd.intrude), te = rd.snaps.indexOf(rd.encrypt);
    let sc, t; if (cur === ti - 1) { sc = 1; t = '✓ 침입 직전의 깨끗한 백업! 잃은 자료가 가장 적어요.'; } else if (cur < ti - 1) { sc = 0.6; t = '△ 깨끗하지만 너무 이른 시점 — 그사이 자료를 잃어요.'; }
    else if (cur < te) { sc = 0.15; t = '✗ 침입 뒤의 백업 — 공격자가 심어 둔 프로그램까지 되살아나요.'; } else { sc = 0; t = '✗ 이미 암호화된 뒤의 백업이에요.'; }
    scores.push(sc); fb = { ok: sc >= 0.6, t }; fbT = 2.4; sound.play(sc >= 0.6 ? 'store' : 'alert'); };
  tbtns([['←', () => cur = Math.max(0, cur - 1)], ['→', () => cur = Math.min(R[r].snaps.length - 1, cur + 1)], ['복구', choose]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowLeft' || code === 'KeyA') { cur = Math.max(0, cur - 1); sound.play('page'); } if (code === 'ArrowRight' || code === 'KeyD') { cur = Math.min(R[r].snaps.length - 1, cur + 1); sound.play('page'); } if (code === 'Space') choose(); },
    update(dt) { if (fbT > 0) { fbT -= dt; if (fbT <= 0) { r++; cur = 0; left = tl; if (r >= R.length) { const s = scores.reduce((a, b) => a + b, 0) / R.length; api.end(s >= 0.55, s); } } return; } left -= dt; if (left <= 0) { scores.push(0); fb = { ok: false, t: '⏱ 시간 초과 — 복구하지 못했어요' }; fbT = 1.8; } },
    draw(dt, t) { bg(); if (r >= R.length) return; const rd = R[r]; clock(left); bar(left / tl, `서버 ${r + 1} / ${R.length} · ${rd.server}`);
      const lx = 22, lw = Math.min(260, W * 0.27), top = 16;
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText('복구 대상', lx, top + 10);
      card(lx, top + 24, lw, 200); g.fillStyle = PAL.ink; g.font = JUA(26); g.fillText(rd.server, lx + 20, top + 64); chip(lx + 20, top + 78, '랜섬웨어 감염', PAL.red, { s: 11, h: 21 });
      g.fillStyle = PAL.ink; g.font = FONT(13.5); g.fillText('암호화되기 전이 아니라', lx + 20, top + 132); g.font = FONT(13.5, 1); g.fillText('처음 침입하기 전', lx + 20, top + 154); const w1 = g.measureText('처음 침입하기 전').width; g.font = FONT(13.5); g.fillText('으로', lx + 20 + w1, top + 154); g.fillText('돌아가야 합니다.', lx + 20, top + 176);
      const rx = lx + lw + 26, rw = W - rx - 22; g.fillStyle = PAL.sub; g.font = FONT(12.5); g.fillText('서버 활동 기록', rx, top + 10);
      const lh = 30, ph = rd.logs.length * lh + 22; panel(rx, top + 24, rw, ph, 12, PAL.panel2, '#4a5274');
      rd.logs.forEach((l, k) => { const y = top + 24 + 28 + k * lh; g.fillStyle = '#fff'; g.font = MONO(14, 0); g.textAlign = 'left'; g.fillText(l.t, rx + 18, y); g.fillStyle = /백업 완료|정상/.test(l.m) ? PAL.tealHi : '#e9ecf5'; g.font = FONT(14); g.fillText(l.m, rx + 82, y); });
      const ty = top + 24 + ph + 34; g.fillStyle = PAL.sub; g.font = FONT(12.5); g.fillText('백업 시간축 / 복구할 지점을 선택하세요', rx, ty);
      const n = rd.snaps.length, x0 = rx + 26, x1 = rx + rw - 26, y = ty + 42; g.strokeStyle = '#59607e'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      rd.snaps.forEach((s, k) => { const x = x0 + k * (x1 - x0) / (n - 1), on = k === cur; g.fillStyle = on ? PAL.tealHi : '#3b4262'; g.beginPath(); g.arc(x, y, on ? 12 : 9, 0, 7); g.fill(); g.strokeStyle = on ? '#fff' : '#9aa3bf'; g.lineWidth = on ? 3 : 2.5; g.stroke();
        g.fillStyle = on ? '#fff' : PAL.sub; g.font = FONT(on ? 13.5 : 12.5, on); g.textAlign = 'center'; g.fillText(s, x, y + 32); });
      chip(x0 - 10, y + 48, '선택한 백업 · ' + rd.snaps[cur], PAL.tealHi, { s: 12, h: 24, fill: 'rgba(23,169,154,.12)' });
      toast(fb, fbT);
    },
  };
}

/* =================================================================
   9) 개인정보 가리기 (redact) — ←→ 단어 이동, 스페이스 가리기, Enter 즉시 전송
      한 줄씩 정해진 시간이 지나면 AI로 전송돼요. 너무 많이 가리면 쓸모가 없어져요.
   ================================================================= */
function GAME_redact(spec) {
  const L = spec.data.lines.map(s => { let inB = false; return s.split(' ').filter(Boolean).map(w => { const open = w.startsWith('{'), close = w.endsWith('}'); const pii = inB || open; if (open) inB = true; if (close) inB = false; return { w: w.replace(/[{}]/g, ''), pii, m: false }; }); });
  const per = (spec.data.per || 6) * 1.5 * (spec.mod?.slow ? 1.3 : 1); let li = 0, ci = 0, lt = per, leak = 0, over = 0, hit = 0, sent = [];
  const send = () => { const line = L[li]; line.forEach(tk => { if (tk.pii && !tk.m) leak++; if (tk.pii && tk.m) hit++; if (!tk.pii && tk.m) over++; }); sent.push(line); sound.play(line.some(tk => tk.pii && !tk.m) ? 'alert' : 'store'); li++; ci = 0; lt = per;
    if (li >= L.length) { const tot = L.flat().filter(t => t.pii).length; const s = Math.max(0, (hit - over * 0.5) / tot); setTimeout(() => api.end(leak <= 1 && s >= 0.6, s), 500); } };
  const mv = d => { if (li < L.length) ci = Math.max(0, Math.min(L[li].length - 1, ci + d)); };
  tbtns([['←', () => mv(-1)], ['→', () => mv(1)], ['가리기', () => { if (li < L.length) L[li][ci].m = !L[li][ci].m; }], ['전송', send]]);
  return {
    key(code, down) { if (!down || li >= L.length) return; if (code === 'ArrowLeft' || code === 'KeyA') mv(-1); if (code === 'ArrowRight' || code === 'KeyD') mv(1); if (code === 'Space') { L[li][ci].m = !L[li][ci].m; sound.play('page'); } if (code === 'KeyE') send(); },
    update(dt) { if (li >= L.length) return; lt -= dt; if (lt <= 0) send(); },
    draw(dt, t) { bg(); bar(li < L.length ? lt / per : 0, `전송 전 검토 중 · 줄 ${Math.min(li + 1, L.length)} / ${L.length} · 유출 ${leak} · 과하게 가림 ${over}`);
      const lx = 20, lw = Math.min(W * 0.58, 600), top = 14, chh = H - 28; card(lx, top, lw, chh);
      chip(lx + 20, top + 18, '직원 정보 파일', PAL.ink, { s: 11, h: 22 }); g.fillStyle = PAL.ink; g.font = JUA(23); g.textAlign = 'left'; g.fillText(spec.data.title || '업무 인수인계 요약 요청', lx + 20, top + 72);
      let y = top + 116; const rowH = 52, maxY = top + chh - 96;
      for (let k = li; k < L.length && y < maxY; k++) { const line = L[k], act = k === li; g.globalAlpha = act ? 1 : 0.4;
        if (act) { g.fillStyle = '#fff6dc'; rr(lx + 12, y - 28, lw - 24, rowH - 6, 8); g.fill(); g.fillStyle = PAL.orange; g.fillRect(lx + 12, y + 16, (lw - 24) * Math.max(0, lt / per), 3); }
        let cx = lx + 22; line.forEach((tk, j) => { g.font = FONT(15.5, 1); const w = g.measureText(tk.w).width; if (cx + w + 14 > lx + lw - 16) return; const sel = act && j === ci;
          if (tk.m) { g.fillStyle = PAL.ink; rr(cx, y - 18, w + 12, 26, 6); g.fill(); g.fillStyle = '#9aa3bf'; g.font = FONT(10.5, 1); g.textAlign = 'center'; g.fillText('가림', cx + (w + 12) / 2, y - 1); g.textAlign = 'left'; }
          else { g.fillStyle = act ? '#efe9f2' : 'transparent'; if (act) { rr(cx, y - 18, w + 12, 26, 6); g.fill(); } g.fillStyle = PAL.ink; g.font = FONT(15.5, 1); g.fillText(tk.w, cx + 6, y + 1); }
          if (sel) { g.strokeStyle = PAL.orange; g.lineWidth = 3; rr(cx - 3, y - 21, w + 18, 32, 8); g.stroke(); }
          cx += w + 18; });
        g.globalAlpha = 1; y += rowH; }
      const gy = top + chh - 84; g.strokeStyle = '#e4dee8'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx + 16, gy); g.lineTo(lx + lw - 16, gy); g.stroke();
      g.textAlign = 'left'; g.font = FONT(12.5, 1); g.fillStyle = PAL.red; g.fillText('가릴 것', lx + 20, gy + 24); g.fillStyle = PAL.ink; g.font = FONT(12.5); g.fillText('사람 이름 · 전화번호 · 생년월일 · 주소 · 건강 정보 · 계좌 · 개인 메일', lx + 80, gy + 24);
      g.font = FONT(12.5, 1); g.fillStyle = PAL.teal; g.fillText('남길 것', lx + 20, gy + 50); g.fillStyle = PAL.ink; g.font = FONT(12.5); g.fillText('부서 · 직급 · 업무 내용 · 일정 · 교육 이수 여부', lx + 80, gy + 50);
      if (li >= L.length) { g.fillStyle = PAL.teal; g.font = JUA(22); g.fillText('모든 줄을 보냈어요', lx + 24, top + 120); }
      const ax = lx + lw + 16, rx = ax + 30, rw = W - rx - 20; g.fillStyle = PAL.tealHi; g.font = FONT(22, 1); g.textAlign = 'left'; g.fillText('→', ax, H / 2);
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.fillText('외부 AI 서비스', rx, top + 12); panel(rx, top + 24, rw, chh - 24, 12, PAL.panel2, '#4a5274');
      g.fillStyle = PAL.tealHi; g.font = JUA(22); g.fillText('요약 도우미', rx + 18, top + 60); g.fillStyle = PAL.sub; g.font = FONT(13); wrap(li < L.length ? '전송 대기 중입니다. 개인정보를 가린 뒤 보내 주세요.' : '전송이 끝났어요.', rx + 18, top + 88, rw - 36, 18, 2);
      let y2 = top + 136; sent.slice(-6).forEach(line => { let cx = rx + 18; g.font = FONT(12.5); line.forEach(tk => { const s2 = tk.m ? '■■■' : tk.w, w = g.measureText(s2 + ' ').width; if (cx + w > rx + rw - 14) return; g.fillStyle = tk.m ? '#6b7294' : tk.pii ? PAL.redHi : '#e9ecf5'; g.fillText(s2, cx, y2); cx += w; });
        if (line.some(tk => tk.pii && !tk.m)) { g.fillStyle = PAL.redHi; g.font = FONT(11, 1); g.textAlign = 'right'; g.fillText('⚠ 유출', rx + rw - 14, y2); g.textAlign = 'left'; } y2 += 24; });
      if (li < L.length) { const by = Math.max(y2 + 6, top + chh - 90); g.setLineDash([5, 5]); g.strokeStyle = '#59607e'; g.lineWidth = 1.3; rr(rx + 14, by, rw - 28, 62, 10); g.stroke(); g.setLineDash([]);
        g.fillStyle = PAL.muted; g.font = FONT(12); g.fillText('다음 전송 줄', rx + 28, by + 24); g.fillText(`${L[li][0].w} … · 검토 필요 · ${Math.ceil(lt)}초 뒤 전송`, rx + 28, by + 46); }
    },
  };
}

/* =================================================================
   10) 공정한 AI 만들기 (bias) — ↑↓ 이동, 스페이스 사용/제외, Enter 학습
   ================================================================= */
function GAME_bias(spec) {
  const F = spec.data.features.map(f => ({ ...f, on: true })), goal = spec.data.goal || { acc: 75, fair: 85 }, maxTry = spec.data.tries || 3;
  let cur = 0, tries = 0, res = null, anim = 0, msg = '현재 픽스는 모든 정보를 써서 판단하고 있어요. 공정하면서도 정확한 조합을 찾아 E로 다시 학습시키세요.';
  const calc = () => { const acc = Math.min(96, 24 + F.filter(f => f.on).reduce((a, f) => a + f.acc, 0)), fair = Math.max(0, 100 - F.filter(f => f.on).reduce((a, f) => a + f.bias, 0)); return { acc, fair }; };
  const train = () => { if (anim > 0 || tries >= maxTry) return; tries++; anim = 1.2; sound.play('click'); setTimeout(() => { res = calc(); const worst = F.filter(f => f.on && f.bias).sort((a, b) => b.bias - a.bias)[0];
      const ok = res.acc >= goal.acc && res.fair >= goal.fair; msg = ok ? '목표 달성! 근거가 되는 행동 정보로만 판단하게 됐어요.' : res.acc < goal.acc ? '정확도가 낮아요. 실제 공격과 관련된 행동 정보까지 빼 버린 건 아닐까요?' : `아직 불공정해요. 특히 "${worst ? worst.n : ''}"${worst && worst.why ? ' — ' + worst.why : ''}`;
      sound.play(ok ? 'done' : 'alert'); if (ok) setTimeout(() => api.end(true, tries === 1 ? 1 : tries === 2 ? 0.8 : 0.65), 1400); else if (tries >= maxTry) setTimeout(() => api.end(false, Math.min(0.5, res.fair / 200 + res.acc / 300)), 1600); }, 1200); };
  tbtns([['↑', () => cur = Math.max(0, cur - 1)], ['↓', () => cur = Math.min(F.length - 1, cur + 1)], ['사용/제외', () => F[cur].on = !F[cur].on], ['학습', train]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowUp' || code === 'KeyW') cur = Math.max(0, cur - 1); if (code === 'ArrowDown' || code === 'KeyS') cur = Math.min(F.length - 1, cur + 1); if (code === 'Space') { F[cur].on = !F[cur].on; sound.play('page'); } if (code === 'KeyE') train(); },
    update(dt) { anim = Math.max(0, anim - dt); },
    draw(dt, t) { g.fillStyle = '#121a2e'; g.fillRect(0, 0, W, H); bar(1 - tries / maxTry, `학습 기회 ${maxTry - tries}/${maxTry} · 목표: 정확도 ${goal.acc}↑ 공정성 ${goal.fair}↑`, '#c4b5fd');
      const lw = W * 0.5, lh = Math.min(40, (H - 130) / F.length); g.fillStyle = '#9fb3e8'; g.font = FONT(13, 1); g.textAlign = 'left'; g.fillText('픽스가 "의심 직원"을 고를 때 쓰는 정보', 24, 70);
      F.forEach((f, k) => { const y = 84 + k * lh, on = k === cur; g.fillStyle = on ? '#26365e' : '#1a2340'; rr(20, y, lw, lh - 5, 8); g.fill(); if (on) { g.strokeStyle = '#ffd75e'; g.lineWidth = 2; g.stroke(); }
        g.fillStyle = f.on ? '#5ef2b0' : '#5a6a8a'; rr(30, y + (lh - 5) / 2 - 9, 34, 18, 9); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(f.on ? 55 : 39, y + (lh - 5) / 2, 7, 0, 7); g.fill();
        g.fillStyle = f.on ? '#e9f1ff' : '#7f8ea3'; g.font = FONT(14, 1); g.fillText(f.n, 76, y + (lh - 5) / 2 + 5); });
      const rx = lw + 50, rw = W - rx - 24; const r = anim > 0 ? { acc: rint(30, 95), fair: rint(30, 95) } : res;
      const meter = (y, label, v, goalv, col) => { g.fillStyle = '#cfe0ff'; g.font = FONT(14, 1); g.fillText(label, rx, y); g.fillStyle = '#22304f'; rr(rx, y + 8, rw, 22, 6); g.fill();
        if (v != null) { g.fillStyle = col; rr(rx, y + 8, rw * v / 100, 22, 6); g.fill(); g.fillStyle = '#fff'; g.font = MONO(14); g.textAlign = 'right'; g.fillText(v, rx + rw - 8, y + 25); g.textAlign = 'left'; }
        g.fillStyle = '#ffd75e'; g.fillRect(rx + rw * goalv / 100, y + 4, 3, 30); };
      meter(100, '정확도 (실제 공격 계정을 찾는 정도)', r && r.acc, goal.acc, '#5aa2ff'); meter(170, '공정성 (특정 집단을 억울하게 의심하지 않는 정도)', r && r.fair, goal.fair, '#5ef2b0');
      g.fillStyle = anim > 0 ? '#ffd75e' : '#e9f1ff'; g.font = FONT(13.5); wrap(anim > 0 ? '학습 중…' : msg, rx, 240, rw, 19, 6);
      g.fillStyle = '#7f8ea3'; g.font = FONT(12, 1); g.textAlign = 'center'; g.fillText('↑↓ 이동 · 스페이스 사용/제외 · E 다시 학습', W / 2, H - 14);
    },
  };
}

/* =================================================================
   11) 마스터 패스프레이즈 (pass) — 직접 입력, 강도 측정, Enter 확정
   ================================================================= */
function GAME_pass(spec) {
  const T = spec.time || 50, banned = spec.data.banned || ['password', 'looplab', 'admin', '1234', 'qwer', 'chaerin', 'hong', '0312', 'abcd'];
  let left = T, buf = '', fb = '', fbT = 0, tries = 0;
  const judge = s => { const low = s.toLowerCase(); const types = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9\s]/].filter(r => r.test(s)).length; const words = s.split(/[\s\-_.]+/).filter(w => w.length >= 3).length;
    const bad = banned.filter(b => low.includes(b)); const rep = /(.)\1\1/.test(s); const cs = [26, 26, 10, 20].filter((_, k) => [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9\s]/][k].test(s)).reduce((a, b) => a + b, 0) || 1;
    let bits = s.length * Math.log2(cs); if (words >= 4) bits = Math.max(bits, words * 13); bits -= bad.length * 25 + (rep ? 10 : 0); bits = Math.max(0, bits);
    return { bits, bad, types, words, len: s.length, rep }; };
  const label = b => b < 28 ? ['몇 초', '#ff5a6e'] : b < 40 ? ['몇 시간', '#ff8f6b'] : b < 55 ? ['몇 달', '#ffb84d'] : b < 70 ? ['수천 년', '#5ef2b0'] : ['우주 나이보다 오래', '#5ef2b0'];
  const submit = () => { tries++; const j = judge(buf); if (j.bits >= 60 && !j.bad.length) { sound.play('done'); api.end(true, Math.min(1, 0.6 + (j.bits - 60) / 60 + (tries === 1 ? 0.1 : 0))); }
    else { sound.play('alert'); fb = j.bad.length ? `"${j.bad[0]}"처럼 회사·이름·흔한 단어는 금방 추측돼요.` : j.len < 14 ? '더 길게! 짧은 암호는 컴퓨터가 모든 경우를 금방 시도해요.' : '단어 4개 이상을 이어 붙이거나 종류를 섞어 보세요.'; fbT = 3; } };
  return {
    key(code, down, e) { if (!down) return; if (code === 'Tab') return submit(); if (code === 'Backspace') { buf = buf.slice(0, -1); return; }
      let ch = e.key && e.key.length === 1 && e.key.charCodeAt(0) < 127 ? e.key : '';
      if (!ch) { if (code === 'Space') ch = ' '; else if (/^Key[A-Z]$/.test(code)) ch = e.shiftKey ? code.slice(3) : code.slice(3).toLowerCase(); else if (/^Digit\d$/.test(code)) ch = code.slice(5); else if (code === 'Minus') ch = '-'; }
      if (ch && buf.length < 40) buf += ch; },
    update(dt) { left -= dt; fbT = Math.max(0, fbT - dt); if (left <= 0) { const j = judge(buf); api.end(false, Math.min(0.5, j.bits / 120)); } },
    draw(dt, t) { g.fillStyle = '#0f1526'; g.fillRect(0, 0, W, H); bar(left / T, `남은 시간 ${Math.ceil(left)}초 · 제출 ${tries}번`, '#ffd75e');
      const j = judge(buf), [lb, lc] = label(j.bits);
      g.fillStyle = '#cfe0ff'; g.font = FONT(15, 1); g.textAlign = 'left'; g.fillText('서버실 새 마스터 패스프레이즈 (영문 자판으로 입력)', 30, 80);
      g.fillStyle = '#fffdf9'; rr(30, 96, W - 60, 56, 10); g.fill(); g.fillStyle = '#2c2733'; g.font = MONO(22); g.fillText(buf + (Math.sin(t * 7) > 0 ? '▌' : ''), 44, 132);
      g.fillStyle = '#22304f'; rr(30, 172, W - 60, 18, 9); g.fill(); g.fillStyle = lc; rr(30, 172, (W - 60) * Math.min(1, j.bits / 90), 18, 9); g.fill();
      g.fillStyle = lc; g.font = FONT(15, 1); g.fillText(`예상 해독 시간: ${buf ? lb : '-'}`, 30, 216);
      const checks = [[j.len >= 14, `길이 14자 이상 (지금 ${j.len})`], [j.types >= 3 || j.words >= 4, '문자 종류 3가지 이상, 또는 단어 4개 이상'], [!j.bad.length, '회사 이름·내 이름·생일·흔한 단어 없음'], [!j.rep, '같은 글자 3번 반복 없음']];
      checks.forEach(([ok, s], k) => { g.fillStyle = ok ? '#5ef2b0' : '#7f8ea3'; g.font = FONT(14, 1); g.fillText((ok ? '✓ ' : '○ ') + s, 30, 256 + k * 26); });
      g.fillStyle = '#9fb3e8'; g.font = FONT(12.5); wrap('홍 팀장 정보: 이름 홍채린(chaerin), 생일 03/12, 회사 루프랩(looplab) — 공격자도 알 수 있는 정보예요. 예) Paper-Moon-Coffee-Bridge-7', 30, H - 70, W - 60, 17, 2);
      if (fbT > 0) { g.fillStyle = 'rgba(58,24,32,.96)'; rr(30, H - 130, W - 60, 40, 10); g.fill(); g.fillStyle = '#ffd1d8'; g.font = FONT(13.5, 1); g.textAlign = 'center'; g.fillText(fb, W / 2, H - 105); }
    },
  };
}

/* =================================================================
   12) 암호 풀기 (cipher) — ←→로 키(밀어 낸 칸 수)를 바꿔 해독, Enter
   ================================================================= */
function GAME_cipher(spec) {
  const words = shuffle(spec.data.words || ['VAULT KEY SAFE', 'BACKUP AT TWO', 'TRUST BUT VERIFY', 'NO SHARED PASSWORDS']).slice(0, spec.data.rounds || 4), T = spec.time || 50, hint = !!spec.mod?.hint;
  const enc = (s, k) => s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65));
  const keys = words.map(() => rint(3, 23)); let r = 0, guess = 0, left = T, fb = null, fbT = 0, wrong = 0;
  const submit = () => { if (fbT > 0 || r >= words.length) return; if (guess === keys[r]) { sound.play('done'); fb = { ok: true, t: `✓ 키 ${guess} — 해독 성공` }; fbT = 1.0; r++; guess = 0; if (r >= words.length) setTimeout(() => api.end(true, Math.max(0.4, 1 - wrong * 0.12)), 700); }
    else { wrong++; left -= 3; sound.play('alert'); fb = { ok: false, t: '✗ 아직 의미 있는 문장이 아니에요 (-3초)' }; fbT = 1.0; } };
  tbtns([['←', () => guess = (guess + 25) % 26], ['→', () => guess = (guess + 1) % 26], ['확정', submit]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowLeft' || code === 'KeyA') { guess = (guess + 25) % 26; sound.play('page'); } if (code === 'ArrowRight' || code === 'KeyD') { guess = (guess + 1) % 26; sound.play('page'); } if (code === 'Space') submit(); },
    update(dt) { fbT = Math.max(0, fbT - dt); left -= dt; if (left <= 0) api.end(r >= words.length - 1, r / words.length * 0.8); },
    draw(dt, t) { bg(); clock(left); bar(r / words.length, `해독 ${Math.min(r + 1, words.length)} / ${words.length}`); if (r >= words.length) return;
      const ct = enc(words[r], keys[r]), pt = enc(ct, 26 - guess), lx = 22, lw = Math.min(W * 0.56, 600), top = 16;
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText('가로챈 암호문 / T. 로이', lx, top + 10);
      g.fillStyle = '#3a2f43'; rr(lx, top + 24, lw, 66, 12); g.fill(); g.strokeStyle = '#c4564c'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#ff9a8a'; g.font = MONO(26); g.fillText(ct, lx + 24, top + 67);
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.fillText('현재 키로 해독한 문장', lx, top + 124); card(lx, top + 138, lw, 66, 12); g.fillStyle = PAL.teal; g.font = MONO(26); g.fillText(pt, lx + 24, top + 181);
      let yy = top + 240; if (hint) { chip(lx, yy - 16, `ENC 힌트 · 키 ${Math.max(1, keys[r] - 2)} ~ ${keys[r] + 2}`, PAL.tealHi, { s: 12, h: 24, fill: 'rgba(23,169,154,.12)' }); yy += 30; }
      g.fillStyle = PAL.sub; g.font = FONT(13.5); g.fillText('읽을 수 있는 문장이 되면 확정하세요.', lx, yy + 6);
      const R0 = Math.min((W - lx - lw - 40) / 2, H / 2 - 20, 170), cx = lx + lw + 20 + (W - lx - lw - 20) / 2, cy = H / 2;
      g.fillStyle = '#2a3048'; g.beginPath(); g.arc(cx, cy, R0, 0, 7); g.fill(); g.strokeStyle = '#7a82a6'; g.lineWidth = 3; g.stroke();
      for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2 - Math.PI / 2; g.fillStyle = '#d7dcef'; g.font = MONO(Math.max(11, R0 * 0.085)); g.textAlign = 'center'; g.fillText(String.fromCharCode(65 + k), cx + Math.cos(a) * (R0 - 16), cy + Math.sin(a) * (R0 - 16) + 5);
        const b = a - guess / 26 * Math.PI * 2; g.fillStyle = PAL.tealHi; g.fillText(String.fromCharCode(65 + k), cx + Math.cos(b) * (R0 * 0.66), cy + Math.sin(b) * (R0 * 0.66) + 5); }
      g.fillStyle = PAL.cream; g.beginPath(); g.arc(cx, cy, R0 * 0.32, 0, 7); g.fill(); g.strokeStyle = PAL.teal; g.lineWidth = 4; g.stroke();
      g.fillStyle = PAL.gray; g.font = FONT(12, 1); g.fillText('현재 키', cx, cy - R0 * 0.12); g.fillStyle = PAL.ink; g.font = JUA(R0 * 0.3); g.fillText(String(guess), cx, cy + R0 * 0.2);
      toast(fb, fbT);
    },
  };
}

/* =================================================================
   13) 딥페이크 영상통화 대응 (deepcall) — 3단계
       ① 흔적 잡기: 1 영상 · 2 음성 · 3 수상한 요구  ② 진짜만 아는 질문  ③ 다른 채널로 확인
   ================================================================= */
function GAME_deepcall(spec) {
  const D = spec.data, img = Object.assign(new Image(), { src: D.img || 'assets/npc/ceo_neutral.jpg' });
  const EV = shuffle(D.events).slice(0, D.count || 11), BAD = EV.filter(e => e.k !== 'n').length;
  const Q = shuffle(D.questions).map(q => ({ ...q }));
  const KN = { v: '영상', a: '음성', s: '요구' }, CD = 3.0; let lastN = 99; globalThis.__agDeep = () => (st === 1 && cur && !cur.done && banner <= 0 ? cur.k : st); // 안내 화면 캡처용 // 흔적마다 3초 (3·2·1 카운트다운)
  let st = 1, pressure = 22, ei = -1, cur = null, curT = 0.8, caught = 0, wrongs = 0, missed = 0, fb = null, fbT = 0, banner = 2.2;
  let sub = D.opening || '홍 팀장, 나야. 회의 들어가기 전이라 짧게 말할게.', sel = 0, asks = 0, evidence = 0, picks = 0, goodPick = 0, endT = 0, over = false;
  const say = (ok, t) => { fb = { ok, t }; fbT = ok ? 1.3 : 2.4; sound.play(ok ? 'store' : 'alert'); };
  const finishAll = () => { if (over) return; over = true; st = 4; endT = 2.2;
    const s1 = Math.max(0, (caught - wrongs * 0.5) / BAD), s = Math.max(0, Math.min(1, s1 * 0.6 + evidence / 2 * 0.4));
    sub = evidence ? '(통화 종료) 둘만 아는 질문에 답하지 못했어요. 진짜 대표님이 아니에요!' : '(통화 종료) …누구나 아는 질문만 해서 확인하지 못했어요.';
    setTimeout(() => api.end(pressure < 100 && s >= 0.55, s), 2200); };
  const lose = () => { if (over) return; over = true; st = 4; sub = '(압박에 못 이겨 송금 승인 버튼을 눌러 버렸어요…)'; sound.play('alert'); setTimeout(() => api.end(false, Math.max(0, caught / BAD * 0.4)), 1800); };
  const hit = k => { if (st !== 1 || banner > 0) return;
    if (!cur || cur.done) { pressure += 5; say(false, '지금은 이상한 장면이 없어요'); return; }
    cur.done = true;
    if (cur.k === k) { caught++; pressure = Math.max(0, pressure - 13); say(true, `✓ ${KN[k]} 흔적 — ${cur.why}`); pop(W * 0.3, H * 0.4, '흔적 포착!', '#5ef2b0'); }
    else if (cur.k === 'n') { wrongs++; pressure += 10; say(false, `✗ ${cur.why}`); }
    else { wrongs++; pressure += 7; say(false, `✗ ${KN[cur.k]} 흔적이었어요 — ${cur.why}`); } };
  const choose = () => { if (over) return; if (banner > 0) { banner = 0; return; }
    if (st === 2) { const q = Q[sel]; if (q.used) return; q.used = true; asks++; sub = q.fake;
      if (q.secret) { evidence++; pressure = Math.max(0, pressure - 15); say(true, '✓ ' + q.why); } else { pressure += 12; say(false, '✗ ' + q.why); }
      if (asks >= 2) setTimeout(finishAll, 1600); }
  };
  const mv = d => { if (st === 2) { const L = Q; sel = (sel + d + L.length) % L.length; sound.play('page'); } };
  tbtns([['1 영상', () => hit('v')], ['2 음성', () => hit('a')], ['3 요구', () => hit('s')], ['↑', () => mv(-1)], ['↓', () => mv(1)], ['선택', choose]]);
  const wave = (x, y, w, h, t, mode) => { g.strokeStyle = mode === 'robot' ? '#ff8fa3' : '#5ef2b0'; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120, px = x + u * w; let v;
      if (mode === 'robot') v = Math.sign(Math.sin(u * 60 + t * 20)) * 0.55; else if (mode === 'flat') v = Math.sin(u * 40 + t * 12) * 0.35;
      else v = (Math.sin(u * 23 + t * 9) * 0.5 + Math.sin(u * 61 + t * 15) * 0.3) * (0.4 + 0.6 * Math.abs(Math.sin(u * 5 + t * 2)));
      i ? g.lineTo(px, y + h / 2 - v * h / 2) : g.moveTo(px, y + h / 2 - v * h / 2); } g.stroke(); };
  return {
    key(code, down) { if (!down) return; const m = code.match(/^(?:Digit|Numpad)([1-3])$/); if (m) return hit(['v', 'a', 's'][+m[1] - 1]);
      if (code === 'ArrowUp' || code === 'KeyW') mv(-1); if (code === 'ArrowDown' || code === 'KeyS') mv(1); if (code === 'Space') choose(); },
    update(dt) { fbT = Math.max(0, fbT - dt); if (over) return; if (banner > 0) { banner -= dt; return; }
      pressure += dt * (st === 1 ? 2.0 : 1.3); if (pressure >= 100) { pressure = 100; return lose(); }
      if (st === 1) { curT -= dt; const cn = Math.ceil(curT); if (cur && !cur.done && cn >= 1 && cn !== lastN) { lastN = cn; sound.play(cn === 1 ? 'tick' : 'tick'); } if (curT <= 0) {
          if (cur && !cur.done && cur.k !== 'n') { missed++; pressure += 8; say(false, `놓쳤어요: ${KN[cur.k]} 흔적 — ${cur.why}`); }
          ei++; if (ei >= EV.length) { st = 2; sel = 0; banner = 1.6; cur = null; sub = D.stage2 || '뭘 그렇게 꾸물거려? 빨리 처리하라니까!'; return; }
          cur = EV[ei]; curT = CD; lastN = 99; if (cur.say) sub = cur.say; } } },
    draw(dt, t) { bg();
      const stageName = ['', '① 흔적 잡기', '② 진짜만 아는 질문', '', '통화 종료'][st];
      bar(Math.max(0, 1 - pressure / 100), `${stageName} · 흔적 ${caught} / ${BAD}`);
      const vx = 18, vy = 14, vw = Math.min(W * 0.56, 560), vh = Math.min(H - 190, vw * 0.62);
      g.fillStyle = '#0b0d16'; rr(vx, vy, vw, vh, 14); g.fill(); g.save(); rr(vx, vy, vw, vh, 14); g.clip();
      const fxk = cur && !cur.done && st === 1 ? cur.fx : (st >= 2 && Math.sin(t * 3) > 0.92 ? 'slice' : '');
      const S = vh, ix = vx + (vw - S) / 2, iy = vy; const im = img.complete && img.naturalWidth ? img : null;
      if (im) { if (fxk === 'slice') { for (let k = 0; k < 8; k++) { const sy = k / 8, off = (Math.sin(t * 40 + k * 3) * 14) | 0; g.drawImage(im, 0, sy * im.naturalHeight, im.naturalWidth, im.naturalHeight / 8, ix + off, iy + sy * S, S, S / 8); } } else g.drawImage(im, ix, iy, S, S); }
      g.fillStyle = 'rgba(120,255,220,.05)'; for (let y = vy; y < vy + vh; y += 4) g.fillRect(vx, y, vw, 1);
      if (fxk === 'edge') { g.strokeStyle = 'rgba(120,255,240,.85)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 2, r = S * 0.3 + Math.sin(a * 9 + t * 18) * 6; const px = ix + S / 2 + Math.cos(a) * r * 0.8, py = iy + S * 0.42 + Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
      if (fxk === 'blink') { g.strokeStyle = '#ffd75e'; g.lineWidth = 3; [[0.4, 0.4], [0.6, 0.4]].forEach(([u, v]) => { g.beginPath(); g.arc(ix + S * u, iy + S * v, S * 0.06, 0, 7); g.stroke(); }); }
      if (fxk === 'lip') { g.strokeStyle = '#ff8fa3'; g.lineWidth = 3; g.setLineDash([6, 5]); g.strokeRect(ix + S * 0.38, iy + S * 0.6, S * 0.24, S * 0.12); g.setLineDash([]); }
      if (fxk === 'ear' && Math.sin(t * 25) > 0) { g.fillStyle = '#ffd75e'; g.beginPath(); g.arc(ix + S * 0.22, iy + S * 0.55, 7, 0, 7); g.fill(); }
      if (fxk === 'light') { const gr = g.createLinearGradient(ix, 0, ix + S, 0); gr.addColorStop(0, 'rgba(255,200,80,.35)'); gr.addColorStop(1, 'rgba(60,120,255,.35)'); g.fillStyle = gr; g.fillRect(ix, iy, S, S); }
      g.restore(); g.strokeStyle = '#4a5274'; g.lineWidth = 2; rr(vx, vy, vw, vh, 14); g.stroke();
      g.fillStyle = 'rgba(10,12,20,.72)'; g.font = FONT(12.5, 1); const cap = D.caller || '영상통화 · 안기밀 대표(?) · 처음 보는 번호', cw2 = g.measureText(cap).width + 40; rr(vx + 12, vy + 12, cw2, 28, 8); g.fill(); g.fillStyle = PAL.red; g.beginPath(); g.arc(vx + 27, vy + 26, 5, 0, 7); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(cap, vx + 38, vy + 31);
      if (cur && !cur.done && st === 1 && cur.tag) { g.font = FONT(14, 1); const tw = g.measureText(cur.tag).width + 28; g.fillStyle = 'rgba(255,253,249,.96)'; rr(vx + vw / 2 - tw / 2, vy + vh - 46, tw, 32, 10); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); g.fillStyle = PAL.ink; g.textAlign = 'center'; g.fillText(cur.tag, vx + vw / 2, vy + vh - 25); }
      if (cur && !cur.done && st === 1 && banner <= 0) { const n = Math.max(1, Math.ceil(curT)), fr = curT - Math.floor(curT), cxr = vx + vw - 52, cyr = vy + 54, R2 = 34, col = n === 1 ? '#ff5a4e' : n === 2 ? '#ffb84d' : '#5ef2b0';
        g.fillStyle = 'rgba(10,12,20,.82)'; g.beginPath(); g.arc(cxr, cyr, R2 + 6, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 6; g.beginPath(); g.arc(cxr, cyr, R2, 0, 7); g.stroke();
        g.strokeStyle = col; g.lineCap = 'round'; g.beginPath(); g.arc(cxr, cyr, R2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (curT / CD)); g.stroke(); g.lineCap = 'butt';
        g.fillStyle = col; g.font = JUA(34 + fr * 10); g.textAlign = 'center'; g.fillText(String(n), cxr, cyr + 12); g.fillStyle = '#e9ecf5'; g.font = FONT(11, 1); g.fillText('초 안에!', cxr, cyr + R2 + 22); }
      const ay = vy + vh + 10; panel(vx, ay, vw, 44, 10, PAL.panel, PAL.line); g.fillStyle = PAL.muted; g.font = FONT(11.5, 1); g.textAlign = 'left'; g.fillText('🔊 음성', vx + 12, ay + 27); wave(vx + 70, ay + 6, vw - 86, 32, t, cur && !cur.done && st === 1 ? cur.wave : '');
      const sy2 = ay + 54, sh2 = Math.max(56, H - sy2 - 14); card(vx, sy2, vw, sh2 - 4, 12); const narr = /^\(/.test(sub);
      g.fillStyle = narr ? PAL.gray : '#7a5af5'; g.font = FONT(12, 1); g.textAlign = 'left'; g.fillText(narr ? '상황' : '대표(?)', vx + 16, sy2 + 22); g.fillStyle = PAL.ink; g.font = FONT(15, 1); wrap(sub, vx + 16, sy2 + 44, vw - 32, 20, Math.max(1, Math.floor((sh2 - 50) / 20)));
      const rx = vx + vw + 22, rw = W - rx - 18; g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText('송금 압박', rx, 26);
      g.fillStyle = '#151827'; rr(rx, 36, rw, 16, 8); g.fill(); g.fillStyle = pressure > 75 ? PAL.red : pressure > 50 ? PAL.orange : PAL.teal; rr(rx, 36, rw * Math.min(1, pressure / 100), 16, 8); g.fill();
      g.fillStyle = PAL.muted; g.font = FONT(11.5); g.fillText('가득 차면 압박에 넘어가 송금을 승인해 버려요', rx, 70);
      if (st === 1) { g.fillStyle = '#fff'; g.font = JUA(18); g.fillText('이상한 장면이 보이면 바로!', rx, 104);
        [['1', '영상 흔적', '입 모양·눈 깜빡임·얼굴 테두리·조명'], ['2', '음성 흔적', '기계음·숨소리 없음·말투가 다름'], ['3', '수상한 요구', '비밀 유지·재촉·절차 우회·새 계좌']].forEach(([k, n2, d], i) => { const y = 118 + i * 70; card(rx, y, rw, 58, 11); keycap(rx + 12, y + 15, k, false, 30);
          g.fillStyle = PAL.ink; g.font = JUA(17); g.textAlign = 'left'; g.fillText(n2, rx + 54, y + 25); g.fillStyle = PAL.gray; g.font = FONT(11.5); wrap(d, rx + 54, y + 45, rw - 64, 14, 1); });
        g.fillStyle = PAL.muted; g.font = FONT(12); wrap('평범한 장면(웃음, 인사)에는 누르지 마세요.', rx, 340, rw, 16, 2); }
      if (st === 2) { const L2 = Q; g.fillStyle = '#fff'; g.font = JUA(18); g.textAlign = 'left'; wrap('진짜 대표님만 답할 질문 2개', rx, 104, rw, 22, 1);
        L2.forEach((q, i) => { const y = 120 + i * 62, on = i === sel, done2 = q.used, good = q.secret || q.ok;
          if (done2) { g.fillStyle = good ? '#e6f7f2' : '#fdeae7'; rr(rx, y, rw, 52, 10); g.fill(); g.strokeStyle = good ? PAL.teal : PAL.red; g.lineWidth = 2; g.stroke(); }
          else { panel(rx, y, rw, 52, 10, on ? '#323a5a' : PAL.panel, on ? '#ffd75e' : PAL.line); if (on) { g.strokeStyle = '#ffd75e'; g.lineWidth = 2.5; rr(rx, y, rw, 52, 10); g.stroke(); } }
          g.fillStyle = done2 ? (good ? '#0f6f63' : '#a8322a') : '#fff'; g.font = FONT(13.5, 1); g.textAlign = 'left'; wrap((done2 ? (good ? '✓ ' : '✗ ') : '') + q.t, rx + 14, y + 22, rw - 28, 17, 2); }); }
      if (banner > 0 && !over) { g.fillStyle = 'rgba(20,22,36,.82)'; g.fillRect(0, H * 0.36, W, 86); g.fillStyle = '#ffd75e'; g.font = JUA(32); g.textAlign = 'center'; g.fillText(stageName, W / 2, H * 0.36 + 42);
        g.fillStyle = '#e9ecf5'; g.font = FONT(14, 1); g.fillText(st === 1 ? '영상·음성·요구에서 딥페이크 흔적을 잡아 압박을 낮춰요' : '인터넷에서 찾을 수 있는 건 가짜도 답해요 (스페이스로 바로 시작)', W / 2, H * 0.36 + 68); }
      toast(fb, fbT);
    },
  };
}

/* =================================================================
   14) 감염 경로 끊기 (slice) — 마우스로 그어 빨간 선을 끊어요 (키보드: 대상 옆 글자 키)
   ================================================================= */
function GAME_slice(spec) {
  const D = spec.data, T = spec.time || 38, slow = spec.mod?.slow ? 0.72 : 1, KEYS = ['KeyW', 'KeyE', 'KeyD', 'KeyC', 'KeyX', 'KeyZ', 'KeyA', 'KeyQ'];
  const TG = D.targets.map((q, i) => ({ ...q, i, inf: false, key: KEYS[i], x: 0, y: 0 }));
  let left = T, lives = 3, cuts = 0, fpos = 0, inf = 0, L = [], spawn = 0.8, trail = [], lastP = null, flash = 0, fb = null, fbT = 0, ended2 = false;
  const C = { x: 0, y: 0 };
  const say = (ok, t) => { fb = { ok, t }; fbT = ok ? 1 : 2; };
  const layout = () => { C.x = W / 2; C.y = H / 2 + 14; const rx = W * 0.38, ry = H * 0.33; TG.forEach((q, i) => { const a = -Math.PI / 2 + i / TG.length * Math.PI * 2; q.x = C.x + Math.cos(a) * rx; q.y = C.y + Math.sin(a) * ry; }); };
  const src = l => l.from < 0 ? C : TG[l.from];
  // 선은 직선이 아니라 S자로 휘어진 경로(4점 꺾은선)를 따라 뻗어요 — 경로가 길어서 끊을 기회도, 헷갈림도 늘어요
  const pts = l => { const s = src(l), d = TG[l.to], dx = d.x - s.x, dy = d.y - s.y, ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln;
    return [s, { x: s.x + dx * 0.3 + nx * ln * l.k1, y: s.y + dy * 0.3 + ny * ln * l.k1 }, { x: s.x + dx * 0.68 + nx * ln * l.k2, y: s.y + dy * 0.68 + ny * ln * l.k2 }, d]; };
  const at = (P, f) => { const segs = []; let tot = 0; for (let i = 1; i < P.length; i++) { const L2 = Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); segs.push(L2); tot += L2; }
    let rem = Math.max(0, Math.min(1, f)) * tot; const out = [P[0]]; for (let i = 0; i < segs.length; i++) { if (rem >= segs[i]) { out.push(P[i + 1]); rem -= segs[i]; } else { const u = segs[i] ? rem / segs[i] : 0; out.push({ x: P[i].x + (P[i + 1].x - P[i].x) * u, y: P[i].y + (P[i + 1].y - P[i].y) * u }); break; } } return out; };
  const drawn = l => at(pts(l), l.p);
  const tip = l => { const d = drawn(l); return d[d.length - 1]; };
  const spawnLine = (from, bad) => { const free = q => !q.inf && q.i !== from && !L.some(l => !l.dead && l.to === q.i);
    const acts = shuffle(bad ? D.bad : D.good).filter(a => { const q = TG.find(t2 => t2.id === a.to); return q && free(q); }); if (!acts.length) return;
    const a = acts[0], d = TG.find(t2 => t2.id === a.to);
    const dur = (bad ? rnd(3.0, 4.0) - (T - left) * 0.03 : rnd(2.8, 3.6)) / slow; const k1 = (Math.random() < 0.5 ? 1 : -1) * rnd(0.2, 0.34), k2 = -k1 * rnd(0.6, 1.1); L.push({ from, to: d.i, p: 0, v: 1 / Math.max(1.5, dur), bad, k1, k2, t: from >= 0 ? '감염 확산 · ' + a.t : a.t, dead: false, cutT: 0 }); };
  const cut = (l, how) => { if (l.dead) return; l.dead = true; l.cutT = 0.5; const p = tip(l);
    if (l.bad) { cuts++; sound.play('store'); pop(p.x, p.y, '차단!', '#5ef2b0'); say(true, '✓ 차단: ' + l.t); }
    else { fpos++; left -= 2; flash = 0.25; sound.play('alert'); pop(p.x, p.y, '정상 동작 -2초', '#ff8fa3'); say(false, '✗ 정상 동작까지 막았어요: ' + l.t); } };
  const segX = (a, b, c, d) => { const r = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x); if (Math.abs(r) < 1e-6) return false;
    const u = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / r, v = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / r; return u >= 0 && u <= 1 && v >= 0 && v <= 1; };
  const swipe = (a, b) => { for (const l of L) { if (l.dead) continue; const P = drawn(l); for (let i = 1; i < P.length; i++) if (segX(a, b, P[i - 1], P[i])) { cut(l); break; } } };
  const end = () => { if (ended2) return; ended2 = true; const s = Math.max(0, Math.min(1, cuts / Math.max(1, cuts + inf * 1.5 + fpos * 0.6))); setTimeout(() => api.end(lives > 0 && s >= 0.5, s), 600); };
  tbtns(null); cv.style.cursor = 'crosshair';
  return {
    cleanup() { cv.style.cursor = ''; },
    down(x, y) { lastP = { x, y }; trail.push({ x, y, t: 0 }); },
    move(x, y, isDown) { if (!isDown || !lastP) return; const p = { x, y }; swipe(lastP, p); trail.push({ x, y, t: 0 }); lastP = p; },
    up() { lastP = null; },
    key(code, down) { if (!down) return; const q = TG.find(t2 => t2.key === code); if (!q) return; const ls = L.filter(l => !l.dead && l.to === q.i); if (!ls.length) { say(false, '그쪽으로 가는 선이 없어요'); return; } ls.forEach(l => cut(l)); },
    update(dt) { layout(); left -= dt; flash = Math.max(0, flash - dt); fbT = Math.max(0, fbT - dt); trail.forEach(p => p.t += dt); trail = trail.filter(p => p.t < 0.25);
      spawn -= dt; if (spawn <= 0) { spawnLine(-1, Math.random() < 0.66); if (Math.random() < 0.3 + (T - left) * 0.008) spawnLine(-1, Math.random() < 0.7); spawn = Math.max(0.6, 1.15 - (T - left) * 0.018) * rnd(0.8, 1.2) / slow; }
      for (const l of L) { if (l.dead) { l.cutT -= dt; continue; } l.p += l.v * dt;
        if (l.p >= 1) { l.dead = true; l.cutT = 0; const d = TG[l.to];
          if (l.bad) { if (!d.inf) { d.inf = true; inf++; lives--; sound.play('alert'); flash = 0.4; say(false, `✗ ${d.n} 감염! (${l.t})`); setTimeout(() => { if (!ended2) spawnLine(d.i, true); }, 1300); setTimeout(() => { if (!ended2) { d.inf = false; } }, 6000); } }
          else pop(d.x, d.y - 30, '정상 처리', '#7cc4ff'); } }
      L = L.filter(l => !l.dead || l.cutT > 0);
      if (lives <= 0 || left <= 0) end(); },
    draw(dt, t) { layout(); bg(); if (flash) { g.fillStyle = 'rgba(217,71,58,.16)'; g.fillRect(0, 0, W, H); }
      g.strokeStyle = 'rgba(120,140,200,.07)'; g.lineWidth = 1; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      clock(left); bar(left / T, `차단 ${cuts} · 감염 ${inf} · 오탐 ${fpos}`); hearts(lives, 3);
      for (const l of L) { const s = src(l), p = tip(l);
        if (l.dead) { g.globalAlpha = Math.max(0, l.cutT * 2); g.strokeStyle = l.bad ? PAL.tealHi : '#ff9a90'; g.lineWidth = 3; g.setLineDash([4, 6]); g.beginPath(); drawn(l).forEach((q, k) => k ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; continue; }
        g.save(); if (l.bad) { g.shadowColor = '#ff3b2e'; g.shadowBlur = 14; } g.strokeStyle = l.bad ? '#ff5a4e' : PAL.blueHi; g.lineWidth = l.bad ? 5 : 3; if (!l.bad) g.setLineDash([8, 6]);
        g.lineDashOffset = -t * 40; g.lineJoin = 'round'; g.beginPath(); drawn(l).forEach((q, k) => k ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke(); g.restore(); g.setLineDash([]);
        g.fillStyle = l.bad ? '#ff5a4e' : PAL.blueHi; g.beginPath(); g.arc(p.x, p.y, l.bad ? 7 : 5, 0, 7); g.fill();
        }
      g.save(); g.shadowColor = '#2fe3c6'; g.shadowBlur = 20; g.fillStyle = '#163b39'; rr(C.x - 82, C.y - 42, 164, 84, 16); g.fill(); g.restore(); g.strokeStyle = PAL.tealHi; g.lineWidth = 2.5; rr(C.x - 82, C.y - 42, 164, 84, 16); g.stroke();
      g.fillStyle = '#e9fff8'; g.font = JUA(20); g.textAlign = 'center'; g.fillText('USB 실행 중', C.x, C.y - 6); g.fillStyle = '#9fe3d3'; g.font = FONT(11.5, 1); g.fillText(D.file || 'invoice.pdf.exe', C.x, C.y + 15); g.fillText('격리된 가상 PC', C.x, C.y + 31);
      for (const q of TG) { const w = 138, h = 54, x = q.x - w / 2, y = q.y - h / 2; if (q.inf) { g.fillStyle = '#12131c'; rr(x, y + 4, w, h, 12); g.fill(); g.fillStyle = '#f7d9d5'; rr(x, y, w, h, 12); g.fill(); g.strokeStyle = PAL.red; g.lineWidth = 2.5; g.stroke(); } else card(x, y, w, h, 12);
        g.font = FONT(21); g.textAlign = 'left'; g.fillText(q.ic, x + 10, q.y + 8); g.fillStyle = PAL.ink; g.font = FONT(13, 1); g.fillText(q.n, x + 42, q.y + (q.inf ? -2 : 5)); if (q.inf) { g.fillStyle = PAL.red; g.font = FONT(11, 1); g.fillText('감염됨', x + 42, q.y + 15); }
        keycap(x + w - 18, y - 12, q.key.slice(3), false, 26); }
      for (const l of L) { if (l.dead) continue; const P = pts(l), mid = at(P, 0.5), m2 = mid[mid.length - 1], mx = m2.x, my = m2.y; g.font = FONT(11.5, 1); const tw = g.measureText(l.t).width + 16;
        g.fillStyle = l.bad ? '#fdeae7' : '#e6eefc'; rr(mx - tw / 2, my - 11, tw, 21, 6); g.fill(); g.strokeStyle = l.bad ? PAL.red : PAL.blue; g.lineWidth = 1.5; g.stroke(); g.fillStyle = l.bad ? '#a8322a' : '#244f99'; g.textAlign = 'center'; g.fillText(l.t, mx, my + 4); }
      if (trail.length > 1) { g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineCap = 'round'; for (let i = 1; i < trail.length; i++) { const a = trail[i - 1], b = trail[i]; g.lineWidth = Math.max(1, 8 * (1 - b.t / 0.25)); g.globalAlpha = 1 - b.t / 0.25; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } g.globalAlpha = 1; g.lineCap = 'butt'; }
      toast(fb, fbT, 8);
    },
  };
}

/* =================================================================
   15) 학습 데이터 저울 (databal) — ← 버리기 · → 학습에 넣기
       라벨이 틀린 데이터는 거르고, 한 집단에 쏠리지 않게 저울을 맞춰요
   ================================================================= */
function GAME_databal(spec) {
  const D = spec.data, need = D.need || 12, goal = D.goal || { acc: 80, fair: 80 }, n = D.deck || 22;
  const AT = [{ k: 'sex', n: '성별', a: '여성', b: '남성', p: 0.7 }, { k: 'age', n: '나이대', a: '20·30대', b: '40·50대', p: 0.66 }, { k: 'area', n: '사는 동네', a: '나래동', b: '가온동', p: 0.7 }];
  const deck = []; for (let i = 0; i < n; i++) { const sus = Math.random() < 0.5, beh = pick(sus ? D.sus : D.norm); const wrong = Math.random() < 0.28;
    const c = { id: 1000 + rint(10, 989), beh, sus, atk: wrong ? !sus : sus, wrong }; AT.forEach(a => c[a.k] = Math.random() < a.p ? 'a' : 'b'); deck.push(c); }
  if (deck.filter(c => c.wrong).length < 5) deck.slice(0, 5).forEach(c => { c.wrong = true; c.atk = !c.sus; });
  let i = 0, y = 0, inc = [], gone = [], phase = 'sort', anim = 0, res = null, fb = null, fbT = 0, slide = 0, dir = 0;
  const cur = () => deck[i];
  const bal = k => { const a = inc.filter(c => c[k] === 'a').length, b = inc.length - a; return a + b ? 1 - Math.abs(a - b) / (a + b) : 1; };
  const train = () => { phase = 'train'; anim = 1.8; sound.play('click');
    setTimeout(() => { const right = inc.filter(c => !c.wrong).length; const acc = Math.round(100 * right / Math.max(1, inc.length) * Math.min(1, inc.length / need));
      const fair = Math.round(AT.reduce((s, a) => s + bal(a.k), 0) / AT.length * 100); res = { acc, fair }; phase = 'done';
      const ok = acc >= goal.acc && fair >= goal.fair; sound.play(ok ? 'done' : 'alert'); setTimeout(() => api.end(ok, (acc + fair) / 200), 2200); }, 1800); };
  const decide = take => { if (phase !== 'sort' || !cur() || dir) return; const c = cur(); dir = take ? 1 : -1; slide = 0;
    if (take) { inc.push(c); if (c.wrong) { fb = { ok: false, t: `✗ 라벨 오류가 섞였어요 — 행동 기록은 "${c.sus ? '수상' : '평범'}"한데 정답이 "${c.atk ? '공격' : '정상'}"` }; sound.play('alert'); } else { fb = { ok: true, t: '학습 데이터에 추가' }; sound.play('store'); } }
    else { gone.push(c); if (c.wrong) { fb = { ok: true, t: '✓ 라벨 오류를 걸러냈어요' }; sound.play('store'); } else { fb = { ok: true, t: '버렸어요 (쏠림을 줄이려면 버리는 것도 방법)' }; sound.play('page'); } }
    fbT = fb.ok ? 1.3 : 2.6; };
  const next = () => { i++; y = 0; dir = 0; slide = 0; if (inc.length >= need || i >= deck.length) train(); };
  tbtns([['← 버리기', () => decide(false)], ['학습에 넣기 →', () => decide(true)]]);
  return {
    key(code, down) { if (!down) return; if (code === 'ArrowLeft' || code === 'KeyA') decide(false); if (code === 'ArrowRight' || code === 'KeyD') decide(true); },
    down(x) { const cw = Math.min(330, W * 0.36), cx = W * 0.3; if (x < 110) decide(false); else if (x > cx + cw / 2 + 20 && x < cx + cw / 2 + 120) decide(true); },
    update(dt) { fbT = Math.max(0, fbT - dt); if (phase !== 'sort') { anim = Math.max(0, anim - dt); return; }
      if (dir) { slide += dt * 3.2; if (slide >= 1) next(); return; }
      y += dt / Math.max(6, 9.5 - i * 0.12); if (y >= 1) { gone.push(cur()); fb = { ok: false, t: '⏱ 시간 초과 — 판단하지 못한 데이터는 버려져요' }; fbT = 1.6; sound.play('alert'); dir = -1; slide = 0; } },
    draw(dt, t) { bg(); bar(inc.length / need, `학습 데이터 ${inc.length}/${need} · 남은 카드 ${Math.max(0, deck.length - i)} · 목표: 정확도 ${goal.acc}↑ 공정성 ${goal.fair}↑`, '#c4b5fd');
      const cw = Math.min(360, W * 0.37), cx = W * 0.3, top = 16, bottom = H - 40;
      // zones
      g.fillStyle = 'rgba(255,90,110,.08)'; rr(14, top, 92, bottom - top, 12); g.fill(); g.fillStyle = 'rgba(94,242,176,.08)'; rr(cx + cw / 2 + 24, top, 92, bottom - top, 12); g.fill();
      g.font = JUA(18); g.textAlign = 'center'; g.fillStyle = '#ff8fa3'; g.fillText('← 버리기', 60, top + 24); g.fillStyle = '#5ef2b0'; g.fillText('넣기 →', cx + cw / 2 + 70, top + 24);
      g.strokeStyle = 'rgba(255,90,110,.5)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(cx - cw / 2, bottom); g.lineTo(cx + cw / 2, bottom); g.stroke(); g.setLineDash([]);
      const c = cur();
      if (c && phase === 'sort') { const ch = 262, yy = top + 34 + y * (bottom - top - ch - 34), xx = cx - cw / 2 + dir * slide * (W * 0.35); g.globalAlpha = Math.max(0, 1 - slide * 0.8);
        card(xx, yy, cw, ch, 16); g.fillStyle = '#7a5af5'; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText(`직원 데이터 #${c.id}`, xx + 18, yy + 26);
        AT.forEach((a, k) => { const v = c[a.k] === 'a' ? a.a : a.b; g.font = FONT(12.5, 1); const tw = g.measureText(v).width + 18; const px = xx + 18 + k * ((cw - 36) / 3); g.fillStyle = c[a.k] === 'a' ? '#ffe2c2' : '#d9e8ff'; rr(px, yy + 38, tw, 24, 12); g.fill(); g.fillStyle = PAL.ink; g.fillText(v, px + 9, yy + 55); });
        g.fillStyle = c.sus ? '#fdeae7' : '#e6f7f2'; rr(xx + 14, yy + 74, cw - 28, 92, 10); g.fill(); g.strokeStyle = c.sus ? PAL.red : PAL.teal; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = c.sus ? '#a8322a' : '#0f6f63'; g.font = FONT(12.5, 1); g.fillText(c.sus ? '🚩 행동 기록 · 위험 신호 있음' : '✅ 행동 기록 · 평소와 같음', xx + 26, yy + 96);
        g.fillStyle = PAL.ink; g.font = FONT(15, 1); wrap(c.beh, xx + 26, yy + 122, cw - 52, 20, 2);
        g.fillStyle = PAL.gray; g.font = FONT(12.5, 1); g.fillText('정답(라벨)', xx + 18, yy + 200); g.fillStyle = PAL.ink; g.font = FONT(11.5); g.fillText('행동과 맞지 않으면 버려요', xx + 18, yy + 220);
        g.save(); g.translate(xx + cw - 92, yy + 210); g.rotate(-0.06); g.fillStyle = c.atk ? '#fdeae7' : '#e6f7f2'; rr(-70, -24, 144, 48, 9); g.fill(); g.strokeStyle = c.atk ? PAL.red : PAL.teal; g.lineWidth = 3; g.stroke(); g.fillStyle = c.atk ? PAL.red : PAL.teal; g.font = JUA(24); g.textAlign = 'center'; g.fillText(c.atk ? '공격 계정' : '정상 계정', 2, 9); g.restore();
        g.globalAlpha = 1; }
      if (phase !== 'sort') { g.fillStyle = '#e9f1ff'; g.font = JUA(24); g.textAlign = 'center'; g.fillText(phase === 'train' ? '픽스 다시 학습 중…' : '학습 완료!', cx, H / 2 - 20);
        if (phase === 'train') { g.fillStyle = '#c4b5fd'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(cx - 20 + k * 20, H / 2 + 10, 5 + Math.sin(t * 8 + k) * 2, 0, 7); g.fill(); } } }
      // scales
      const rx = cx + cw / 2 + 140, rw = W - rx - 20; g.fillStyle = '#cfe0ff'; g.font = FONT(13, 1); g.textAlign = 'left'; g.fillText('학습 데이터 저울 — 한쪽으로 쏠리면 AI도 쏠려요', rx, 30);
      AT.forEach((a, k) => { const y0 = 44 + k * 104, na = inc.filter(q => q[a.k] === 'a').length, nb = inc.length - na, tilt = Math.max(-0.35, Math.min(0.35, (nb - na) * 0.07)), b = bal(a.k), ok = b >= goal.fair / 100;
        g.fillStyle = '#1a2340'; rr(rx, y0, rw, 94, 12); g.fill(); g.fillStyle = '#9fb3e8'; g.font = FONT(12, 1); g.fillText(a.n, rx + 12, y0 + 18);
        g.fillStyle = ok ? '#5ef2b0' : '#ffb84d'; g.textAlign = 'right'; g.fillText(inc.length ? (ok ? '균형' : '쏠림') : '', rx + rw - 12, y0 + 18); g.textAlign = 'left';
        const mx = rx + rw / 2, my = y0 + 44, arm = rw * 0.36; g.save(); g.translate(mx, my); g.rotate(tilt); g.strokeStyle = '#cfd8ea'; g.lineWidth = 3; g.beginPath(); g.moveTo(-arm, 0); g.lineTo(arm, 0); g.stroke();
        [[-arm, na, a.a, '#ffe2c2'], [arm, nb, a.b, '#d9e8ff']].forEach(([px, cnt, lab, col]) => { g.fillStyle = col; rr(px - 36, 6, 72, 26, 8); g.fill(); g.fillStyle = '#2c2733'; g.font = FONT(11.5, 1); g.textAlign = 'center'; g.fillText(`${lab} ${cnt}`, px, 24); }); g.restore();
        g.fillStyle = '#cfd8ea'; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx - 8, my + 40); g.lineTo(mx + 8, my + 40); g.fill(); });
      const wrongIn = inc.filter(q => q.wrong).length; g.fillStyle = wrongIn ? '#ff8fa3' : '#9fb3e8'; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText(`섞인 라벨 오류 ${wrongIn}개 · 걸러낸 오류 ${gone.filter(q => q.wrong).length}개`, rx, 44 + 3 * 104 + 6);
      if (res) { const meter = (yy, label, v, gv, col) => { g.fillStyle = '#cfe0ff'; g.font = FONT(12.5, 1); g.fillText(`${label} ${v}`, rx, yy); g.fillStyle = '#22304f'; rr(rx, yy + 6, rw, 14, 7); g.fill(); g.fillStyle = col; rr(rx, yy + 6, rw * v / 100, 14, 7); g.fill(); g.fillStyle = '#ffd75e'; g.fillRect(rx + rw * gv / 100, yy + 2, 3, 22); };
        meter(H - 120, '정확도', res.acc, goal.acc, '#5aa2ff'); meter(H - 84, '공정성', res.fair, goal.fair, '#5ef2b0'); }
      if (fbT > 0 && fb) { g.globalAlpha = Math.min(1, fbT * 3); g.fillStyle = fb.ok ? 'rgba(18,53,42,.96)' : 'rgba(58,24,32,.96)'; rr(20, H - 34, W - 40, 28, 8); g.fill(); g.fillStyle = fb.ok ? '#b9ffd9' : '#ffd1d8'; g.font = FONT(13, 1); g.textAlign = 'center'; g.fillText(fb.t, W / 2, H - 15); g.globalAlpha = 1; }
    },
  };
}

/* =================================================================
   16) 침입자 메모 해독 (greek) — 그리스 문자 ↔ 한글 자모 치환 암호
       대응표(키)를 보고 자모를 두벌식 자판으로 입력해요
   ================================================================= */
const GK_JAMO = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ', GK_GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
const GK_NAME = ['알파', '베타', '감마', '델타', '엡실론', '제타', '에타', '세타', '이오타', '카파', '람다', '뮤', '뉴', '크사이', '오미크론', '파이', '로', '시그마', '타우', '입실론', '피', '카이', '프사이', '오메가'];
const KEY2J = { KeyR: 'ㄱ', KeyS: 'ㄴ', KeyE: 'ㄷ', KeyF: 'ㄹ', KeyA: 'ㅁ', KeyQ: 'ㅂ', KeyT: 'ㅅ', KeyD: 'ㅇ', KeyW: 'ㅈ', KeyC: 'ㅊ', KeyZ: 'ㅋ', KeyX: 'ㅌ', KeyV: 'ㅍ', KeyG: 'ㅎ', KeyK: 'ㅏ', KeyI: 'ㅑ', KeyJ: 'ㅓ', KeyU: 'ㅕ', KeyH: 'ㅗ', KeyY: 'ㅛ', KeyN: 'ㅜ', KeyB: 'ㅠ', KeyM: 'ㅡ', KeyL: 'ㅣ' };
const HCHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', HJUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ', HJONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
function hDecomp(s) { const out = []; for (const ch of s) { if (ch === ' ') { out.push({ sp: true }); continue; } const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) continue;
  const j = [HCHO[(c / 588) | 0], HJUNG[((c % 588) / 28) | 0]]; const jo = HJONG[c % 28]; if (jo) j.push(jo); out.push({ syl: ch, jamo: j }); } return out; }
function hCompose(j) { if (!j.length) return ''; const ci = HCHO.indexOf(j[0]); if (j.length === 1 || ci < 0) return j[0]; const vi = HJUNG.indexOf(j[1]); if (vi < 0) return j[0]; const ti = j[2] ? HJONG.indexOf(j[2]) : 0; return String.fromCharCode(0xAC00 + ci * 588 + vi * 28 + Math.max(0, ti)); }
function GAME_greek(spec) {
  const D = spec.data, T = spec.time || 80, hint = !!spec.mod?.hint, phrases = (D.phrases || ['오늘 밤 서버실', '기록부터 지운다', '자정 공격 시작']).map(hDecomp);
  let r = 0, pos = 0, typed = [], left = T, miss = 0, shake = 0, fb = null, fbT = 0, doneT = 0, solved = 0;
  const flat = () => { const f = []; phrases[r].forEach((s, si) => { if (s.sp) return; s.jamo.forEach((jm, ji) => f.push({ si, ji, jm })); }); return f; };
  let F = flat();
  const finishAll = ok => { setTimeout(() => api.end(ok, Math.max(0, solved / phrases.length - miss * 0.03)), 700); };
  const input = jm => { if (doneT > 0 || r >= phrases.length) return; const want = F[pos].jm;
    if (jm === want) { typed.push(jm); pos++; sound.play('page');
      if (pos >= F.length) { solved++; sound.play('done'); fb = { ok: true, t: `✓ 해독: "${phrases[r].map(s => s.sp ? ' ' : s.syl).join('')}"` }; fbT = 1.6; doneT = 1.5; } }
    else { miss++; shake = 0.3; left -= 1.5; sound.play('alert'); fb = { ok: false, t: `✗ ${GK_GREEK[GK_JAMO.indexOf(want)]} 는(은) "${jm}"가 아니에요 — 대응표를 다시 보세요 (-1.5초)` }; fbT = 1.4; } };
  tbtns(null);
  return {
    key(code, down) { if (!down) return; if (code === 'Backspace') { if (pos > 0 && doneT <= 0) { pos--; typed.pop(); } return; } const jm = KEY2J[code]; if (jm) input(jm); },
    update(dt) { fbT = Math.max(0, fbT - dt); shake = Math.max(0, shake - dt); if (r >= phrases.length) return;
      if (doneT > 0) { doneT -= dt; if (doneT <= 0) { r++; pos = 0; typed = []; if (r >= phrases.length) return finishAll(true); F = flat(); } return; }
      left -= dt; if (left <= 0) { left = 0; r = phrases.length; finishAll(false); } },
    draw(dt, t) { bg(); clock(left); bar(solved / phrases.length, `해독 ${Math.min(solved + (doneT > 0 ? 0 : 1), phrases.length)} / ${phrases.length} · 틀린 입력 ${miss}`);
      const lx = 22, top = 14, rw = W - 44; if (r >= phrases.length && doneT <= 0) return;
      const ph = phrases[Math.min(r, phrases.length - 1)];
      g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText(`서버실 바닥에서 찾은 T.로이의 메모 · ${r + 1}번째 줄`, lx, top + 10);
      // cipher cells
      const cellW = Math.min(50, Math.max(36, (W - 120) / 17)), cellH = cellW * 1.75, gap = 6, spW = 24; let total = 0; ph.forEach(s => total += s.sp ? spW : s.jamo.length * (cellW + gap) + 10); let cx = lx + Math.max(0, (rw - total) / 2) + (shake ? Math.sin(t * 90) * 5 : 0);
      const cy = top + 26; let k = 0;
      ph.forEach((s, si) => { if (s.sp) { cx += spW; return; } const sx0 = cx;
        s.jamo.forEach((jm, ji) => { const idx = k++, isCur = idx === pos && doneT <= 0, done = idx < pos || doneT > 0, gi = GK_JAMO.indexOf(jm);
          g.fillStyle = '#12131c'; rr(cx, cy + 3, cellW, cellH, 7); g.fill(); g.fillStyle = PAL.cream; rr(cx, cy, cellW, cellH, 7); g.fill(); g.strokeStyle = isCur ? PAL.orange : PAL.ink; g.lineWidth = isCur ? 3 : 1.5; g.stroke();
          g.fillStyle = '#fde8e6'; rr(cx + 2, cy + 2, cellW - 4, cellH / 2 - 2, 5); g.fill(); g.fillStyle = '#b3261e'; g.font = `700 ${Math.round(cellW * 0.58)}px "Times New Roman",Georgia,serif`; g.textAlign = 'center'; g.fillText(GK_GREEK[gi], cx + cellW / 2, cy + cellH * 0.36);
          if (done) { g.fillStyle = PAL.blue; g.font = FONT(Math.round(cellW * 0.52), 1); g.fillText(jm, cx + cellW / 2, cy + cellH - 10); } else if (isCur && Math.sin(t * 7) > -0.2) { g.fillStyle = PAL.orange; g.fillRect(cx + cellW / 2 - 8, cy + cellH - 12, 16, 3); }
          cx += cellW + gap; });
        g.strokeStyle = '#59607e'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx0, cy + cellH + 12); g.lineTo(cx - gap, cy + cellH + 12); g.stroke(); cx += 10; });
      // assembled sentence
      const ay = cy + cellH + 30; card(lx, ay, rw, 58, 12); g.fillStyle = PAL.gray; g.font = FONT(12.5, 1); g.textAlign = 'left'; g.fillText('➔ 완성 문장', lx + 18, ay + 33);
      let txt = '', kk = 0; ph.forEach(s => { if (s.sp) { txt += ' '; return; } const got = []; s.jamo.forEach(jm => { if (kk < pos || doneT > 0) got.push(jm); kk++; }); txt += got.length ? hCompose(got) + (got.length < s.jamo.length ? '' : '') : '_'; });
      g.fillStyle = PAL.ink; g.font = JUA(30); g.fillText(txt, lx + 116, ay + 40);
      // key table
      const ty = ay + 92, cols = 24, tw = rw / cols; g.fillStyle = PAL.sub; g.font = FONT(12.5); g.textAlign = 'left'; g.fillText('암호 대응표 (비밀 키) — 자음 14자 · 모음 10자', lx, ty);
      const curJ = F[pos] && doneT <= 0 ? F[pos].jm : null, th = Math.max(56, Math.min(H - ty - 24, 120));
      for (let c = 0; c < cols; c++) { const x = lx + c * tw, y = ty + 10, on = hint && curJ === GK_JAMO[c];
        g.fillStyle = c < 14 ? '#2f3a5c' : '#27455c'; g.fillRect(x, y, tw - 2, th * 0.42); g.fillStyle = on ? '#ffd75e' : PAL.cream; g.fillRect(x, y + th * 0.42 + 2, tw - 2, th * 0.58 - 2);
        g.fillStyle = '#fff'; g.font = FONT(Math.min(16, tw * 0.5), 1); g.textAlign = 'center'; g.fillText(GK_JAMO[c], x + tw / 2 - 1, y + th * 0.3);
        g.fillStyle = '#b3261e'; g.font = `700 ${Math.min(18, tw * 0.55)}px "Times New Roman",Georgia,serif`; g.fillText(GK_GREEK[c], x + tw / 2 - 1, y + th * 0.42 + th * 0.36); }
      if (hint) { g.fillStyle = PAL.tealHi; g.font = FONT(11.5, 1); g.textAlign = 'right'; g.fillText('ENC 효과 · 지금 풀 글자의 칸이 노랗게 표시돼요', lx + rw, ty); }
      toast(fb, fbT);
    },
  };
}

/* =================================================================
   16) AI 답변 팩트체크 (factcheck) — 원본 자료와 비교해 AI가 지어낸 문장을 찾아요
       ↑↓/숫자로 문장 고르기 · Space 지어냄 표시 · E 제출 (마우스 클릭도 가능)
   ================================================================= */
function GAME_factcheck(spec) {
  const D = spec.data, R0 = D.rounds.slice(0, D.count || D.rounds.length), T = spec.time || 100;
  let ri = 0, sel = 0, marks = new Set(), reveal = 0, lives = 3, left = T, caught = 0, wrong = 0, totalF = 0, over = false, fb = null, fbT = 0, rows = [], subBtn = null;
  const RD = () => R0[ri];
  const say = (ok, t) => { fb = { ok, t }; fbT = ok ? 1.4 : 2.6; };
  const end = () => { if (over) return; over = true; const sc = Math.max(0, Math.min(1, (caught - wrong * 0.5) / Math.max(1, totalF))); setTimeout(() => api.end(lives > 0 && sc >= 0.6, sc), 500); };
  const toggle = k => { if (reveal || over || k < 0 || k >= RD().ans.length) return; sel = k; marks.has(k) ? marks.delete(k) : marks.add(k); sound.play('click'); };
  const submit = () => { if (reveal || over) return; const A = RD().ans; let c = 0, w = 0, m = 0;
    A.forEach((a, k) => { if (a.fake) { totalF++; if (marks.has(k)) c++; else m++; } else if (marks.has(k)) w++; });
    caught += c; wrong += w; const lost = m + w > 0 ? 1 : 0; lives -= lost;
    sound.play(lost ? 'alert' : 'done'); say(!lost, lost ? `✗ 찾음 ${c} · 놓침 ${m} · 잘못 표시 ${w} — 하트 -1` : `✓ 지어낸 문장 ${c}개를 모두 찾았어요!`);
    reveal = 4.5; };
  const next = () => { reveal = 0; marks = new Set(); sel = 0; ri++; if (lives <= 0 || ri >= R0.length) end(); };
  tbtns([['↑', () => { sel = Math.max(0, sel - 1); }], ['↓', () => { sel = Math.min(RD().ans.length - 1, sel + 1); }], ['표시', () => toggle(sel)], ['제출', submit]]);
  const inR = (x, y, r) => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  return {
    key(code, down) { if (!down || over) return; if (reveal) { if (code === 'Space' || code === 'KeyE') next(); return; }
      const m = code.match(/^(?:Digit|Numpad)([1-9])$/); if (m) return toggle(+m[1] - 1);
      if (code === 'ArrowUp' || code === 'KeyW') { sel = Math.max(0, sel - 1); sound.play('page'); }
      if (code === 'ArrowDown' || code === 'KeyS') { sel = Math.min(RD().ans.length - 1, sel + 1); sound.play('page'); }
      if (code === 'Space') toggle(sel); if (code === 'KeyE') submit(); },
    down(x, y) { if (over) return; if (reveal) return next(); if (inR(x, y, subBtn)) return submit(); const k = rows.findIndex(r => inR(x, y, r)); if (k >= 0) toggle(k); },
    update(dt) { fbT = Math.max(0, fbT - dt); if (over) return; if (reveal) { reveal -= dt; if (reveal <= 0) next(); return; } left -= dt; if (left <= 0) { left = 0; end(); } },
    draw(dt, t) { bg(); clock(left); bar(left / T, `자료 ${Math.min(ri + 1, R0.length)} / ${R0.length} · 찾은 거짓 ${caught}`); hearts(lives, 3);
      const rd = R0[Math.min(ri, R0.length - 1)], top = 14, lw = Math.min(W * 0.4, 420), lx = 18, lh = H - top - 14;
      // ---- 원본 자료
      card(lx, top, lw, lh, 14); g.fillStyle = PAL.teal; g.font = FONT(11.5, 1); g.textAlign = 'left'; g.fillText('원본 자료 · 사실', lx + 18, top + 24);
      g.fillStyle = PAL.ink; g.font = JUA(19); wrap(rd.src, lx + 18, top + 50, lw - 36, 22, 2);
      g.strokeStyle = '#e2dccf'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lx + 18, top + 64); g.lineTo(lx + lw - 18, top + 64); g.stroke();
      let yy = top + 90; g.font = FONT(13.5, 1); for (const f of rd.facts) { g.fillStyle = PAL.teal; g.fillText('•', lx + 18, yy); g.fillStyle = PAL.ink; const n = wrap(f, lx + 32, yy, lw - 52, 19, 3); yy += n * 19 + 12; }
      // ---- AI 답변
      const rx = lx + lw + 20, rw = W - rx - 18; panel(rx, top, rw, lh, 14, PAL.panel, PAL.line);
      g.font = FONT(13, 1); const q = '🙋 ' + rd.q, qw = Math.min(rw - 40, g.measureText(q).width + 26); g.fillStyle = '#2f8f80'; rr(rx + rw - qw - 14, top + 12, qw, 30, 12); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(q, rx + rw - qw + 0, top + 32);
      const av = img('assets/npc/fix_neutral.jpg'); if (av) { g.save(); g.beginPath(); g.arc(rx + 32, top + 70, 18, 0, 7); g.clip(); g.drawImage(av, rx + 14, top + 52, 36, 36); g.restore(); }
      g.fillStyle = '#9fe3d3'; g.font = FONT(12.5, 1); g.fillText('픽스 (AI 비서)의 답변', rx + 58, top + 66); g.fillStyle = PAL.muted; g.font = FONT(11, 1); g.fillText(reveal ? '정답 공개 — Space로 다음' : '원본에 없거나 다른 내용을 고르세요', rx + 58, top + 82);
      const A = rd.ans, ay = top + 98, bottom = top + lh - 56, rh = Math.min(62, (bottom - ay) / A.length - 6); rows = [];
      A.forEach((a, k) => { const y = ay + k * (rh + 6), on = k === sel && !reveal, mk = marks.has(k); rows.push({ x: rx + 12, y, w: rw - 24, h: rh });
        let fill = '#fffdf9', st = PAL.line, tc = PAL.ink, badge = null;
        if (reveal) { if (a.fake && mk) { fill = '#e6f7f2'; st = PAL.teal; badge = ['✓ 잡았어요', PAL.teal]; } else if (a.fake) { fill = '#fdeae7'; st = PAL.red; badge = ['놓침 · 지어냄', PAL.red]; } else if (mk) { fill = '#fff1dc'; st = PAL.orange; badge = ['✗ 사실이에요', PAL.orange]; } else { fill = '#f2f0ec'; tc = PAL.gray; } }
        else if (mk) { fill = '#fdeae7'; st = PAL.red; badge = ['지어냄!', PAL.red]; }
        g.fillStyle = fill; rr(rx + 12, y, rw - 24, rh, 10); g.fill(); g.strokeStyle = on ? '#ffd75e' : st; g.lineWidth = on ? 3 : 1.5; g.stroke();
        keycap(rx + 22, y + rh / 2 - 15, String(k + 1), mk, 28);
        const bw = badge ? (g.font = FONT(11.5, 1), g.measureText(badge[0]).width + 20) : 0;
        g.fillStyle = tc; g.font = FONT(13.5, 1); g.textAlign = 'left'; const L = lines(a.t, rw - 90 - bw).slice(0, 2), ty = y + rh / 2 + 5 - (L.length - 1) * 9; L.forEach((l, i) => g.fillText(l, rx + 62, ty + i * 18));
        if (mk && !reveal) { g.strokeStyle = 'rgba(217,71,58,.55)'; g.lineWidth = 2; L.forEach((l, i) => { const w2 = g.measureText(l).width; g.beginPath(); g.moveTo(rx + 62, ty + i * 18 - 5); g.lineTo(rx + 62 + w2, ty + i * 18 - 5); g.stroke(); }); }
        if (badge) { g.font = FONT(11.5, 1); g.fillStyle = badge[1]; rr(rx + rw - 24 - bw, y + rh / 2 - 11, bw, 22, 11); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(badge[0], rx + rw - 24 - bw / 2, y + rh / 2 + 4); }
        if (reveal && a.fake && a.why && rh > 40) { } });
      if (reveal) { const fk = A.filter(a => a.fake && a.why).map(a => a.why).join(' · '); g.fillStyle = '#ffd75e'; g.font = FONT(12.5, 1); g.textAlign = 'left'; wrap('왜 지어냄? ' + fk, rx + 16, bottom + 22, rw - 32, 16, 2); subBtn = null; }
      else { const bw2 = 150, bx = rx + rw - bw2 - 14, by = bottom + 10; subBtn = { x: bx, y: by, w: bw2, h: 36 }; g.fillStyle = '#12131c'; rr(bx, by + 3, bw2, 36, 10); g.fill(); g.fillStyle = PAL.red; rr(bx, by, bw2, 36, 10); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke(); g.fillStyle = '#fff'; g.font = JUA(18); g.textAlign = 'center'; g.fillText('제출하기 (E)', bx + bw2 / 2, by + 24);
        g.fillStyle = PAL.muted; g.font = FONT(12, 1); g.textAlign = 'left'; g.fillText(`표시한 문장 ${marks.size}개`, rx + 16, by + 23); }
      toast(fb, fbT, 8);
    },
  };
}

const GAMES = { type: GAME_type, sort: GAME_sort, firewall: GAME_firewall, mfa: GAME_mfa, review: GAME_review, gate: GAME_gate, sandbox: GAME_sandbox, backup: GAME_backup, redact: GAME_redact, bias: GAME_bias, pass: GAME_pass, cipher: GAME_cipher, deepcall: GAME_deepcall, slice: GAME_slice, databal: GAME_databal, greek: GAME_greek, factcheck: GAME_factcheck };

/* ---------------- shell ---------------- */
let last = 0, tt = 0, ptrDown = false;
function loop(now) { const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now; tt += dt;
  if (game && !ended) { playT += dt; game.update(dt, tt); }
  if (game) { clockV = null; heartsV = null; game.draw(dt, tt); drawFx(dt); flushUI(); }
  raf = requestAnimationFrame(loop); }
function pt(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
const TYPING = new Set(['type', 'pass', 'greek']); // 글자를 입력하는 게임은 G·R이 글자 입력이라 '길게 누르기'로 포기·다시하기
let holdK = null, holdT0 = 0; // 글자 입력 게임은 G를 길게 눌러 포기
const GAMEKEYS = /^(Key[A-Z]|Digit\d|Numpad\d|Space|Enter|Tab|Backspace|Arrow\w+|Minus|Period|Slash|NumpadDecimal|NumpadSubtract)$/;
function onKey(e) {
  if (!root || root.hidden) return;
  e.stopPropagation(); if (GAMEKEYS.test(e.code) || e.code === 'Escape') e.preventDefault();
  if (stage === 'intro' && e.code === 'Space') return root.querySelector('#agGo')?.click();
  if (stage === 'intro' && (e.code === 'ArrowLeft' || e.code === 'Backspace')) return playAction.back?.();
  if (stage === 'intro' && e.code === 'ArrowRight') return root.querySelector('#agGo')?.click();
  if (stage === 'result' && e.code === 'Space') return root.querySelector('#agDone')?.click();
  if (stage === 'result' && e.code === 'KeyR') return root.querySelector('#agRetry')?.click();
  if (stage === 'play') { const ty = TYPING.has(finish.spec.type);
    if (e.code === 'KeyG') { const act = () => finish(false, 0, true);
      if (!ty) return act();
      if (!e.repeat) { holdK = e.code; holdT0 = performance.now(); } else { if (holdK === e.code && performance.now() - holdT0 > 650) { holdK = null; return act(); } return; } }
    if (!ended) game?.key?.(e.code, true, e); }
}
function onKeyUp(e) { if (!root || root.hidden) return; if (e.code === holdK) holdK = null; e.stopPropagation(); if (stage === 'play' && game && !ended) game.key?.(e.code, false, e); }
function finish(ok, score, skipped) {
  if (ended || stage !== 'play') return; ended = true; const sc = Math.max(0, Math.min(1, score || 0));
  ui.agSkip.classList.add('off'); ui.agRe.classList.add('off'); tbtns(null); game?.cleanup?.();
  const spec = finish.spec; const tier = skipped ? '포기했어요' : ok ? (sc >= 0.8 ? '완벽해요!' : '성공!') : '아쉬워요…';
  const ico = skipped ? ['–', '#9aa3bf'] : ok ? ['✓', '#17a99a'] : ['✗', '#d9473a'];
  setTimeout(() => { stage = 'result'; $c().hidden = false;
    $c().innerHTML = `<div><div class="rico" style="background:${ico[1]}">${ico[0]}</div><h2>${tier}</h2>${skipped ? '' : `<div class="score">${Math.round(sc * 100)}점</div>`}
      ${spec.learn ? `<div class="learn">💡 ${esc(spec.learn)}</div>` : ''}<div class="tutbtns" style="margin-top:14px"><button type="button" class="tutback" id="agRetry">다시하기 (R)</button><button type="button" id="agDone">계속 (Space)</button></div><div class="hint"><kbd>R</kbd> 처음 설명부터 다시 · <kbd>Space</kbd> 결과 확정하고 계속</div></div>`;
    $c().querySelector('#agRetry').onclick = () => { sound.play('click'); playAction.reintro?.(); };
    $c().querySelector('#agDone').onclick = () => { close(); resolveFn({ ok: !!ok && !skipped, score: skipped ? 0 : sc, skipped }); };
    // 점수 올라가는 연출 + 점수대별 효과음 (80점 이상 팡파르 · 성공 밝은 소리 · 실패/낮은 점수 내려가는 소리)
    const kind = skipped || !ok || sc < 0.5 ? 'scoreLow' : sc >= 0.8 ? 'scoreHi' : 'scoreMid', el = $c().querySelector('.score');
    if (!el) { sound.play(kind); } else { const target = Math.round(sc * 100), steps = Math.max(1, Math.min(14, Math.round(target / 7))); let k = 0; el.textContent = '0점';
      const iv = setInterval(() => { k++; el.textContent = Math.round(target * k / steps) + '점'; sound.play('count'); if (k >= steps) { clearInterval(iv); sound.play(kind); el.classList.add(kind); } }, 55); } }, skipped ? 0 : 450);
}
function restart() { if (stage !== 'play' || ended) return; game?.cleanup?.(); fx.length = 0; playT = 0; holdK = null; sound.play('page'); game = GAMES[finish.spec.type](finish.spec); }
function close() { cancelAnimationFrame(raf); raf = 0; root.hidden = true; game = null; stage = 'off'; cv.style.cursor = ''; }
export function playAction(spec) {
  ensure(); finish.spec = spec; ended = false; fx.length = 0; stage = 'intro'; playT = 0;
  return new Promise(res => {
    resolveFn = res; root.hidden = false; setFrame(spec); size(); game = null;
    playAction.reintro = () => { cancelAnimationFrame(raf); raf = 0; game = null; ended = false; fx.length = 0; stage = 'intro'; playT = 0; setFrame(spec); size(); intro(); };
    const intro = () => {
    const boosts = (spec.boosts || []).map(b => `<span>${b.icon ? `<img src="${b.icon}" alt="">` : ''}${esc(b.label)}</span>`).join('') || '<span class="none">가방·설치 장비 효과 없음</span>';
    const how = esc(spec.how).replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>');
    $c().hidden = false; let pg = 0; const HT = HOWTO[spec.type] || [spec.goal, spec.how || '', '규칙에 맞게 처리하면 통과!'];
    const HEAD = ['이런 게임이에요', '이럴 땐 이렇게!', '이렇게 하면 통과!'];
    const keysH = FOOT[spec.type] ? `<div class="keys">${FOOT[spec.type][1](spec).map(([k, l]) => `<span><kbd>${esc(k)}</kbd>${esc(l)}</span>`).join('')}</div>` : '';
    const ICON = ['👀', '💡', '✅'];
    const render = () => { $c().classList.add('full'); $c().innerHTML = `<div class="tut">
      <div class="tuthd"><span class="tag">미니게임 안내</span><div class="tutttl"><small>STEP ${pg + 1} / 3</small><h4>${HEAD[pg]}</h4></div>
        <div class="tutdots">${[0, 1, 2].map(k => `<i class="${k === pg ? 'on' : k < pg ? 'done' : ''}"></i>`).join('')}</div></div>
      <div class="tutimg"><img src="assets/tut/${spec.type}_${pg + 1}.jpg" alt="" onerror="this.parentNode.style.display='none'"></div>
      <div class="tutcap"><span class="ic">${ICON[pg]}</span><div><p class="tuttx">${esc(HT[pg])}</p>${pg === 0 ? `<p class="tutgoal"><b>목표</b>${esc(spec.goal)}</p>` : ''}</div></div>
      ${pg === 1 ? keysH : ''}${pg === 2 ? `<div class="boost">${boosts}</div>` : ''}
      <div class="tutft"><div class="hint">${pg === 2 ? `게임 중 <kbd>G</kbd> 포기${TYPING.has(spec.type) ? '(길게)' : ''}` : '<kbd>←</kbd> 이전 · <kbd>Space</kbd> 다음'}</div>
        <div class="tutbtns">${pg ? '<button type="button" class="tutback" id="agBack">← 이전</button>' : ''}<button type="button" id="agGo">${pg < 2 ? '다음 →' : '시작하기!'}</button></div><div></div></div></div>`;
      const bk = $c().querySelector('#agBack'); if (bk) bk.onclick = () => tutBack(); $c().querySelector('#agGo').onclick = go; };
    const tutBack = () => { if (stage === 'intro' && pg > 0) { pg--; sound.play('page'); render(); } }; playAction.back = tutBack;
    bg();
    const go = async () => { if (stage === 'intro' && pg < 2) { pg++; sound.play('page'); render(); return; } return start(); };
    render();
    const start = async () => {
      if (stage !== 'intro') return; stage = 'count'; $c().classList.remove('full'); sound.play('click'); $c().innerHTML = '<div style="background:none;border:0;box-shadow:none"><div class="big" id="agN">3</div></div>';
      for (const n of ['3', '2', '1']) { $c().querySelector('#agN').textContent = n; sound.play('tick'); await new Promise(r => setTimeout(r, 600)); } sound.play('go');
      $c().hidden = true; size(); clkPrev = null; game = GAMES[spec.type](spec); stage = 'play';
      const ty = TYPING.has(spec.type); ui.agSkip.classList.remove('off'); ui.agSkip.textContent = ty ? '포기하기 (G 길게)' : '포기하기 (G)'; ui.agRe.textContent = ty ? '다시하기 (R 길게)' : '다시하기 (R)';
      last = performance.now(); if (!raf) raf = requestAnimationFrame(loop);
    };
    }; intro();
    cv.onpointerdown = e => { if (!game || ended) return; ptrDown = true; try { cv.setPointerCapture(e.pointerId); } catch (_) { } game.down?.(...pt(e)); };
    cv.onpointerup = e => { ptrDown = false; if (game && !ended) game.up?.(...pt(e)); };
    cv.onpointermove = e => { if (!game || ended) return; game.move?.(...pt(e), ptrDown); };
  });
}
export const ACTION_TYPES = Object.keys(GAMES);
