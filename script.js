let data = [];
let filterStatus = 'All';
let onlySaved = false;
let query = '';
let sortBy = 'latest';
let walletOn = false;
let toastTimer;

let saved = readLS('airdrop_tracker_bookmarks', []);
let doneTasks = readLS('airdrop_tracker_tasks', {});

const grid = document.getElementById('airdropContainer');
const searchEl = document.getElementById('searchInput');
const sortEl = document.getElementById('sortSelect');
const modal = document.getElementById('guideModal');

function readLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}

async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);

    data = await res.json();
    render();
    updateStats();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div class="col-span-full empty-state">
        <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-3"></i>
        <p class="font-semibold text-slate-700">Could not load project data.</p>
        <p class="text-xs mt-1">Make sure data.json is in the same folder.</p>
      </div>`;
    lucide.createIcons();
  }
}

function getVisible() {
  const q = query.trim().toLowerCase();

  const list = data.filter(p => {
    const text = [p.projectName, p.category, p.chain, p.status, (p.tasks || []).join(' ')]
      .join(' ').toLowerCase();

    if (q && !text.includes(q)) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (onlySaved && !saved.includes(p.id)) return false;
    return true;
  });

  if (sortBy === 'name') {
    list.sort((a, b) => a.projectName.localeCompare(b.projectName));
  } else {
    list.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
  }

  return list;
}

function getProgress(p) {
  const tasks = p.tasks || [];
  const done = (doneTasks[p.id] || []).filter(t => tasks.includes(t)).length;
  return {
    done,
    total: tasks.length,
    pct: tasks.length ? Math.round(done / tasks.length * 100) : 0
  };
}

function render() {
  const list = getVisible();
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `
      <div class="col-span-full empty-state">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-3"></i>
        <p class="font-semibold text-slate-700">No projects found.</p>
        <p class="text-xs mt-1">Try changing your search or filters.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  for (const p of list) {
    const prog = getProgress(p);
    const marked = saved.includes(p.id);

    const card = document.createElement('article');
    card.className = 'airdrop-card p-5 flex flex-col';
    card.dataset.id = p.id;

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-lg font-bold text-slate-900">${esc(p.projectName)}</h3>
              ${p.featured && p.badge ? `<span class="project-badge">${esc(p.badge)}</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 mt-1">
              ${esc(p.category)} <span class="mx-1">•</span> ${esc(p.chain)}
            </p>
          </div>

          <button onclick="toggleSaved(${p.id})" class="icon-button">
            <i data-lucide="bookmark" class="w-4 h-4 ${marked ? 'text-emerald-600 fill-emerald-600' : ''}"></i>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-5">
          <div class="info-box">
            <span>Estimated reward</span>
            <strong>${esc(p.potential)}</strong>
          </div>
          <div class="info-box">
            <span>Cost</span>
            <strong class="text-slate-700">${esc(p.cost)}</strong>
          </div>
        </div>

        <div class="mt-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-slate-500">Task progress</span>
            <span class="text-xs font-semibold text-slate-700 prog-${p.id}">${prog.done}/${prog.total}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${prog.pct}%"></div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button onclick="openTasks(${p.id})" class="secondary-button flex-1">
          <i data-lucide="list-checks" class="w-4 h-4"></i>
          Tasks
        </button>
        <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" class="primary-button">
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </a>
      </div>
    `;

    grid.appendChild(card);
  }

  lucide.createIcons();
}

function updateStats() {
  document.getElementById('total-projects').textContent = data.length;
  document.getElementById('free-projects').textContent = data.filter(p => p.costType === 'Free').length;
  document.getElementById('featured-projects').textContent = data.filter(p => p.featured).length;
  document.getElementById('active-count').textContent = data.filter(p => p.status !== 'Ended').length;

  // cuma hitung bookmark yang project-nya masih ada
  const valid = saved.filter(id => data.some(p => p.id === id));
  document.getElementById('bookmarked-count').textContent = valid.length;
}

function toggleSaved(id) {
  if (saved.includes(id)) {
    saved = saved.filter(x => x !== id);
    showToast('Removed from saved');
  } else {
    saved.push(id);
    showToast('Project saved');
  }

  localStorage.setItem('airdrop_tracker_bookmarks', JSON.stringify(saved));
  updateStats();
  render();
}

function openTasks(id) {
  const p = data.find(x => x.id === id);
  if (!p) return;

  const tasks = p.tasks || [];
  const done = doneTasks[id] || [];
  const count = done.filter(t => tasks.includes(t)).length;

  document.getElementById('modalContent').innerHTML = `
    <div>
      <div class="pr-8 pb-5 border-b border-slate-200">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900">${esc(p.projectName)}</h2>
          <span class="status-badge">${esc(p.status)}</span>
        </div>
        <p class="text-xs text-slate-500 mt-2">
          ${esc(p.category)} <span class="mx-1">•</span> ${esc(p.chain)}
        </p>
      </div>

      <div class="py-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-900">Task checklist</h3>
          <span class="text-xs text-slate-500 modal-count">${count}/${tasks.length}</span>
        </div>

        <div class="space-y-2">
          ${tasks.map(task => {
            const checked = done.includes(task);
            return `
              <label class="task-item">
                <input type="checkbox" data-task="${esc(task)}" ${checked ? 'checked' : ''}
                  onchange="toggleTask(${p.id}, this)">
                <span class="${checked ? 'line-through text-slate-400' : 'text-slate-700'}">${esc(task)}</span>
              </label>`;
          }).join('')}
        </div>
      </div>

      <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" class="primary-button w-full justify-center">
        Open official website
        <i data-lucide="external-link" class="w-4 h-4"></i>
      </a>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lucide.createIcons();
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function toggleTask(projectId, checkbox) {
  const task = checkbox.dataset.task;

  if (!doneTasks[projectId]) doneTasks[projectId] = [];

  const list = doneTasks[projectId];
  const i = list.indexOf(task);
  if (i > -1) list.splice(i, 1);
  else list.push(task);

  localStorage.setItem('airdrop_tracker_tasks', JSON.stringify(doneTasks));

  // update span strikethrough tanpa rebuild
  const span = checkbox.closest('label').querySelector('span');
  if (checkbox.checked) {
    span.classList.add('line-through', 'text-slate-400');
    span.classList.remove('text-slate-700');
  } else {
    span.classList.remove('line-through', 'text-slate-400');
    span.classList.add('text-slate-700');
  }

  // update counter di card & modal, tanpa re-render
  const p = data.find(x => x.id === projectId);
  const prog = getProgress(p);

  const cardCounter = document.querySelector(`.prog-${projectId}`);
  if (cardCounter) cardCounter.textContent = `${prog.done}/${prog.total}`;

  const card = grid.querySelector(`[data-id="${projectId}"]`);
  if (card) card.querySelector('.progress-bar').style.width = prog.pct + '%';

  const modalCounter = document.querySelector('.modal-count');
  if (modalCounter) modalCounter.textContent = `${prog.done}/${prog.total}`;
}

function toggleWallet() {
  walletOn = !walletOn;
  document.getElementById('walletBtnText').textContent =
    walletOn ? '0x09a...71F2' : 'Demo Wallet';
  showToast(walletOn ? 'Demo wallet connected' : 'Demo wallet disconnected');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('opacity-0', 'translate-y-4');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 2000);
}

searchEl.addEventListener('input', e => {
  query = e.target.value;
  render();
});

sortEl.addEventListener('change', e => {
  sortBy = e.target.value;
  render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.filterType;
    const val = btn.dataset.value;

    if (type === 'status') {
      document.querySelectorAll('[data-filter-type="status"]')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterStatus = val;
    }

    if (type === 'favorite') {
      btn.classList.toggle('active');
      onlySaved = btn.classList.contains('active');
    }

    render();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

loadData();