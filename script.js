let airdropData = [];
let activeStatusFilter = 'All';
let isFavoriteOnly = false;
let searchQuery = '';
let currentSort = 'latest';

let bookmarks = JSON.parse(localStorage.getItem('alpha_bookmarks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('alpha_completed_tasks')) || {};
let isWalletConnected = false;

// DOM
const container = document.getElementById('airdropContainer');
const searchInput = document.getElementById('searchInput');

async function fetchAirdrops() {
  try {
    const res = await fetch('data.json');
    airdropData = await res.json();
    renderAirdrops();
    updateStats();
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

function renderAirdrops() {
  let filtered = airdropData.filter(item => {
    const matchesSearch = item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.chain.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = activeStatusFilter === 'All' ? true : item.status === activeStatusFilter;
    const matchesFav = isFavoriteOnly ? bookmarks.includes(item.id) : true;

    return matchesSearch && matchesStatus && matchesFav;
  });

  // Sort
  if (currentSort === 'name') {
    filtered.sort((a, b) => a.projectName.localeCompare(b.projectName));
  } else {
    filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
  }

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800 bg-brand-card">
        <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
        <p class="text-sm font-medium">No alpha found matching your filter criteria.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  filtered.forEach(item => {
    const isBookmarked = bookmarks.includes(item.id);
    const itemTasks = item.tasks || [];
    const doneCount = (completedTasks[item.id] || []).length;
    const progressPercent = itemTasks.length ? Math.round((doneCount / itemTasks.length) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'airdrop-card p-6 rounded-2xl bg-brand-card border border-slate-800 flex flex-col justify-between space-y-5 relative';
    
    card.innerHTML = `
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-lg text-white">${item.projectName}</h3>
              ${item.featured ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">${item.badge}</span>` : ''}
            </div>
            <span class="text-xs text-slate-400 font-medium">${item.category} • ${item.chain}</span>
          </div>
          <button onclick="toggleBookmark(${item.id})" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition">
            <i data-lucide="bookmark" class="w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}"></i>
          </button>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div>
            <span class="text-slate-500 block">Est. Reward</span>
            <span class="font-semibold text-emerald-400">${item.potential}</span>
          </div>
          <div>
            <span class="text-slate-500 block">Capital Cost</span>
            <span class="font-semibold text-slate-200">${item.cost}</span>
          </div>
        </div>

        <!-- Task Progress -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[11px] font-semibold">
            <span class="text-slate-400">Execution Progress</span>
            <span class="text-indigo-400">${doneCount}/${itemTasks.length} Done</span>
          </div>
          <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${progressPercent}%"></div>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="flex items-center gap-2 pt-2">
        <button onclick="openModal(${item.id})" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2">
          <i data-lucide="list-checks" class="w-4 h-4"></i> View Tasks
        </button>
        <a href="${item.link}" target="_blank" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center">
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </a>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

function updateStats() {
  document.getElementById('total-projects').textContent = airdropData.length;
  document.getElementById('free-projects').textContent = airdropData.filter(i => i.costType === 'Free').length;
  document.getElementById('featured-projects').textContent = airdropData.filter(i => i.featured).length;
  document.getElementById('bookmarked-count').textContent = bookmarks.length;
  document.getElementById('active-count').textContent = airdropData.filter(i => i.status !== 'Ended').length;
}

function toggleBookmark(id) {
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter(b => b !== id);
    showToast('Removed from bookmarks');
  } else {
    bookmarks.push(id);
    showToast('Saved to bookmarks ⭐');
  }
  localStorage.setItem('alpha_bookmarks', JSON.stringify(bookmarks));
  updateStats();
  renderAirdrops();
}

// Interactive Task Guide Modal
function openModal(id) {
  const item = airdropData.find(i => i.id === id);
  if (!item) return;

  const userDone = completedTasks[id] || [];

  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <div class="space-y-4">
      <div class="border-b border-slate-800 pb-4">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-black text-white">${item.projectName}</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">${item.status}</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">Ecosystem: ${item.chain} • Category: ${item.category}</p>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Task Checklist</h4>
        <div class="space-y-2">
          ${item.tasks.map((task, idx) => {
            const isChecked = userDone.includes(idx);
            return `
              <label class="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleTaskDone(${id},${idx})" class="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0">
                <span class="text-xs text-slate-200 leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}">${task}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <div class="pt-4 flex gap-3">
        <a href="${item.link}" target="_blank" class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition text-center">
          Open Official Website <i data-lucide="external-link" class="w-3.5 h-3.5 inline ml-1"></i>
        </a>
      </div>
    </div>
  `;

  document.getElementById('guideModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('guideModal').classList.add('hidden');
}

function toggleTaskDone(projectId, taskIdx) {
  if (!completedTasks[projectId]) completedTasks[projectId] = [];
  
  if (completedTasks[projectId].includes(taskIdx)) {
    completedTasks[projectId] = completedTasks[projectId].filter(i => i !== taskIdx);
  } else {
    completedTasks[projectId].push(taskIdx);
  }

  localStorage.setItem('alpha_completed_tasks', JSON.stringify(completedTasks));
  renderAirdrops();
}

// Wallet Simulation
function toggleWallet() {
  const btnText = document.getElementById('walletBtnText');
  if (!isWalletConnected) {
    isWalletConnected = true;
    btnText.textContent = '0x09a...71F2';
    showToast('Wallet Connected!');
  } else {
    isWalletConnected = false;
    btnText.textContent = 'Connect Wallet';
    showToast('Wallet Disconnected');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2200);
}

// Search & Filter Events
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderAirdrops();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-filter-type');
    const val = btn.getAttribute('data-value');

    if (type === 'status') {
      document.querySelectorAll('[data-filter-type="status"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = val;
    } else if (type === 'favorite') {
      btn.classList.toggle('active');
      isFavoriteOnly = btn.classList.contains('active');
    }
    renderAirdrops();
  });
});

function handleSort() {
  currentSort = document.getElementById('sortSelect').value;
  renderAirdrops();
}

document.addEventListener('DOMContentLoaded', fetchAirdrops);
