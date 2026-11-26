/* =========================================================
   dashboard.js – 첫 화면: 오늘의 일정, 오늘의 할 일, 최근 메모 (L-3)
   ========================================================= */
function renderDashboard() {
  const today = todayStr();
  const hour = new Date().getHours();
  const greet = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
  $('#dash-title').textContent = `${greet} ☀️`;
  $('#dash-date').textContent = `오늘은 ${fmtDate(today)}이에요.`;

  const { events, todos } = itemsOn(today);
  $('#dash-events').innerHTML = events.length
    ? events.map(e => `<button class="event-row" data-goto-date="${today}">
        <span>${e.time ? '⏰ ' + esc(e.time) : '🗓️'}</span><b>${esc(e.title)}</b></button>`).join('')
    : '<p class="empty">오늘 일정이 없어요. 여유로운 하루네요 🌿</p>';

  // 오늘 마감 + 기한이 지났는데 아직 안 끝낸 할 일
  const overdue = store.data.todos.filter(t => !t.done && t.due && t.due < today);
  const list = [...overdue, ...todos];
  $('#dash-todos').innerHTML = list.length
    ? `<ul class="todo-list">${list.map(todoItemHTML).join('')}</ul>`
    : '<p class="empty">오늘 마감인 할 일이 없어요 🎉</p>';

  const recent = sortedMemos(store.data.memos).slice(0, 3);
  $('#dash-memos').innerHTML = recent.length
    ? recent.map(m => `<button class="mini-memo c-${esc(m.color)}" data-memo="${esc(m.id)}"><b>${m.pinned ? '📌 ' : ''}${esc(m.title)}</b><span class="small">${esc(m.body.slice(0, 40))}</span></button>`).join('')
    : '<p class="empty">아직 메모가 없어요.</p>';
}

// 대시보드의 클릭 처리 (initApp 이후 한 번만 연결)
document.addEventListener('DOMContentLoaded', () => {
  const dash = document.getElementById('view-dashboard');
  dash.addEventListener('click', e => {
    if (handleTodoClick(e)) return;
    const memo = e.target.closest('[data-memo]');
    if (memo) return openMemoDialog(memo.dataset.memo);
    const go = e.target.closest('[data-goto-date]');
    if (go) { selectedDate = go.dataset.gotoDate; showView('calendar'); }
  });
  dash.addEventListener('change', handleTodoChange);
});
