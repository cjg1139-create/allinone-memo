/* =========================================================
   memo.js – 메모 기능 (작성/수정/삭제, 검색, 색상·태그, 핀 고정, 날짜 연결)
   ========================================================= */
let memoQuery = '';
let editingMemoId = null;

function sortedMemos(list) {
  // 고정된 메모가 먼저, 그다음 최근 수정 순
  return [...list].sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));
}

function memoCardHTML(m) {
  return `
    <div class="memo-card c-${esc(m.color)}" data-id="${esc(m.id)}" role="button" tabindex="0">
      <button class="pin-btn ${m.pinned ? 'on' : ''}" data-pin="${esc(m.id)}" aria-label="고정 전환" title="상단 고정">📌</button>
      <h4>${esc(m.title)}</h4>
      <p>${esc(m.body)}</p>
      ${m.tag ? `<span class="chip">#${esc(m.tag)}</span>` : ''}
      ${m.date ? `<span class="chip">📅 ${esc(fmtDate(m.date))}</span>` : ''}
    </div>`;
}

function renderMemos() {
  const q = memoQuery.trim().toLowerCase();
  const list = sortedMemos(store.data.memos.filter(m =>
    !q || `${m.title} ${m.body} ${m.tag || ''}`.toLowerCase().includes(q)));
  $('#memo-list').innerHTML = list.length
    ? list.map(memoCardHTML).join('')
    : `<p class="empty">${q ? '검색 결과가 없어요.' : '아직 메모가 없어요. "+ 새 메모"를 눌러 첫 메모를 써 보세요!'}</p>`;
  $('#memo-count').textContent = q ? `검색 결과 ${list.length}개` : `전체 ${store.data.memos.length}개`;
}

// presetDate: 캘린더에서 "이 날짜에 메모 쓰기"로 열 때 날짜를 미리 채워줘요
function openMemoDialog(id, presetDate) {
  editingMemoId = id || null;
  const m = id ? store.data.memos.find(x => x.id === id) : null;
  $('#memo-dialog-title').textContent = m ? '메모 수정' : '새 메모';
  $('#memo-title').value = m ? m.title : '';
  $('#memo-body').value = m ? m.body : '';
  $('#memo-tag').value = m ? (m.tag || '') : '';
  $('#memo-date').value = m ? (m.date || '') : (presetDate || '');
  $('#memo-pinned').checked = m ? m.pinned : false;
  const color = m ? m.color : 'pink';
  $$('input[name="memo-color"]').forEach(r => r.checked = r.value === color);
  $('#memo-delete').hidden = !m;
  $('#memo-dialog').showModal();
  $('#memo-title').focus();
}

function saveMemo(e) {
  e.preventDefault();
  const title = $('#memo-title').value.trim();
  if (!title) return;
  const fields = {
    title,
    body: $('#memo-body').value,
    tag: $('#memo-tag').value.trim().replace(/^#/, ''),
    date: $('#memo-date').value,
    pinned: $('#memo-pinned').checked,
    color: ($('input[name="memo-color"]:checked') || {}).value || 'pink',
    updatedAt: Date.now()
  };
  if (editingMemoId) {
    Object.assign(store.data.memos.find(x => x.id === editingMemoId), fields);
  } else {
    store.data.memos.push({ id: uid(), ...fields });
  }
  store.save();
  $('#memo-dialog').close();
  renderAll();
  toast('저장했어요');
}

function deleteMemo() {
  if (!editingMemoId || !confirm('이 메모를 삭제할까요? 되돌릴 수 없어요.')) return;
  store.data.memos = store.data.memos.filter(x => x.id !== editingMemoId);
  store.save();
  $('#memo-dialog').close();
  renderAll();
  toast('삭제했어요');
}

function initMemo() {
  $('#memo-new').addEventListener('click', () => openMemoDialog());
  $('#memo-search').addEventListener('input', e => { memoQuery = e.target.value; renderMemos(); });
  $('#memo-form').addEventListener('submit', saveMemo);
  $('#memo-cancel').addEventListener('click', () => $('#memo-dialog').close());
  $('#memo-delete').addEventListener('click', deleteMemo);
  const list = $('#memo-list');
  list.addEventListener('click', e => {
    const pin = e.target.closest('[data-pin]');
    if (pin) {
      const m = store.data.memos.find(x => x.id === pin.dataset.pin);
      m.pinned = !m.pinned;
      store.save();
      renderAll();
      return;
    }
    const card = e.target.closest('.memo-card');
    if (card) openMemoDialog(card.dataset.id);
  });
  list.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('memo-card')) {
      e.preventDefault();
      openMemoDialog(e.target.dataset.id);
    }
  });
}
