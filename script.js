fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("airdrop-list");

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
  });
