/* =========================================================
   calendar.js – 캘린더 (월간 보기, 일정 추가/수정/삭제, 날짜별 상세)
   날짜를 누르면 그날의 [일정 + 할 일 + 메모]를 한 화면에서 보여줘요 (L-1, L-2)
   ========================================================= */
let calYear, calMonth;          // 지금 보고 있는 달 (month: 0~11)
let selectedDate = todayStr();  // 지금 선택한 날짜
let editingEventId = null;

// 특정 날짜에 속한 데이터를 모아서 돌려줘요
function itemsOn(date) {
  const d = store.data;
  return {
    events: d.events.filter(e => e.date === date).sort((a, b) => (a.time || '99') < (b.time || '99') ? -1 : 1),
    todos: d.todos.filter(t => t.due === date),
    memos: d.memos.filter(m => m.date === date)
  };
}

function renderCalendar() {
  if (calYear === undefined) { const n = new Date(); calYear = n.getFullYear(); calMonth = n.getMonth(); }
  $('#cal-title').textContent = `${calYear}년 ${calMonth + 1}월`;

  const first = new Date(calYear, calMonth, 1);
  const start = new Date(calYear, calMonth, 1 - first.getDay());  // 달력 첫 칸(일요일)
  const today = todayStr();
  let html = '';
  for (let i = 0; i < 42; i++) {                                   // 6주 x 7일
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const s = ymd(d);
    const { events, todos, memos } = itemsOn(s);
    const labels = [
      ...events.map(e => `<span class="cal-label ev">${esc(e.title)}</span>`),
      ...todos.map(t => `<span class="cal-label td">${t.done ? '✔ ' : ''}${esc(t.text)}</span>`)
    ];
    const shown = labels.slice(0, 2).join('');
    const more = labels.length > 2 ? `<span class="cal-label">+${labels.length - 2}</span>` : '';
    const dots = (events.length ? '<i class="dot d-event"></i>' : '')
      + (todos.length ? '<i class="dot d-todo"></i>' : '')
      + (memos.length ? '<i class="dot d-memo"></i>' : '');
    const cls = ['cal-cell', d.getMonth() !== calMonth ? 'other' : '', s === today ? 'today' : '', s === selectedDate ? 'selected' : ''].join(' ');
    html += `<button class="${cls}" data-date="${s}" aria-label="${esc(fmtDate(s))}">
      <span class="num">${d.getDate()}</span>${shown}${more}<span class="dots">${dots}</span></button>`;
  }
  $('#cal-grid').innerHTML = html;
  renderDayDetail();
}

function renderDayDetail() {
  const { events, todos, memos } = itemsOn(selectedDate);
  const evHTML = events.length
    ? events.map(e => `<button class="event-row" data-event="${esc(e.id)}">
        <span>${e.time ? '⏰ ' + esc(e.time) : '🗓️'}</span><b>${esc(e.title)}</b>
        ${e.note ? `<span class="small muted">${esc(e.note)}</span>` : ''}</button>`).join('')
    : '<p class="empty">일정이 없어요.</p>';
  const tdHTML = todos.length
    ? `<ul class="todo-list">${todos.map(todoItemHTML).join('')}</ul>`
    : '<p class="empty">마감인 할 일이 없어요.</p>';
  const mHTML = memos.length
    ? memos.map(m => `<button class="mini-memo c-${esc(m.color)}" data-memo="${esc(m.id)}"><b>${esc(m.title)}</b><span class="small">${esc(m.body.slice(0, 40))}</span></button>`).join('')
    : '<p class="empty">연결된 메모가 없어요.</p>';

  $('#cal-detail').innerHTML = `
    <h3>${esc(fmtDate(selectedDate))}${selectedDate === todayStr() ? ' · 오늘' : ''}</h3>
    <div class="detail-sec"><h4>📅 일정</h4>${evHTML}</div>
    <div class="detail-sec"><h4>✅ 할 일 (마감)</h4>${tdHTML}</div>
    <div class="detail-sec"><h4>📝 메모</h4>${mHTML}</div>
    <div class="detail-actions">
      <button class="btn primary" data-act="add-event">+ 일정 추가</button>
      <button class="btn" data-act="add-memo">+ 메모 쓰기</button>
    </div>`;
}

/* ---------- 일정 입력 창 ---------- */
function openEventDialog(id, presetDate) {
  editingEventId = id || null;
  const ev = id ? store.data.events.find(x => x.id === id) : null;
  $('#event-dialog-title').textContent = ev ? '일정 수정' : '새 일정';
  $('#event-title').value = ev ? ev.title : '';
  $('#event-date').value = ev ? ev.date : (presetDate || todayStr());
  $('#event-time').value = ev ? (ev.time || '') : '';
  $('#event-note').value = ev ? (ev.note || '') : '';
  $('#event-delete').hidden = !ev;
  $('#event-dialog').showModal();
  $('#event-title').focus();
}

function saveEvent(e) {
  e.preventDefault();
  const fields = {
    title: $('#event-title').value.trim(),
    date: $('#event-date').value,
    time: $('#event-time').value,
    note: $('#event-note').value.trim()
  };
  if (!fields.title || !fields.date) return;
  if (editingEventId) Object.assign(store.data.events.find(x => x.id === editingEventId), fields);
  else store.data.events.push({ id: uid(), ...fields });
  selectedDate = fields.date;
  const d = parseYmd(fields.date); calYear = d.getFullYear(); calMonth = d.getMonth();
  store.save();
  $('#event-dialog').close();
  renderAll();
  toast('일정을 저장했어요');
}

function deleteEvent() {
  if (!editingEventId || !confirm('이 일정을 삭제할까요? 되돌릴 수 없어요.')) return;
  store.data.events = store.data.events.filter(x => x.id !== editingEventId);
  store.save();
  $('#event-dialog').close();
  renderAll();
  toast('삭제했어요');
}

function moveMonth(delta) {
  const d = new Date(calYear, calMonth + delta, 1);
  calYear = d.getFullYear(); calMonth = d.getMonth();
  renderCalendar();
}

function initCalendar() {
  $('#cal-prev').addEventListener('click', () => moveMonth(-1));
  $('#cal-next').addEventListener('click', () => moveMonth(1));
  $('#cal-today').addEventListener('click', () => {
    const n = new Date(); calYear = n.getFullYear(); calMonth = n.getMonth(); selectedDate = todayStr(); renderCalendar();
  });
  $('#cal-grid').addEventListener('click', e => {
    const cell = e.target.closest('.cal-cell');
    if (!cell) return;
    selectedDate = cell.dataset.date;
    const d = parseYmd(selectedDate);
    if (d.getMonth() !== calMonth) { calYear = d.getFullYear(); calMonth = d.getMonth(); }
    renderCalendar();
  });
  const detail = $('#cal-detail');
  detail.addEventListener('click', e => {
    if (handleTodoClick(e)) return;
    const ev = e.target.closest('[data-event]');
    if (ev) return openEventDialog(ev.dataset.event);
    const memo = e.target.closest('[data-memo]');
    if (memo) return openMemoDialog(memo.dataset.memo);
    const act = e.target.closest('[data-act]');
    if (act && act.dataset.act === 'add-event') openEventDialog(null, selectedDate);
    if (act && act.dataset.act === 'add-memo') openMemoDialog(null, selectedDate);
  });
  detail.addEventListener('change', handleTodoChange);
  $('#event-form').addEventListener('submit', saveEvent);
  $('#event-cancel').addEventListener('click', () => $('#event-dialog').close());
  $('#event-delete').addEventListener('click', deleteEvent);
}
