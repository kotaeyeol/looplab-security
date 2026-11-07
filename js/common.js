/* Shared data + helpers for every page of "루프랩 보안팀, 7일의 방어".
   Names live only in CAST so they can be renamed in one place. */

/* ---------------- cast ----------------
   full : real name (shown only on badges / name tags, "은근히")
   call : how people address them in dialogue
   badge: whether the portrait shows the full name on an ID card */
export const COMPANY = '루프랩';
export const ATTACKER = 'T.로이';
export const CAST = {
  chaerin: { full: '홍채린', call: '홍 팀장', job: '보안팀 팀장', role: 'ADMIN', lv: 'LV.3', lvColor: '#d9473a', model: 'harin', badge: true, bag: 3 },
  boan:    { full: '서보안', call: '서 대리', job: '보안팀 대리', role: 'STAFF', lv: 'LV.1', lvColor: '#3d7fe0', model: 'juho', badge: false, bag: 4 },
  intern:  { full: '신무결', call: '신 인턴', job: '신입 개발자', color: '#e8892f', hair: 'short', hairColor: '#2b2320', badge: true, tag: 'INTERN' },
  facility:{ full: '유복구', call: '유 기사님', job: '시설 엔지니어', color: '#1f9e94', hair: 'cap', hairColor: '#1b6f69', badge: true, tag: '시설팀' },
  lead:    { full: '백신우', call: '백 실장님', job: '외부 대응팀 실장', color: '#2f3f73', hair: 'neat', hairColor: '#1f1a1a', badge: false },
  analyst: { full: '암호정', call: '암 분석가님', job: '외부 보안 분석가', color: '#4f9a5a', hair: 'bob', hairColor: '#3a2a22', badge: false },
  ceo:     { full: '안기밀', call: '안 대표님', job: `${'루프랩'} 대표`, color: '#6b5a4e', hair: 'side', hairColor: '#2a2420', badge: false },
  hr:      { full: '강차단', call: '강 과장님', job: '인사·업무 담당', color: '#b8bcc6', hair: 'long', hairColor: '#4a3328', badge: true, tag: '인사팀' },
  reporter:{ full: '', call: '이용 기관 담당자', job: '서비스 이용 기관', color: '#8a7fb0', hair: 'short', hairColor: '#2b2320', badge: false },
  courier: { full: '', call: '배송 기사님', job: '시설 물품 배송', color: '#c0632f', hair: 'cap', hairColor: '#7a3a1c', badge: false },
  fix:     { full: '픽스', call: '픽스', job: '탁상 상태 표시 로봇', robot: true },
  patch:   { full: '패치', call: '패치', job: '시설 구역 고양이', cat: true },
  unknown: { full: '', call: '미확인 발신', job: '확인되지 않은 연락', unknown: true },
};
export const HERO = ['chaerin', 'boan'];

/* protagonist photo portraits (6 expressions on disk); missing ones fall back */
const EXPR_FALLBACK = { angry: 'focused', exhausted: 'sad', worried: 'surprised' };
/* NPCs whose 8-expression art kit has arrived (assets/npc/{key}_{expr}.jpg) */
const KIT_EXPR = ['neutral', 'happy', 'focused', 'surprised', 'panicked', 'angry', 'sad', 'exhausted'];
export const NPC_ART = { chaerin: KIT_EXPR, boan: KIT_EXPR, lead: KIT_EXPR, intern: KIT_EXPR, hr: KIT_EXPR, ceo: KIT_EXPR, facility: KIT_EXPR, analyst: KIT_EXPR, fix: [...KIT_EXPR, 'worried', 'celebrate', 'help'], patch: [...KIT_EXPR, 'worried'], reporter: ['neutral', 'surprised'], courier: ['neutral', 'surprised'], unknown: ['neutral', 'glitch'] };
export function face(key, expr = 'neutral') {
  const c = CAST[key];
  if (NPC_ART[key]) { const a = NPC_ART[key];
    const e = a.includes(expr) ? expr : expr === 'worried' && a.includes('sad') ? 'sad' : ['surprised', 'panicked', 'worried'].includes(expr) && a.includes('surprised') ? 'surprised' : 'neutral';
    return `assets/npc/${key}_${e}.jpg`; }
  if (c && c.model) return `assets/${c.model}_${EXPR_FALLBACK[expr] || expr}.jpg`;
  return npcPortrait(key, expr);
}

/* placeholder NPC portraits (flat SVG busts) until real character art arrives */
const _pc = {};
export function npcPortrait(key, expr = 'neutral') {
  const id = key + ':' + expr; if (_pc[id]) return _pc[id];
  const c = CAST[key] || CAST.unknown;
  let body = '';
  if (c.robot) {
    const eye = expr === 'surprised' ? '<circle cx="78" cy="96" r="13"/><circle cx="122" cy="96" r="13"/>'
      : expr === 'happy' ? '<path d="M66 100q12-14 24 0M110 100q12-14 24 0" stroke="#7ff6ff" stroke-width="7" fill="none" stroke-linecap="round"/>'
      : '<rect x="68" y="88" width="20" height="18" rx="6"/><rect x="112" y="88" width="20" height="18" rx="6"/>';
    body = `<rect x="20" y="0" width="160" height="200" fill="#1d2440"/><rect x="40" y="150" width="120" height="40" rx="14" fill="#c9d0de"/>
      <rect x="44" y="52" width="112" height="96" rx="26" fill="#e9edf5" stroke="#2c2733" stroke-width="5"/>
      <rect x="56" y="66" width="88" height="62" rx="16" fill="#101629"/><g fill="#7ff6ff">${eye}</g>
      <line x1="100" y1="52" x2="100" y2="30" stroke="#2c2733" stroke-width="5"/><circle cx="100" cy="26" r="8" fill="#ffb84d"/>`;
  } else if (c.unknown) {
    body = `<rect width="200" height="200" fill="#1f2333"/><circle cx="100" cy="86" r="38" fill="#3a3f55"/><path d="M30 200q0-62 70-62t70 62z" fill="#3a3f55"/>
      <text x="100" y="104" font-size="54" font-family="sans-serif" font-weight="700" fill="#9aa3c0" text-anchor="middle">?</text>`;
  } else if (c.cat) {
    body = `<rect width="200" height="200" fill="#3b3550"/><path d="M48 70l14-40 28 26h20l28-26 14 40v60q0 46-52 46t-52-46z" fill="#e3a35b" stroke="#2c2733" stroke-width="5"/>
      <circle cx="80" cy="110" r="7" fill="#2c2733"/><circle cx="120" cy="110" r="7" fill="#2c2733"/><path d="M92 128q8 8 16 0" stroke="#2c2733" stroke-width="4" fill="none"/>`;
  } else {
    const skin = '#f2c9a5', hc = c.hairColor || '#2b2320';
    const hair = {
      short: `<path d="M58 84q0-44 42-44t42 44q-8-18-42-20q-30 2-42 20z" fill="${hc}"/>`,
      cap: `<path d="M56 78q0-38 44-38t44 38z" fill="${c.color}"/><rect x="52" y="72" width="104" height="10" rx="5" fill="${c.color}"/><path d="M140 80l26 6-26 2z" fill="${c.color}"/>`,
      neat: `<path d="M58 86q-2-46 42-46t42 46q-6-26-24-26q-14 10-60 26z" fill="${hc}"/>`,
      bob: `<path d="M54 116q-6-76 46-76t46 76l-10 0q2-40-36-48q-34 8-36 48z" fill="${hc}"/>`,
      side: `<path d="M58 84q0-44 44-44t40 40q-30-16-84 4z" fill="${hc}"/>`,
      long: `<path d="M52 150q-8-110 48-110t48 110l-14 0q4-64-34-70q-38 6-34 70z" fill="${hc}"/>`,
    }[c.hair || 'short'];
    const eyes = expr === 'surprised' || expr === 'worried' ? '<circle cx="86" cy="96" r="5.5"/><circle cx="114" cy="96" r="5.5"/>'
      : expr === 'happy' ? '<path d="M80 98q6-7 12 0M108 98q6-7 12 0" stroke="#2c2733" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : '<circle cx="86" cy="97" r="4.5"/><circle cx="114" cy="97" r="4.5"/>';
    const mouth = expr === 'happy' ? '<path d="M90 114q10 10 20 0" stroke="#8a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : expr === 'surprised' ? '<ellipse cx="100" cy="117" rx="6" ry="7" fill="#8a3b2e"/>'
      : expr === 'worried' ? '<path d="M90 119q10-7 20 0" stroke="#8a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : '<path d="M92 116h16" stroke="#8a3b2e" stroke-width="4" stroke-linecap="round"/>';
    const badge = c.badge ? `<path d="M84 140l16 26 16-26" stroke="#2c2733" stroke-width="3" fill="none"/>
      <rect x="76" y="160" width="48" height="34" rx="5" fill="#fffdf9" stroke="#2c2733" stroke-width="3"/>
      <rect x="76" y="160" width="48" height="9" rx="4" fill="${c.color}"/>
      <text x="100" y="182" font-size="11" font-weight="700" font-family="Noto Sans KR,sans-serif" fill="#2c2733" text-anchor="middle">${c.full}</text>
      <text x="100" y="191" font-size="6.5" font-family="sans-serif" fill="#6a6170" text-anchor="middle">${c.tag || ''}</text>` : '';
    body = `<rect width="200" height="200" fill="${c.color}" opacity=".28"/><rect width="200" height="200" fill="#efe9f4" opacity=".55"/>
      <path d="M30 200q2-66 70-66t70 66z" fill="${c.color}" stroke="#2c2733" stroke-width="5"/>
      <rect x="88" y="120" width="24" height="22" fill="${skin}"/>
      ${c.hair === 'long' || c.hair === 'bob' ? hair : ''}
      <circle cx="100" cy="94" r="40" fill="${skin}" stroke="#2c2733" stroke-width="5"/>
      ${c.hair === 'long' || c.hair === 'bob' ? `<path d="M60 90q4-42 40-44q36 2 40 44q-16-24-40-26q-24 2-40 26z" fill="${hc}"/>` : hair}
      <g fill="#2c2733">${eyes}</g>${mouth}${badge}`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${body}</svg>`;
  return _pc[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
/* josa helper: 이/가, 은/는, 을/를, 으로/로 after a Korean word */
export function josa(word, a, b) {
  const ch = word.charCodeAt(word.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) return word + b;
  const jong = (ch - 0xac00) % 28;
  if (a === '으로') return word + (jong && jong !== 8 ? '으로' : '로');
  return word + (jong ? a : b);
}

/* ---------------- gear + supplies ---------------- */
export const CONCEPT = {
  auth: { label: '사용자 인증', color: '#3d7fe0' },
  crypto: { label: '암호화', color: '#17a99a' },
  access: { label: '접근 제어', color: '#e08a1e' },
  supply: { label: '생활 물품', color: '#6b9e3a' },
  misc: { label: '기타 물품', color: '#8d7aa8' },
};
export const GEAR = {
  otp:  { code: 'OTP', name: 'OTP 등록 키트', concept: 'auth', icon: 'shield', kind: 'gear',
    desc: '로그인할 때 비밀번호 말고 일회용 번호를 한 번 더 확인해요. 비밀번호만 새어 나간 상황을 막아 줘요.',
    note: '사용자별 추가 인증. 번호를 남에게 알려 주면 보호가 약해져요.' },
  bio:  { code: 'BIO', name: '지문 인증 단말', concept: 'auth', icon: 'finger', kind: 'gear',
    desc: '지문 같은 몸의 특징으로 본인인지 확인해요. 출입문에서 누가 왔는지 확인할 때 써요.',
    note: '현장 출입 확인을 돕는 보조 수단. 원격 로그인 전체를 지키지는 못해요.' },
  enc:  { code: 'ENC', name: '암호화 키 관리 키트', concept: 'crypto', icon: 'lock', kind: 'gear',
    desc: '노트북과 중요한 자료를 암호문으로 바꾸고, 여는 열쇠(키)를 따로 보관해요.',
    note: '저장된 자료를 보호. 로그인된 세션이나 자료 삭제까지 막지는 못해요.' },
  bak:  { code: 'BAK', name: '분리 보관 백업 드라이브', concept: 'crypto', icon: 'db', kind: 'gear',
    desc: '자료의 사본을 만들어 운영 서버와 떨어진 곳에 둬요. 문제가 생기면 이 사본으로 되돌려요.',
    note: '백업을 실행하고 분리하고, 복구까지 확인해야 쓸모가 있어요. 들고만 있으면 비어 있어요.' },
  acl:  { code: 'ACL', name: '권한 정책 콘솔', concept: 'access', icon: 'userlock', kind: 'gear',
    desc: '누가, 무엇을, 언제까지 볼 수 있는지 한 화면에서 정해요. 필요한 만큼만 권한을 줘요.',
    note: '역할·대상·기한을 한눈에 확인. 없으면 기본 계정 화면에서 손으로 비교해야 해요.' },
  log:  { code: 'LOG', name: '중앙 로그 수집 장치', concept: 'access', icon: 'log', kind: 'gear',
    desc: '여러 장비의 기록을 한곳에 모아요. 누가 언제 무엇을 했는지 나중에 확인할 수 있어요.',
    note: '미리 켜 둬야 기록이 남아요. 녹화를 안 했으면 지난 일은 다시 볼 수 없어요.' },
  food: { code: 'BOX', name: '비상 물품 상자', concept: 'supply', icon: 'food', kind: 'supply',
    desc: '간편식, 물, 예비 배터리와 케이블이 든 상자예요. 오래 버티려면 작업 자원이 필요해요.',
    note: '관제실에서 한 번 열면 작업 자원이 크게 늘어요.' },
  coffee: { code: 'CUP', name: '커피·간식 꾸러미', concept: 'supply', icon: 'coffee', kind: 'supply',
    desc: '긴 밤을 버틸 커피와 간식이에요. 지쳤을 때 힘이 돼요.',
    note: '두 번 먹을 수 있어요. 하루에 한 번, 피로가 줄어요.' },
  blanket: { code: 'BLK', name: '담요', concept: 'supply', icon: 'blanket', kind: 'supply',
    desc: '라운지 소파에 있던 포근한 담요예요. 오래 버티는 환경을 만들어 줘요.',
    note: '하루를 마감할 때마다 피로가 조금씩 줄어요 (최대 20일).' },
  memo: { code: 'MEMO', name: '비밀번호 수첩', concept: 'misc', icon: 'note', kind: 'misc',
    desc: '책상에 남겨진 업무 수첩이에요. 로그인 관련 메모가 보여요.',
    note: '가지고 있는 것만으로는 문제가 없어요. 누구에게 보여 주고 어디에 옮기느냐가 중요해요.' },
  lostusb: { code: 'USB?', name: '주운 USB', concept: 'misc', icon: 'usbq', kind: 'misc',
    desc: '주인을 확인하지 못한 USB예요. 내용과 출처는 아직 몰라요.',
    note: '줍고 보관하는 것, 열어 보는 것, 실행하는 것은 서로 다른 일이에요.' },
  mkey: { code: 'KEY', name: '마스터 출입 키', concept: 'access', icon: 'key', kind: 'fixed',
    desc: '홍 팀장이 늘 지니고 다니는 관리자 키예요. 서버실 문을 열 수 있어요.',
    note: '관리자만 가진 키. 가방 한 칸을 늘 차지해요.' },
};
export const GEAR_ORDER = ['otp', 'bio', 'enc', 'bak', 'acl', 'log'];

/* ---------------- save (browser storage, per device) ---------------- */
export const SAVE_VERSION = 2;
const SAVE_KEY = 'looplab.bunker.save.v1', SET_KEY = 'looplab.bunker.settings.v1', SEEN_KEY = 'looplab.bunker.endings.v1';
function lsGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }
export const store = {
  load: () => lsGet(SAVE_KEY),
  save: s => { s.savedAt = Date.now(); return lsSet(SAVE_KEY, s); },
  clear: () => lsDel(SAVE_KEY),
  settings: () => Object.assign({ sound: true, bigText: false, funding: 'stable', vol: 0.8, volMusic: 0.8, diff: 'normal' }, lsGet(SET_KEY) || {}),
  setSettings: v => lsSet(SET_KEY, v),
  endings: () => lsGet(SEEN_KEY) || [],
};
export function newCampaign(bags) {
  const st = store.settings();
  return {
    v: 2, stage: 'bunker', createdAt: Date.now(),
    bags,                        // {boan:[ids], chaerin:['mkey',...]} — inventory by character
    day: 1, step: 'arrive',
    stats: { S: 80, T: 60, F: 10, R: 6 },
    gear: {},                    // id -> {have, set}
    cons: { food: 0, coffee: 0, blanket: 0, blanketLast: 0, usedDay: 0 },
    flags: {}, sched: [], log: [], aiLog: [], peopleLog: [],
    people: { intern: 'remote', facility: 'none', analyst: 'none', patch: 'none' },
    fixLevel: 1,                 // 1 read · 2 suggest · 3 run with approval · 4 change without review
    funding: st.funding,
  };
}

/* ---------------- model loading ----------------
   Characters ship as glTF JSON with a base64 buffer; build a GLB in memory so no
   data: URL fetch is needed (blocked by the artifact host's CSP). */
export async function fetchGLB(url, onProg) {
  const res = await fetch(url); if (!res.ok) throw new Error(res.status + ' ' + url);
  const total = +res.headers.get('content-length') || 0, parts = []; let got = 0;
  if (res.body && res.body.getReader) {
    const rd = res.body.getReader();
    for (; ;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total && onProg) onProg(Math.min(1, got / total)); }
  } else parts.push(new Uint8Array(await res.arrayBuffer()));
  const raw = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { raw.set(p, o); o += p.length; }
  const json = JSON.parse(new TextDecoder().decode(raw));
  const uri = json.buffers[0].uri, b64 = atob(uri.slice(uri.indexOf(',') + 1));
  const bin = new Uint8Array(b64.length); for (let i = 0; i < b64.length; i++) bin[i] = b64.charCodeAt(i);
  delete json.buffers[0].uri; json.buffers[0].byteLength = bin.length;
  const js = new TextEncoder().encode(JSON.stringify(json));
  const jpad = (4 - js.length % 4) % 4, bpad = (4 - bin.length % 4) % 4;
  const glb = new ArrayBuffer(12 + 8 + js.length + jpad + 8 + bin.length + bpad), dv = new DataView(glb), u8 = new Uint8Array(glb);
  dv.setUint32(0, 0x46546C67, true); dv.setUint32(4, 2, true); dv.setUint32(8, glb.byteLength, true);
  dv.setUint32(12, js.length + jpad, true); dv.setUint32(16, 0x4E4F534A, true); u8.set(js, 20); u8.fill(0x20, 20 + js.length, 20 + js.length + jpad);
  const bo = 20 + js.length + jpad; dv.setUint32(bo, bin.length + bpad, true); dv.setUint32(bo + 4, 0x004E4942, true); u8.set(bin, bo + 8);
  if (onProg) onProg(1);
  return glb;
}

/* ---------------- icons (HUD + 3D holograms) ---------------- */
export const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
export function glyph(g, kind, col, s) {
  g.save(); g.translate(s / 2, s / 2); const k = s / 256; g.scale(k, k);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 15; g.lineCap = 'round'; g.lineJoin = 'round';
  const line = (...p) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2)g.lineTo(p[i], p[i + 1]); g.stroke(); };
  if (kind === 'shield') { g.beginPath(); g.moveTo(0, -74); g.lineTo(62, -50); g.quadraticCurveTo(62, 34, 0, 76); g.quadraticCurveTo(-62, 34, -62, -50); g.closePath(); g.stroke(); line(-24, 2, -5, 22, 28, -18); }
  else if (kind === 'finger') { g.lineWidth = 11; for (let i = 0; i < 5; i++) { const r = 16 + i * 14; g.beginPath(); g.ellipse(0, 12, r * 0.82, r, 0, Math.PI * (0.92 + i * 0.015), Math.PI * (2.08 - i * 0.015)); g.stroke(); } line(0, 0, 0, 30); }
  else if (kind === 'db') { g.lineWidth = 13; g.beginPath(); g.ellipse(0, -50, 56, 19, 0, 0, Math.PI * 2); g.stroke(); line(-56, -50, -56, 50); line(56, -50, 56, 50); [0, 50].forEach(y => { g.beginPath(); g.ellipse(0, y, 56, 19, 0, 0, Math.PI); g.stroke(); }); }
  else if (kind === 'cloud') { g.beginPath(); g.arc(-34, 16, 30, Math.PI * 0.5, Math.PI * 1.5); g.arc(-2, -14, 40, Math.PI * 1.08, Math.PI * 1.92); g.arc(38, 14, 32, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); g.stroke(); line(0, 32, 0, -6); line(-14, 8, 0, -6, 14, 8); }
  else if (kind === 'userlock') { g.beginPath(); g.arc(-22, -34, 26, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(-22, 62, 54, Math.PI * 1.12, Math.PI * 1.72); g.stroke(); rr(g, 14, 2, 62, 48, 8); g.fill(); g.beginPath(); g.arc(45, 2, 17, Math.PI, 0); g.stroke(); }
  else if (kind === 'server') { g.lineWidth = 12; [-58, -14, 30].forEach(y => { rr(g, -62, y, 124, 34, 9); g.stroke(); g.beginPath(); g.arc(38, y + 17, 6, 0, Math.PI * 2); g.fill(); line(-44, y + 17, 6, y + 17); }); }
  else if (kind === 'lock') { rr(g, -46, -6, 92, 70, 12); g.stroke(); g.beginPath(); g.arc(0, -6, 30, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(0, 24, 9, 0, Math.PI * 2); g.fill(); }
  else if (kind === 'log') { g.lineWidth = 12; rr(g, -60, -70, 92, 120, 12); g.stroke(); [-40, -14, 12].forEach(y => line(-40, y, 12, y)); g.lineWidth = 14; g.beginPath(); g.arc(32, 34, 28, 0, Math.PI * 2); g.stroke(); line(52, 54, 72, 74); }
  else if (kind === 'food') { g.lineWidth = 12; rr(g, -64, -30, 128, 92, 10); g.stroke(); line(-64, -30, -40, -66, 40, -66, 64, -30); line(0, -30, 0, 62); line(-30, 16, 30, 16); }
  else if (kind === 'coffee') { g.lineWidth = 13; g.beginPath(); g.moveTo(-50, -28); g.lineTo(-40, 58); g.lineTo(30, 58); g.lineTo(40, -28); g.closePath(); g.stroke(); g.beginPath(); g.arc(52, 10, 20, -Math.PI / 2, Math.PI / 2); g.stroke(); line(-22, -50, -14, -64); line(2, -50, 10, -64); }
  else if (kind === 'blanket') { g.lineWidth = 12; rr(g, -66, -44, 132, 92, 18); g.stroke(); line(-66, -8, 66, -8); line(-66, 22, 66, 22); g.lineWidth = 9; [-44, -22, 0, 22, 44].forEach(x => line(x, 48, x, 66)); }
  else if (kind === 'note') { g.lineWidth = 12; rr(g, -50, -68, 100, 136, 10); g.stroke(); [-34, -8, 18].forEach(y => line(-28, y, 28, y)); g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.fillText('*', 0, 64); }
  else if (kind === 'usbq') { g.lineWidth = 12; rr(g, -34, -30, 68, 100, 12); g.stroke(); rr(g, -20, -62, 40, 32, 4); g.stroke(); g.font = 'bold 66px sans-serif'; g.textAlign = 'center'; g.fillText('?', 0, 46); }
  else if (kind === 'key') { g.lineWidth = 14; g.beginPath(); g.arc(-34, 0, 30, 0, Math.PI * 2); g.stroke(); line(-4, 0, 70, 0); line(48, 0, 48, 26); line(66, 0, 66, 20); }
  g.restore();
}
export function iconCanvas(kind, col, s, framed) {
  const cv = document.createElement('canvas'); cv.width = cv.height = s; const g = cv.getContext('2d');
  if (framed) {
    g.shadowColor = col; g.shadowBlur = s * 0.1; g.lineWidth = s * 0.045; g.strokeStyle = col; g.fillStyle = 'rgba(16,22,40,0.74)';
    rr(g, s * 0.12, s * 0.12, s * 0.76, s * 0.76, s * 0.16); g.fill(); g.stroke(); g.shadowBlur = s * 0.06;
  }
  const inner = s * (framed ? 0.56 : 0.86); g.translate((s - inner) / 2, (s - inner) / 2); glyph(g, kind, framed ? '#ffffff' : col, inner);
  return cv;
}
const _icons = {};
export function gearIcon(id, size = 96) {
  const k = id + size; if (_icons[k]) return _icons[k];
  const gd = GEAR[id]; return _icons[k] = iconCanvas(gd.icon, CONCEPT[gd.concept].color, size, true).toDataURL();
}

/* ---------------- tiny synth sound (no audio files) ---------------- */
let actx = null, master = null, hum = null;
/* 소리 크기: 설정의 전체 소리(0~1) → 실제 출력. 기본 80% = 예전보다 약 1.7배 크게 */
const masterGain = () => 0.75 * Math.max(0, Math.min(1, store.settings().vol ?? 0.8));
const musicGain = () => 0.5 * Math.max(0, Math.min(1, store.settings().volMusic ?? 0.8));
export const sound = {
  on: store.settings().sound,
  ctx() {
    if (!this.on) return null;
    try { if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = masterGain(); master.connect(actx.destination); } if (actx.state === 'suspended') actx.resume(); } catch (e) { return null; }
    return actx;
  },
  setVol(v) { const s = store.settings(); s.vol = v; store.setSettings(s); if (master && actx) master.gain.setTargetAtTime(masterGain(), actx.currentTime, 0.03); },
  set(on) { this.on = on; const s = store.settings(); s.sound = on; store.setSettings(s); if (!on) { this.stopHum(); bgm.stop(true); if (actx) actx.suspend(); } else { const w = bgm.want; bgm.cur = null; bgm.mode(w); } },
  tone(f, d = 0.12, type = 'sine', v = 0.3, t0 = 0, f2) {
    const a = this.ctx(); if (!a) return; const t = a.currentTime + t0;
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
  },
  play(name) {
    switch (name) {
      case 'click': this.tone(660, 0.06, 'triangle', 0.12); break;
      case 'notify': this.tone(880, 0.12, 'sine', 0.22); this.tone(1320, 0.18, 'sine', 0.18, 0.11); break;
      case 'intercom': [0, 0.5].forEach(d => { this.tone(740, 0.16, 'square', 0.08, d); this.tone(587, 0.2, 'square', 0.08, d + 0.18); }); break;
      case 'done': this.tone(523, 0.1, 'triangle', 0.2); this.tone(659, 0.1, 'triangle', 0.2, 0.09); this.tone(784, 0.22, 'triangle', 0.2, 0.18); break;
      case 'store': this.tone(330, 0.08, 'triangle', 0.18); this.tone(494, 0.14, 'triangle', 0.18, 0.07); break;
      case 'door': this.tone(110, 0.6, 'sawtooth', 0.06, 0, 70); break;
      case 'alert': this.tone(620, 0.25, 'sine', 0.16); this.tone(620, 0.25, 'sine', 0.1, 0.4); break;
      case 'page': this.tone(1200, 0.04, 'triangle', 0.06); break;
      // 3·2·1 카운트다운: 숫자마다 짧은 삑, 마지막(시작/0)은 높고 긴 삑
      case 'tick': this.tone(880, 0.09, 'square', 0.09); this.tone(880, 0.09, 'sine', 0.14); break;
      case 'go': this.tone(1320, 0.32, 'square', 0.08); this.tone(1760, 0.32, 'sine', 0.14, 0.02); break;
      case 'count': this.tone(1500, 0.025, 'triangle', 0.05); break;
      // 점수 효과음: 높음(팡파르) · 보통(밝은 3음) · 낮음(내려가는 소리)
      case 'scoreHi': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.2, i * 0.09)); this.tone(1047, 0.5, 'sine', 0.16, 0.36); this.tone(1319, 0.5, 'sine', 0.12, 0.36); this.tone(1568, 0.6, 'sine', 0.1, 0.42); break;
      case 'scoreMid': this.tone(523, 0.12, 'triangle', 0.18); this.tone(659, 0.12, 'triangle', 0.18, 0.1); this.tone(784, 0.3, 'triangle', 0.18, 0.2); break;
      case 'scoreLow': this.tone(392, 0.22, 'triangle', 0.16); this.tone(330, 0.22, 'triangle', 0.16, 0.2); this.tone(262, 0.5, 'triangle', 0.16, 0.4, 220); break;
    }
  },
  startHum() {
    const a = this.ctx(); if (!a || hum) return;
    const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
    n.buffer = b; n.loop = true; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = a.createGain(); g.gain.value = 0.18;
    n.connect(f); f.connect(g); g.connect(master); n.start(); hum = { n, g };
  },
  stopHum() { if (hum) { try { hum.n.stop(); } catch (e) { } hum = null; } },
};

/* ---------------- 배경음 (파일 없이 실시간 합성) ----------------
   prep   : 비상 경보 — 빠른 베이스 펄스와 경고음 (150bpm, D단조)
   office : 평소 사무실 — 잔잔한 로파이 건반 (92bpm, 장7화음)
   bunker : 지하 관제실 — 어둡고 낮은 신스 패드와 모니터 신호음 (80bpm, A단조)
   game   : 미니게임 — 빠르게 몰아치는 아르페지오 (128bpm)
   night  : 하루 끝 — 오르골 같은 조용한 소리 (68bpm)
   ending : 엔딩 — 밝은 패드 (72bpm)                                   */
const MT = {
  prep:   { bpm: 150, bars: [[50, 53, 57], [50, 53, 57], [46, 50, 53], [48, 52, 55]], pad: 0.05, cut: 900,  bass: 'pulse8', arp: 'alarm', hat: 'eighth', kick: 'four' },
  office: { bpm: 92,  bars: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], pad: 0.035, cut: 1600, bass: 'half', arp: 'keys', hat: 'off', kick: 'lofi' },
  bunker: { bpm: 80,  bars: [[45, 48, 52], [41, 45, 48, 52], [38, 41, 45, 48], [40, 44, 47]], pad: 0.06, cut: 620,  bass: 'sub', arp: 'ping', hat: 'sparse', kick: 'heart' },
  game:   { bpm: 128, bars: [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]], pad: 0.03, cut: 1200, bass: 'sixteen', arp: 'fast', hat: 'eighth', kick: 'four' },
  night:  { bpm: 68,  bars: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]], pad: 0.04, cut: 900, bass: 'whole', arp: 'box', hat: 'none', kick: 'none' },
  ending: { bpm: 72,  bars: [[48, 52, 55, 60], [43, 47, 50, 55], [45, 48, 52, 57], [41, 45, 48, 53]], pad: 0.05, cut: 1400, bass: 'whole', arp: 'box', hat: 'none', kick: 'none' },
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let bus = null, noiseBuf = null;
export const bgm = {
  on: store.settings().music !== false, cur: null, want: null, step: 0, next: 0, timer: 0, get vol() { return musicGain(); },
  _bus() {
    const a = sound.ctx(); if (!a) return null;
    if (!bus) { bus = a.createGain(); bus.gain.value = 0; bus.connect(master);
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    return a;
  },
  set(on) { this.on = on; const s = store.settings(); s.music = on; store.setSettings(s); if (on) { const w = this.want; this.cur = null; this.mode(w); } else this.stop(true); },
  toggle() { this.set(!this.on); return this.on; },
  setVol(v) { const s = store.settings(); s.volMusic = v; store.setSettings(s); if (bus && actx && this.cur) bus.gain.setTargetAtTime(Math.max(0.0001, this.vol), actx.currentTime, 0.05); },
  mode(name) {
    this.want = name; if (!name || !this.on || !sound.on) return this.stop(true);
    if (name === this.cur && this.timer) return;
    const a = this._bus(); if (!a) return;
    const t = a.currentTime;
    bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0.0001, t + 0.5);
    clearTimeout(this._sw);
    this._sw = setTimeout(() => {
      this.cur = name; this.step = 0; this.next = a.currentTime + 0.08;
      bus.gain.cancelScheduledValues(a.currentTime); bus.gain.setValueAtTime(0.0001, a.currentTime); bus.gain.linearRampToValueAtTime(this.vol, a.currentTime + 1.2);
      if (!this.timer) this.timer = setInterval(() => this._tick(), 40);
    }, this.timer ? 520 : 0);
  },
  stop(keepWant) {
    clearTimeout(this._sw); if (this.timer) { clearInterval(this.timer); this.timer = 0; }
    if (bus && actx) { const t = actx.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0.0001, t + 0.4); }
    this.cur = null; if (!keepWant) this.want = null;
  },
  _tick() {
    if (!actx || !this.cur) return; if (actx.state !== 'running') return;
    const th = MT[this.cur], sp = 60 / th.bpm / 4;
    if (this.next < actx.currentTime - 0.3) this.next = actx.currentTime + 0.05;
    while (this.next < actx.currentTime + 0.25) { this._step(th, this.step, this.next, sp); this.step++; this.next += sp; }
  },
  _osc(type, f, t, d, v, opt = {}) {
    const a = actx, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (opt.det) o.detune.value = opt.det;
    let out = g; if (opt.cut) { const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = opt.cut; fl.Q.value = opt.q || 0.7; g.connect(fl); out = fl; }
    const at = opt.at || 0.01; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.setValueAtTime(v, t + Math.max(at, d - (opt.rel || 0.05)));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + (opt.tail || 0.02));
    o.connect(g); out.connect(bus); o.start(t); o.stop(t + d + (opt.tail || 0.02) + 0.05);
  },
  _noise(t, d, v, hp = 6000) {
    const a = actx, n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); n.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(f); f.connect(g); g.connect(bus); n.start(t); n.stop(t + d + 0.02);
  },
  _kick(t, v = 0.5) { const a = actx, o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.25); },
  _step(th, s, t, sp) {
    const bar = Math.floor(s / 16), i = s % 16, ch = th.bars[bar % th.bars.length], root = ch[0], barLen = sp * 16;
    // pad: chord at the start of each bar, two detuned saws through a lowpass
    if (i === 0 && th.pad) for (const m of ch) { this._osc('sawtooth', hz(m + 12), t, barLen, th.pad / ch.length * 1.6, { det: -7, cut: th.cut, at: barLen * 0.25, rel: barLen * 0.3, tail: 0.4 }); this._osc('sawtooth', hz(m + 12), t, barLen, th.pad / ch.length * 1.6, { det: 7, cut: th.cut, at: barLen * 0.25, rel: barLen * 0.3, tail: 0.4 }); }
    // bass
    const B = th.bass, bf = hz(root - 12);
    if (B === 'pulse8' && i % 2 === 0) this._osc('sawtooth', bf, t, sp * 1.6, 0.11, { cut: 420, q: 4 });
    if (B === 'sixteen') this._osc('sawtooth', i % 4 === 3 ? bf * 2 : bf, t, sp * 0.8, 0.1, { cut: 520 + (i % 8) * 60, q: 5 });
    if (B === 'half' && (i === 0 || i === 8 || i === 14)) this._osc('triangle', i === 14 ? hz(ch[2] - 12) : bf, t, sp * (i === 14 ? 2 : 5), 0.2);
    if (B === 'sub' && (i === 0 || i === 10)) this._osc('sine', bf, t, sp * 6, 0.24, { at: 0.06 });
    if (B === 'whole' && i === 0) this._osc('sine', bf, t, barLen, 0.16, { at: 0.2, rel: 0.6 });
    // melody / arpeggio
    const A = th.arp;
    if (A === 'alarm' && (i === 0 || i === 8)) { this._osc('square', 1046, t, 0.12, 0.035, { cut: 3000 }); this._osc('square', 880, t + 0.14, 0.14, 0.03, { cut: 3000 }); }
    if (A === 'alarm' && i % 4 === 2) this._osc('triangle', hz(ch[(i >> 2) % ch.length] + 24), t, sp * 0.8, 0.035);
    if (A === 'keys') { const pat = [0, -1, 2, -1, -1, 1, -1, 3, -1, -1, 2, -1, 1, -1, -1, -1]; const k = pat[i]; if (k >= 0 && (bar % 2 || i < 12)) { const f = hz(ch[k % ch.length] + 12); this._osc('triangle', f, t, sp * 3, 0.07, { at: 0.005, rel: sp * 2 }); this._osc('sine', f * 2, t, sp * 1.5, 0.02); } }
    if (A === 'ping' && (i === 4 || i === 7 || (bar % 2 && i === 12))) { const f = hz(ch[(i + bar) % ch.length] + 24); this._osc('sine', f, t, 0.5, 0.05, { at: 0.004, tail: 0.6 }); this._osc('sine', f, t + sp * 3, 0.4, 0.018, { at: 0.004, tail: 0.5 }); }
    if (A === 'fast') { const f = hz(ch[i % ch.length] + (i % 8 < 4 ? 24 : 36)); this._osc('square', f, t, sp * 0.7, 0.028, { cut: 2600 }); }
    if (A === 'box' && i % 4 === 0) { const f = hz(ch[(i / 4 + bar) % ch.length] + 24); this._osc('sine', f, t, 0.8, 0.06, { at: 0.004, tail: 0.9 }); this._osc('sine', f * 3, t, 0.25, 0.01, { at: 0.004 }); }
    // drums
    const K = th.kick, H = th.hat;
    if (K === 'four' && i % 4 === 0) this._kick(t, 0.42);
    if (K === 'lofi' && (i === 0 || i === 10)) this._kick(t, 0.3);
    if (K === 'lofi' && (i === 4 || i === 12)) this._noise(t, 0.12, 0.05, 1800);
    if (K === 'heart' && (i === 0 || i === 3)) this._kick(t, i ? 0.16 : 0.24);
    if (H === 'eighth' && i % 2 === 0) this._noise(t, 0.03, i % 4 === 2 ? 0.05 : 0.025);
    if (H === 'off' && i % 4 === 2) this._noise(t, 0.04, 0.03);
    if (H === 'sparse' && i === 8 && bar % 2) this._noise(t, 0.3, 0.02, 3000);
  },
};

/* ---------------- 설정 패널 (메인 화면·게임 일시정지에서 함께 사용) ----------------
   전체 소리 · 배경음 크기 슬라이더 + 난이도(쉬움/보통/어려움) */
export const DIFF_INFO = { easy: ['쉬움', '천천히 · 시간 넉넉 · 하트 +1'], normal: ['보통', '처음 하는 학생에게 맞춘 기본값'], hard: ['어려움', '빠른 속도 · 하트 3개 · 통과 기준 높음'] };
export function mountSettings(el) {
  if (!document.getElementById('setPanelCss')) { const st = document.createElement('style'); st.id = 'setPanelCss'; st.textContent = `
.setp{display:grid;gap:8px;margin:10px 0 4px;text-align:left}
.setp .row2{background:rgba(127,127,160,.13);border-radius:12px;padding:9px 13px;display:grid;grid-template-columns:96px 1fr 46px;align-items:center;gap:10px;font-size:14.5px}
.setp .row2 b{font-weight:700}
.setp input[type=range]{width:100%;accent-color:#17a99a;height:22px;cursor:pointer}
.setp .pct{text-align:right;font-variant-numeric:tabular-nums;font-weight:700;font-size:13.5px;opacity:.85}
.setp .diff{background:rgba(127,127,160,.13);border-radius:12px;padding:9px 13px}
.setp .diff .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:14.5px;margin-bottom:7px}
.setp .diff .hd small{opacity:.7;font-size:12.5px}
.setp .seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.setp .seg button{padding:7px 0;border-radius:10px;font-size:14.5px;font-weight:700;cursor:pointer;text-align:center}
.setp .seg button.on{background:#17a99a!important;color:#fff!important;border-color:#0e7d71!important}
.setp .note{font-size:12px;opacity:.65;margin-top:6px}`; document.head.appendChild(st); }
  const s = store.settings(), pc = v => Math.round(v * 100) + '%';
  el.innerHTML = `<div class="setp">
    <label class="row2"><b>전체 소리</b><input type="range" min="0" max="100" step="5" data-k="vol" value="${Math.round((s.vol ?? 0.8) * 100)}"><span class="pct">${pc(s.vol ?? 0.8)}</span></label>
    <label class="row2"><b>배경음 크기</b><input type="range" min="0" max="100" step="5" data-k="volMusic" value="${Math.round((s.volMusic ?? 0.8) * 100)}"><span class="pct">${pc(s.volMusic ?? 0.8)}</span></label>
    <div class="diff"><div class="hd"><b>미니게임 난이도</b><small data-d></small></div><div class="seg">${Object.keys(DIFF_INFO).map(k => `<button type="button" data-diff="${k}">${DIFF_INFO[k][0]}</button>`).join('')}</div><div class="note">바꾼 난이도는 다음 미니게임부터 적용돼요.</div></div></div>`;
  const syncD = () => { const d = store.settings().diff || 'normal'; el.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('on', b.dataset.diff === d)); el.querySelector('[data-d]').textContent = DIFF_INFO[d][1]; };
  el.querySelectorAll('input[type=range]').forEach(r => { r.addEventListener('input', () => { const v = +r.value / 100; r.nextElementSibling.textContent = pc(v);
    if (r.dataset.k === 'vol') { if (!sound.on && v > 0) sound.set(true); sound.setVol(v); } else bgm.setVol(v); });
    r.addEventListener('change', () => sound.play('notify')); r.addEventListener('keydown', e => e.stopPropagation()); });
  el.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { const s2 = store.settings(); s2.diff = b.dataset.diff; store.setSettings(s2); sound.play('click'); syncD(); });
  syncD();
}
