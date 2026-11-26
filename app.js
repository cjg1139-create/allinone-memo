/* =========================================================
   app.js – 공통 기능 (저장, 화면 전환, 다크 모드, 도우미 함수)
   다른 파일(memo.js 등)이 여기 있는 함수를 가져다 씁니다.
   ========================================================= */
const STORAGE_KEY = 'allinone-memo-v1';
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------- 도우미 함수 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const fmtDate = s => { const d = parseYmd(s); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
// 화면에 글자를 넣을 때 특수문자를 안전하게 바꿔요 (보안 습관)
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------- 저장소 (G-1 자동 저장) ----------
   모든 데이터는 store.data 하나에 모아 두고, 바뀔 때마다 store.save()로
   브라우저(localStorage)에 저장해요. 2단계에서 서버를 붙일 때도 이 부분만 고치면 돼요. */
const store = {
  data: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = Object.assign({ memos: [], todos: [], events: [], theme: null }, JSON.parse(raw));
        return;
      }
    } catch (e) { /* 저장된 데이터가 깨졌으면 새로 시작 */ }
    this.data = makeSample();
    this.save();
  },
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
    catch (e) { toast('저장 공간을 사용할 수 없어요. 브라우저 설정을 확인해 주세요.'); }
  }
};

// 처음 열었을 때 보이는 예시 데이터 (개인정보 없음). 지워도 괜찮아요.
function makeSample() {
  const t = todayStr();
  return {
    theme: null,
    memos: [
      { id: uid(), title: '👋 올인원 메모장 사용법', body: '메모·할 일·일정을 날짜로 연결해 한 화면에서 볼 수 있어요.\n캘린더에서 날짜를 눌러 보세요!', tag: '안내', color: 'purple', pinned: true, date: t, updatedAt: Date.now() },
      { id: uid(), title: '포트폴리오 아이디어', body: '서비스 소개 페이지 문구 다듬기\n사용자 인터뷰 질문 정리', tag: '아이디어', color: 'yellow', pinned: false, date: '', updatedAt: Date.now() - 1000 },
      { id: uid(), title: '이번 주 회고', body: '잘한 점 / 아쉬운 점 / 다음 주 목표', tag: '회고', color: 'green', pinned: false, date: addDays(t, 1), updatedAt: Date.now() - 2000 }
    ],
    todos: [
      { id: uid(), text: '이력서 초안 작성', done: false, due: t, priority: 'high' },
      { id: uid(), text: '스터디 자료 읽기', done: true, due: t, priority: 'mid' },
      { id: uid(), text: '포트폴리오 링크 정리', done: false, due: addDays(t, 2), priority: 'mid' },
      { id: uid(), text: '책 반납하기', done: false, due: '', priority: 'low' }
    ],
    events: [
      { id: uid(), title: '팀 미팅', date: t, time: '15:00', note: '온라인' },
      { id: uid(), title: '멘토링', date: addDays(t, 3), time: '10:30', note: '' }
    ]
  };
}

/* ---------- 다크 모드 (G-2) ---------- */
function applyTheme() {
  let theme = store.data.theme;
  if (!theme) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  $('#theme-btn').textContent = theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  store.data.theme = cur === 'dark' ? 'light' : 'dark';
  store.save();
  applyTheme();
}

/* ---------- 화면 전환 ---------- */
let currentView = 'dashboard';
function showView(name) {
  currentView = name;
  $$('.view').forEach(v => v.hidden = v.id !== 'view-' + name);
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  try { localStorage.setItem(STORAGE_KEY + '-view', name); } catch (e) {}
  renderAll();
  window.scrollTo(0, 0);
}

// 데이터가 바뀔 때마다 모든 화면을 다시 그려요 (데이터가 작아서 충분히 빨라요)
function renderAll() {
  renderDashboard();
  renderMemos();
  renderTodos();
  renderCalendar();
}

/* ---------- 시작 ---------- */
function initApp() {
  store.load();
  applyTheme();
  $$('.tab').forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
  $('#theme-btn').addEventListener('click', toggleTheme);
  $('#reset-btn').addEventListener('click', () => {
    if (confirm('메모, 할 일, 일정이 모두 지워지고 되돌릴 수 없어요. 계속할까요?')) {
      store.data = { memos: [], todos: [], events: [], theme: store.data.theme };
      store.save();
      renderAll();
      toast('모든 데이터를 지웠어요');
    }
  });
  initMemo();
  initTodo();
  initCalendar();
  let v = 'dashboard';
  try { v = localStorage.getItem(STORAGE_KEY + '-view') || v; } catch (e) {}
  showView(['dashboard', 'memo', 'todo', 'calendar'].includes(v) ? v : 'dashboard');
}
