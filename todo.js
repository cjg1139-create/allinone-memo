/* =========================================================
   todo.js – 할 일 기능 (추가/완료/삭제, 마감일, 우선순위, 필터, 진행률)
   ========================================================= */
let todoFilter = 'all';
const PRIORITY = { high: ['🔴', '높음'], mid: ['🟡', '보통'], low: ['🟢', '낮음'] };
const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };

// 할 일 한 줄 HTML (할 일 화면, 캘린더 상세, 대시보드에서 같이 써요)
function todoItemHTML(t) {
  const overdue = t.due && !t.done && t.due < todayStr();
  const [icon, label] = PRIORITY[t.priority] || PRIORITY.mid;
  return `
    <li class="todo-item ${t.done ? 'done' : ''}">
      <input type="checkbox" data-todo-check="${esc(t.id)}" ${t.done ? 'checked' : ''} aria-label="완료 체크">
      <div class="grow">
        <span>${esc(t.text)}</span><br>
        <span class="small muted">${icon} ${label}</span>
        ${t.due ? `<span class="small ${overdue ? 'overdue' : 'muted'}"> · 마감 ${esc(fmtDate(t.due))}${overdue ? ' (지남)' : ''}</span>` : ''}
      </div>
      <button class="del-btn" data-todo-del="${esc(t.id)}" aria-label="삭제">🗑️</button>
    </li>`;
}

function renderTodos() {
  const all = store.data.todos;
  const done = all.filter(t => t.done).length;
  $('#todo-progress-text').textContent = `${all.length}개 중 ${done}개 완료`;
  $('#todo-bar').style.width = all.length ? `${Math.round(done / all.length * 100)}%` : '0';
  $$('.chip-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === todoFilter));

  const list = all
    .filter(t => todoFilter === 'all' || (todoFilter === 'done' ? t.done : !t.done))
    .sort((a, b) => (a.done - b.done)
      || ((a.due || '9999') < (b.due || '9999') ? -1 : (a.due || '9999') > (b.due || '9999') ? 1 : 0)
      || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  $('#todo-list').innerHTML = list.length
    ? list.map(todoItemHTML).join('')
    : `<li class="empty">${all.length ? '이 조건에 맞는 할 일이 없어요.' : '아직 할 일이 없어요. 위에서 추가해 보세요!'}</li>`;
}

function toggleTodo(id) {
  const t = store.data.todos.find(x => x.id === id);
  if (t) { t.done = !t.done; store.save(); renderAll(); }
}
function deleteTodo(id) {
  store.data.todos = store.data.todos.filter(x => x.id !== id);
  store.save();
  renderAll();
}

// 체크/삭제 버튼 클릭을 한 곳에서 처리하는 공통 함수 (여러 화면이 같이 써요)
function handleTodoClick(e) {
  const del = e.target.closest('[data-todo-del]');
  if (del) { deleteTodo(del.dataset.todoDel); return true; }
  return false;
}
function handleTodoChange(e) {
  const chk = e.target.closest('[data-todo-check]');
  if (chk) { toggleTodo(chk.dataset.todoCheck); return true; }
  return false;
}

function initTodo() {
  $('#todo-form').addEventListener('submit', e => {
    e.preventDefault();
    const text = $('#todo-text').value.trim();
    if (!text) return;
    store.data.todos.push({ id: uid(), text, done: false, due: $('#todo-due').value, priority: $('#todo-priority').value });
    store.save();
    $('#todo-text').value = '';
    $('#todo-due').value = '';
    renderAll();
    $('#todo-text').focus();
  });
  $$('.chip-btn').forEach(b => b.addEventListener('click', () => { todoFilter = b.dataset.filter; renderTodos(); }));
  $('#todo-list').addEventListener('click', handleTodoClick);
  $('#todo-list').addEventListener('change', handleTodoChange);
}
