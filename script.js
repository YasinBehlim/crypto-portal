let allCoins = [];

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  // Fetch top 250 coins for better coverage
  fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      return r.json();
    })
    .then(data => {
      allCoins = data;
      console.log("Loaded coins:", allCoins.length);

      // If gainers table exists, render
      const table = document.getElementById("topGainers");
      if (table) {
        renderTopCoins("topGainers", true, 20);
      }
    })
    .catch(error => {
      console.error("Error fetching coins:", error);
      const table = document.getElementById("topGainers");
      if (table) {
        table.innerHTML = `<tr><td colspan="4">Failed to load coins.</td></tr>`;
      }
    });
  
  // Attach live input refresh if input exists
  const input = document.querySelector('input[data-live-input]');
  if (input) {
    input.addEventListener("input", () => {
      const outputId = input.dataset.output;
      checkPrice(input.id, outputId);
    });
  }
});

// Live Coin Price Search
async function checkPrice(inputId, outputId) {
  if (!allCoins.length) {
    alert("Coins still loading, please wait a moment.");
    return;
  }

  const q = document.getElementById(inputId).value.trim().toLowerCase();
  const outputEl = document.getElementById(outputId);
  if (!outputEl) {
    console.error("Output element not found:", outputId);
    return;
  }

  const coin = allCoins.find(c => c.id.toLowerCase() === q || c.symbol.toLowerCase() === q);
  if (coin) {
    outputEl.innerHTML = `${coin.name}: $${coin.current_price.toLocaleString()}`;
  } else {
    outputEl.innerHTML = 'Coin not found';
  }
}

// Sort coins by 24h change
function sortCoins(desc = true) {
  if (!allCoins.length) return [];
  return allCoins.slice().sort((a, b) => desc
    ? b.price_change_percentage_24h - a.price_change_percentage_24h
    : a.price_change_percentage_24h - b.price_change_percentage_24h
  );
}

function renderTopCoins(tableId, desc = true, limit = 10) {
  const sorted = sortCoins(desc).slice(0, limit);
  const table = document.getElementById(tableId);
  if (!table) {
    console.error("Table not found:", tableId);
    return;
  }

  table.innerHTML = `
    <tr>
      <th>Rank</th>
      <th>Coin</th>
      <th>Price (USD)</th>
      <th>24h Change</th>
    </tr>
  `;

  sorted.forEach((coin, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td>${colorText(coin.price_change_percentage_24h)}</td>
      </tr>
    `;
  });
}

function colorText(value) {
  if (value === null || value === undefined) return "N/A";
  return value >= 0
    ? `<span style="color:#238636">${value.toFixed(2)}%</span>`
    : `<span style="color:#e5534b">${value.toFixed(2)}%</span>`;
}

// Auto refresh live price every 60s
setInterval(() => {
  const input = document.querySelector('input[data-live-input]');
  if (input && allCoins.length) {
    const outputId = input.dataset.output;
    checkPrice(input.id, outputId);
  }
}, 60000);
