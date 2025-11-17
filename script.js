let allCoins = [];

// Fetch top 100 coins for search / tracker
fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100')
.then(r => r.json())
.then(data => {
    allCoins = data;
    // Enable search buttons after coins load
    document.querySelectorAll('button[data-coin-btn]').forEach(btn => btn.disabled = false);
});

// -------------------
// Live Coin Price Search
// -------------------
function checkPrice(inputId, outputId){
    if(!allCoins.length){
        alert("Coins still loading, please wait a moment.");
        return;
    }
    const q = document.getElementById(inputId).value.toLowerCase();
    const coin = allCoins.find(c => c.id.toLowerCase() === q || c.symbol.toLowerCase() === q);
    document.getElementById(outputId).innerHTML = coin 
        ? `${coin.name}: $${coin.current_price.toLocaleString()}`
        : 'Coin not found';
}

// -------------------
// Top Gainers / Losers Table
// -------------------
function renderTopCoins(tableId, desc=true, limit=10){
    if(!allCoins.length) return;

    const sorted = allCoins.slice().sort((a,b)=> desc 
        ? b.price_change_percentage_24h - a.price_change_percentage_24h
        : a.price_change_percentage_24h - b.price_change_percentage_24h
    );

    const table = document.getElementById(tableId);
    if(!table) return;

    table.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Coin</th>
            <th>Price (USD)</th>
            <th>24h Change</th>
        </tr>
    `;

    sorted.slice(0, limit).forEach((coin, i) => {
        table.innerHTML += `
        <tr>
            <td>${i+1}</td>
            <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>${colorText(coin.price_change_percentage_24h)}</td>
        </tr>`;
    });
}

// -------------------
// Helper: Color text for positive/negative
// -------------------
function colorText(value){
    return value >= 0 
        ? `<span style="color:#238636">${value.toFixed(2)}%</span>` 
        : `<span style="color:#e5534b">${value.toFixed(2)}%</span>`;
}

// -------------------
// Optional: Auto refresh prices every 60 seconds
// -------------------
setInterval(()=>{
    if(allCoins.length){
        document.querySelectorAll('input[data-live-input]').forEach(input => {
            const outputId = input.dataset-output;
            checkPrice(input.id, outputId);
        });
        // Optionally refresh Top Gainers / Losers table here
    }
}, 60000);
