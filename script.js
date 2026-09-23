    // State Management
let airdropData = [];
let activeStatusFilter = 'All';
let activeCostFilter = 'All';
let isFavoriteOnly = false;
let searchQuery = '';
let bookmarks = JSON.parse(localStorage.getItem('airdrop_bookmarks')) || [];

// DOM Elements
const container = document.getElementById('airdropContainer');
const featuredContainer = document.getElementById('featuredContainer');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const activeCountEl = document.getElementById('active-count');

// Dashboard Elements
const totalProjectsEl = document.getElementById('total-projects');
const freeProjectsEl = document.getElementById('free-projects');
const bookmarkedCountEl = document.getElementById('bookmarked-count');

// 1. Fetch Data dari JSON
async function fetchAirdrops() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Gagal memuat data JSON');
    
    airdropData = await response.json();
    renderFeatured();
    renderAirdrops();
    updateDashboardStats();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    container.innerHTML = `<div class="no-results"><i class="fa-solid fa-triangle-exclamation"></i><p>Gagal memuat data airdrop. Pastikan file data.json tersedia.</p></div>`;
  }
}

// 2. Render Spotlight / Featured Airdrops
function renderFeatured() {
  featuredContainer.innerHTML = '';
  const featuredItems = airdropData.filter(item => item.featured);

  featuredItems.forEach(item => {
    const isBookmarked = bookmarks.includes(item.id);
    const cardHTML = `
      <div class="featured-card">
        <span class="featured-badge">${item.badge || '🔥 Spotlight'}</span>
        <div class="card-header">
          <div>
            <h3 class="card-title">${item.projectName}</h3>
            <span class="card-category">${item.category}</span>
          </div>
        </div>
        <div class="card-details">
          <div class="detail-item">
            <span class="detail-label">Potential:</span>
            <span class="detail-value" style="color: var(--amber-glow);">${item.potential}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Cost:</span>
            <span class="detail-value">${item.cost}</span>
          </div>
        </div>
        <div class="card-tasks">
          <button class="copy-task-btn" onclick="copyTask('${item.tasks.replace(/'/g, "\\'")}')" title="Copy tasks">
            <i class="fa-regular fa-copy"></i>
          </button>
          <strong>Tasks:</strong> ${item.tasks}
        </div>
        <a href="${item.link}" target="_blank" class="btn-farm">
          Farm Now <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;
    featuredContainer.innerHTML += cardHTML;
  });
}

// 3. Render Main Grid Airdrop
function renderAirdrops() {
  const filteredData = airdropData.filter(item => {
    const matchesSearch = item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = activeStatusFilter === 'All' ? true : item.status === activeStatusFilter;
    const matchesCost = activeCostFilter === 'All' ? true : item.costType === activeCostFilter;
    const matchesFav = isFavoriteOnly ? bookmarks.includes(item.id) : true;

    return matchesSearch && matchesStatus && matchesCost && matchesFav;
  });

  container.innerHTML = '';

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
        <p>Tidak ada airdrop yang sesuai dengan kriteria filter.</p>
      </div>`;
    return;
  }

  filteredData.forEach(item => {
    const statusClass = item.status.toLowerCase();
    const isEnded = item.status === 'Ended';
    const isBookmarked = bookmarks.includes(item.id);

    const cardHTML = `
      <div class="card">
        <div>
          <div class="card-header">
            <div>
              <h3 class="card-title">${item.projectName}</h3>
              <span class="card-category">${item.category}</span>
            </div>
            <div class="header-actions">
              <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark(${item.id})" title="Save Airdrop">
                <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
              </button>
              <span class="badge ${statusClass}">${item.status}</span>
            </div>
          </div>

          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">Est. Potential:</span>
              <span class="detail-value" style="color: var(--amber-glow);">${item.potential}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cost:</span>
              <span class="detail-value">${item.cost}</span>
            </div>
          </div>

          <div class="card-tasks">
            <button class="copy-task-btn" onclick="copyTask('${item.tasks.replace(/'/g, "\\'")}')" title="Copy tasks">
              <i class="fa-regular fa-copy"></i>
            </button>
            <strong>Tasks:</strong> ${item.tasks}
          </div>
        </div>

        <a href="${item.link}" target="_blank" class="btn-farm ${isEnded ? 'disabled' : ''}">
          ${isEnded ? 'Campaign Ended' : 'Farm Airdrop <i class="fa-solid fa-rocket"></i>'}
        </a>
      </div>
    `;

    container.innerHTML += cardHTML;
  });
}

// 4. Update Stats Dashboard
function updateDashboardStats() {
  const activeCount = airdropData.filter(item => item.status !== 'Ended').length;
  const freeCount = airdropData.filter(item => item.costType === 'Free').length;

  activeCountEl.textContent = activeCount;
  totalProjectsEl.textContent = airdropData.length;
  freeProjectsEl.textContent = freeCount;
  bookmarkedCountEl.textContent = bookmarks.length;
}

// 5. Toggle Bookmark (LocalStorage)
function toggleBookmark(id) {
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter(favId => favId !== id);
    showToast('Airdrop dihapus dari favorit');
  } else {
    bookmarks.push(id);
    showToast('Airdrop disimpan ke favorit ⭐');
  }
  
  localStorage.setItem('airdrop_bookmarks', JSON.stringify(bookmarks));
  updateDashboardStats();
  renderAirdrops();
}

// 6. Copy Task to Clipboard
function copyTask(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Task instruksi disalin ke clipboard!');
  });
}

// 7. Toast Notification Helper
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 8. Event Listeners (Search & Filter)
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderAirdrops();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filterType = btn.getAttribute('data-filter-type');
    const value = btn.getAttribute('data-value');

    if (filterType === 'status') {
      document.querySelectorAll('[data-filter-type="status"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = value;
    } else if (filterType === 'cost') {
      const isAlreadyActive = btn.classList.contains('active');
      document.querySelectorAll('[data-filter-type="cost"]').forEach(b => b.classList.remove('active'));
      if (!isAlreadyActive) {
        btn.classList.add('active');
        activeCostFilter = value;
      } else {
        activeCostFilter = 'All';
      }
    } else if (filterType === 'favorite') {
      btn.classList.toggle('active');
      isFavoriteOnly = btn.classList.contains('active');
    }

    renderAirdrops();
  });
});

// Initial Load
document.addEventListener('DOMContentLoaded', fetchAirdrops);

