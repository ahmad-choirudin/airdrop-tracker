const searchInput = document.getElementById("search");
const container = document.getElementById("airdrop-list");

let airdrops = [];

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    airdrops = data;
    displayAirdrops(airdrops);
  });

function displayAirdrops(data) {
  container.innerHTML = "";

  data.forEach(project => {
    const card = document.createElement("div");

    card.innerHTML = `
      <h2>${project.name}</h2>
      <p>Type: ${project.type}</p>
      <p>Status: ${project.status}</p>
      <p>Chain: ${project.chain}</p>
      <p>Reward: ${project.reward}</p>
    `;

    container.appendChild(card);
  });
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = airdrops.filter(project =>
    project.name.toLowerCase().includes(keyword) ||
    project.type.toLowerCase().includes(keyword) ||
    project.chain.toLowerCase().includes(keyword)
  );

  displayAirdrops(filtered);
});
