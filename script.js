let airdropData = [];

let activeStatusFilter = 'All';
let isFavoriteOnly = false;
let searchQuery = '';
let currentSort = 'latest';

let bookmarks = JSON.parse(
  localStorage.getItem('airdrop_tracker_bookmarks')
) || [];

let completedTasks = JSON.parse(
  localStorage.getItem('airdrop_tracker_tasks')
) || {};

let isWalletConnected = false;

const container = document.getElementById('airdropContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

async function fetchAirdrops() {
  try {
    const response = await fetch('data.json');

    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    airdropData = await response.json();

    renderAirdrops();
    updateStats();

  } catch (error) {
    console.error('Failed to load airdrop data:', error);

    container.innerHTML = `
      <div class="col-span-full empty-state">
        <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-3"></i>
        <p class="font-semibold text-slate-700">
          Could not load project data.
        </p>
        <p class="text-xs mt-1">
          Make sure data.json is in the same folder.
        </p>
      </div>
    `;

    lucide.createIcons();
  }
}

function getFilteredProjects() {
  const query = searchQuery.trim().toLowerCase();

  const filtered = airdropData.filter(project => {

    const searchableText = [
      project.projectName,
      project.category,
      project.chain,
      project.status
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      !query || searchableText.includes(query);

    const matchesStatus =
      activeStatusFilter === 'All' ||
      project.status === activeStatusFilter;

    const matchesBookmark =
      !isFavoriteOnly ||
      bookmarks.includes(project.id);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBookmark
    );
  });

  if (currentSort === 'name') {
    filtered.sort((a, b) =>
      a.projectName.localeCompare(b.projectName)
    );
  } else {
    filtered.sort(
      (a, b) =>
        new Date(b.addedDate) -
        new Date(a.addedDate)
    );
  }

  return filtered;
}

function renderAirdrops() {

  const projects = getFilteredProjects();

  container.innerHTML = '';

  if (!projects.length) {
    container.innerHTML = `
      <div class="col-span-full empty-state">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-3"></i>
        <p class="font-semibold text-slate-700">
          No projects found.
        </p>
        <p class="text-xs mt-1">
          Try changing your search or filters.
        </p>
      </div>
    `;

    lucide.createIcons();
    return;
  }

  projects.forEach(project => {

    const tasks = project.tasks || [];

    const completed = (
      completedTasks[project.id] || []
    ).filter(index => index < tasks.length);

    const doneCount = completed.length;

    const progress = tasks.length
      ? Math.round((doneCount / tasks.length) * 100)
      : 0;

    const isBookmarked =
      bookmarks.includes(project.id);

    const card = document.createElement('article');

    card.className =
      'airdrop-card p-5 flex flex-col';

    card.innerHTML = `

      <div>

        <div class="flex items-start justify-between gap-3">

          <div class="min-w-0">

            <div class="flex items-center gap-2 flex-wrap">

              <h3 class="text-lg font-bold text-slate-900">
                ${escapeHTML(project.projectName)}
              </h3>

              ${
                project.featured && project.badge
                  ? `
                    <span class="project-badge">
                      ${escapeHTML(project.badge)}
                    </span>
                  `
                  : ''
              }

            </div>

            <p class="text-xs text-slate-500 mt-1">
              ${escapeHTML(project.category)}
              <span class="mx-1">•</span>
              ${escapeHTML(project.chain)}
            </p>

          </div>

          <button
            onclick="toggleBookmark(${project.id})"
            aria-label="Save ${escapeHTML(project.projectName)}"
            class="icon-button"
          >
            <i
              data-lucide="bookmark"
              class="w-4 h-4 ${
                isBookmarked
                  ? 'text-indigo-600 fill-indigo-600'
                  : ''
              }"
            ></i>
          </button>

        </div>

        <div class="grid grid-cols-2 gap-2 mt-5">

          <div class="info-box">
            <span>Estimated reward</span>
            <strong>
              ${escapeHTML(project.potential)}
            </strong>
          </div>

          <div class="info-box">
            <span>Cost</span>
            <strong class="text-slate-700">
              ${escapeHTML(project.cost)}
            </strong>
          </div>

        </div>

        <div class="mt-5">

          <div class="flex items-center justify-between mb-2">

            <span class="text-xs font-medium text-slate-500">
              Task progress
            </span>

            <span class="text-xs font-semibold text-slate-700">
              ${doneCount}/${tasks.length}
            </span>

          </div>

          <div class="progress-track">
            <div
              class="progress-bar"
              style="width: ${progress}%"
            ></div>
          </div>

        </div>

      </div>

      <div class="flex gap-2 mt-6">

        <button
          onclick="openModal(${project.id})"
          class="secondary-button flex-1"
        >
          <i data-lucide="list-checks" class="w-4 h-4"></i>
          Tasks
        </button>

        <a
          href="${escapeAttribute(project.link)}"
          target="_blank"
          rel="noopener noreferrer"
          class="primary-button"
          aria-label="Open ${escapeHTML(project.projectName)} website"
        >
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </a>

      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

function updateStats() {

  document.getElementById('total-projects').textContent =
    airdropData.length;

  document.getElementById('free-projects').textContent =
    airdropData.filter(
      project => project.costType === 'Free'
    ).length;

  document.getElementById('featured-projects').textContent =
    airdropData.filter(
      project => project.featured
    ).length;

  document.getElementById('bookmarked-count').textContent =
    bookmarks.length;

  document.getElementById('active-count').textContent =
    airdropData.filter(
      project => project.status !== 'Ended'
    ).length;
}

function toggleBookmark(id) {

  if (bookmarks.includes(id)) {

    bookmarks = bookmarks.filter(
      bookmarkId => bookmarkId !== id
    );

    showToast('Removed from saved projects');

  } else {

    bookmarks.push(id);

    showToast('Project saved');

  }

  localStorage.setItem(
    'airdrop_tracker_bookmarks',
    JSON.stringify(bookmarks)
  );

  updateStats();
  renderAirdrops();
}

function openModal(id) {

  const project = airdropData.find(
    item => item.id === id
  );

  if (!project) return;

  const completed =
    completedTasks[id] || [];

  const modal = document.getElementById('guideModal');
  const modalContent =
    document.getElementById('modalContent');

  modalContent.innerHTML = `

    <div>

      <div class="pr-8 pb-5 border-b border-slate-200">

        <div class="flex items-center gap-2 flex-wrap">

          <h2 class="text-2xl font-bold text-slate-900">
            ${escapeHTML(project.projectName)}
          </h2>

          <span class="status-badge">
            ${escapeHTML(project.status)}
          </span>

        </div>

        <p class="text-xs text-slate-500 mt-2">
          ${escapeHTML(project.category)}
          <span class="mx-1">•</span>
          ${escapeHTML(project.chain)}
        </p>

      </div>

      <div class="py-5">

        <div class="flex items-center justify-between mb-3">

          <h3 class="text-sm font-semibold text-slate-900">
            Task checklist
          </h3>

          <span class="text-xs text-slate-500">
            ${completed.length}/${project.tasks.length}
          </span>

        </div>

        <div class="space-y-2">

          ${project.tasks.map((task, index) => {

            const checked =
              completed.includes(index);

            return `
              <label class="task-item">

                <input
                  type="checkbox"
                  ${checked ? 'checked' : ''}
                  onchange="toggleTaskDone(${project.id}, ${index})"
                >

                <span class="${
                  checked
                    ? 'line-through text-slate-400'
                    : 'text-slate-700'
                }">
                  ${escapeHTML(task)}
                </span>

              </label>
            `;

          }).join('')}

        </div>

      </div>

      <a
        href="${escapeAttribute(project.link)}"
        target="_blank"
        rel="noopener noreferrer"
        class="primary-button w-full justify-center"
      >
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

  const modal =
    document.getElementById('guideModal');

  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function toggleTaskDone(projectId, taskIndex) {

  if (!completedTasks[projectId]) {
    completedTasks[projectId] = [];
  }

  const tasks =
    completedTasks[projectId];

  if (tasks.includes(taskIndex)) {

    completedTasks[projectId] =
      tasks.filter(index => index !== taskIndex);

  } else {

    tasks.push(taskIndex);

  }

  localStorage.setItem(
    'airdrop_tracker_tasks',
    JSON.stringify(completedTasks)
  );

  renderAirdrops();
  openModal(projectId);
}

function toggleWallet() {

  const button =
    document.getElementById('walletBtnText');

  isWalletConnected =
    !isWalletConnected;

  button.textContent =
    isWalletConnected
      ? '0x09a...71F2'
      : 'Demo Wallet';

  showToast(
    isWalletConnected
      ? 'Demo wallet connected'
      : 'Demo wallet disconnected'
  );
}

function showToast(message) {

  const toast =
    document.getElementById('toast');

  document.getElementById('toastMsg')
    .textContent = message;

  toast.classList.remove(
    'opacity-0',
    'translate-y-4'
  );

  setTimeout(() => {

    toast.classList.add(
      'opacity-0',
      'translate-y-4'
    );

  }, 2000);
}

searchInput.addEventListener(
  'input',
  event => {
    searchQuery = event.target.value;
    renderAirdrops();
  }
);

sortSelect.addEventListener(
  'change',
  event => {
    currentSort = event.target.value;
    renderAirdrops();
  }
);

document
  .querySelectorAll('.filter-btn')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const type =
          button.dataset.filterType;

        const value =
          button.dataset.value;

        if (type === 'status') {

          document
            .querySelectorAll(
              '[data-filter-type="status"]'
            )
            .forEach(item =>
              item.classList.remove('active')
            );

          button.classList.add('active');

          activeStatusFilter = value;

        }

        if (type === 'favorite') {

          button.classList.toggle('active');

          isFavoriteOnly =
            button.classList.contains('active');

        }

        renderAirdrops();
      }
    );
  });

document.addEventListener(
  'keydown',
  event => {

    if (
      event.key === 'Escape'
    ) {
      closeModal();
    }

  }
);

document
  .getElementById('guideModal')
  .addEventListener(
    'click',
    event => {

      if (
        event.target.id === 'guideModal'
      ) {
        closeModal();
      }

    }
  );

function escapeHTML(value) {

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

fetchAirdrops();
