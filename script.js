// Variable State
let airdropData = [];
let activeFilter = 'All';
let searchQuery = '';

// DOM Elements
const container = document.getElementById('airdropContainer');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const activeCountEl = document.getElementById('active-count');

// 1. Fetch Data dari JSON
async function fetchAirdrops() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Gagal memuat data JSON');
    
    airdropData = await response.json();
    renderAirdrops();
    updateActiveCount();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    container.innerHTML = `<p class="no-results">Gagal memuat data airdrop. Pastikan file JSON tersedia dan diakses melalui local/web server.</p>`;
  }
}

// 2. Function Render Kartu Airdrop ke HTML
function renderAirdrops() {
  // Filter berdasarkan Search Query & Filter Button
  const filteredData = airdropData.filter(item => {
    const matchesSearch = item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' ? true : item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Kosongkan container
  container.innerHTML = '';

  // Jika tidak ada data yang cocok
  if (filteredData.length === 0) {
    container.innerHTML = `<p class="no-results">Tidak ada airdrop yang sesuai dengan pencarian.</p>`;
    return;
  }

  // Render setiap item ke card HTML
  filteredData.forEach(item => {
    const statusClass = item.status.toLowerCase();
    const isEnded = item.status === 'Ended';

    const cardHTML = `
      <div class="card">
        <div>
          <div class="card-header">
            <div>
              <h3 class="card-title">${item.projectName}</h3>
              <span class="card-category">${item.category}</span>
            </div>
            <span class="badge ${statusClass}">${item.status}</span>
          </div>

          <div class="card-details">
            <div class="detail-item">
              <span class="detail-label">Est. Potential:</span>
              <span class="detail-value">${item.potential}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Cost:</span>
              <span class="detail-value">${item.cost}</span>
            </div>
          </div>

          <div class="card-tasks">
            <strong>Tasks:</strong> ${item.tasks}
          </div>
        </div>

        <a href="${item.link}" target="_blank" class="btn-farm ${isEnded ? 'disabled' : ''}">
          ${isEnded ? 'Campaign Ended' : 'Farm Airdrop 🚀'}
        </a>
      </div>
    `;

    container.innerHTML += cardHTML;
  });
}

// 3. Update Hitungan Airdrop Aktif
function updateActiveCount() {
  const activeCount = airdropData.filter(item => item.status !== 'Ended').length;
  activeCountEl.textContent = activeCount;
}

// 4. Event Listener untuk Search Input
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderAirdrops();
});

// 5. Event Listener untuk Filter Buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Ubah status tombol aktif
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Set filter aktif & render ulang
    activeFilter = btn.getAttribute('data-status');
    renderAirdrops();
  });
});

// Jalankan fetch saat pertama kali halaman dimuat
document.addEventListener('DOMContentLoaded', fetchAirdrops);
