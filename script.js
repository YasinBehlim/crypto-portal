let allCoins = [];

// Fetch top 250 coins with sparkline
fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&sparkline=true')
.then(r => r.json())
.then(data => { allCoins = data; console.log("Coins loaded:", allCoins.length); })
.catch(e => console.error("Failed to load coins", e));

// Live Search
function checkPrice(inputId, outputId){
  if(!allCoins.length){ alert("Coins still loading"); return; }
  const q = document.getElementById(inputId).value.trim().toLowerCase();
  const coin = allCoins.find(c => c.id.toLowerCase()===q || c.symbol.toLowerCase()===q);
  const out = document.getElementById(outputId);
  if(!out) return;
  out.innerHTML = coin ? `<a href="coin.html?coin=${coin.id}">${coin.name}: $${coin.current_price.toLocaleString()}</a>` : 'Coin not found';
}

// Color helper
function colorText(val){
  if(val===null || val===undefined) return 'N/A';
  return val>=0? `<span style="color:#238636">${val.toFixed(2)}%</span>` 
               : `<span style="color:#e5534b">${val.toFixed(2)}%</span>`;
}

// Sort coins
function sortCoins(desc=true){ return allCoins.slice().sort((a,b)=> desc? b.price_change_percentage_24h - a.price_change_percentage_24h : a.price_change_percentage_24h - b.price_change_percentage_24h); }

// Render Top Gainers/Losers
function renderTopCoins(tableId, desc=true, limit=20){
  const table = document.getElementById(tableId);
  if(!table || !allCoins.length) return;
  const sorted = sortCoins(desc).slice(0,limit);
  table.innerHTML = `<tr><th>Rank</th><th>Coin</th><th>Price (USD)</th><th>24h Change</th></tr>`;
  sorted.forEach((c,i)=>{
    table.innerHTML += `<tr>
      <td>${i+1}</td>
      <td><a href="coin.html?coin=${c.id}">${c.name} (${c.symbol.toUpperCase()})</a></td>
      <td>$${c.current_price.toLocaleString()}</td>
      <td>${colorText(c.price_change_percentage_24h)}</td>
    </tr>`;
  });
}

// Render Live Table with 7-day sparkline
function renderLiveTable(tableId, limit=20){
  const table = document.getElementById(tableId);
  if(!table || !allCoins.length) return;
  const sorted = allCoins.slice(0,limit);
  table.innerHTML = `<tr><th>Rank</th><th>Coin</th><th>Price (USD)</th><th>24h Change</th><th>7d Chart</th></tr>`;
  sorted.forEach((c,i)=>{
    const sparkline = c.sparkline_in_7d && c.sparkline_in_7d.price ? c.sparkline_in_7d.price.join(",") : "";
    const chartUrl = sparkline ? `https://quickchart.io/chart?c={type:'sparkline',data:{datasets:[{data:[${sparkline}]}]}}` : "";
    table.innerHTML += `<tr>
      <td>${i+1}</td>
      <td><a href="coin.html?coin=${c.id}">${c.name} (${c.symbol.toUpperCase()})</a></td>
      <td>$${c.current_price.toLocaleString()}</td>
      <td>${colorText(c.price_change_percentage_24h)}</td>
      <td>${chartUrl? `<img src="${chartUrl}" alt="7d chart" style="height:30px;">` : 'N/A'}</td>
    </tr>`;
  });
}

// Auto refresh live table every 60s
setInterval(()=>{
  const table = document.getElementById('liveTable');
  if(table && allCoins.length){ renderLiveTable('liveTable',20); }
},60000);

// Render Coin Detail Page
function renderCoinDetails(coinId){
  fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&market_data=true`)
    .then(r=>r.json())
    .then(data=>{
      document.getElementById('coinName').innerHTML = `<img src="${data.image.small}" style="height:25px;vertical-align:middle;margin-right:5px;"> ${data.name}`;
      document.getElementById('coinSymbol').innerText = `Symbol: ${data.symbol.toUpperCase()}`;
      document.getElementById('coinPrice').innerText = `$${data.market_data.current_price.usd.toLocaleString()}`;
      document.getElementById('coinMarketCap').innerText = `$${data.market_data.market_cap.usd.toLocaleString()}`;
      document.getElementById('coinVolume').innerText = `$${data.market_data.total_volume.usd.toLocaleString()}`;
      document.getElementById('coinSupply').innerText = `${data.market_data.circulating_supply.toLocaleString()}`;
      const change = data.market_data.price_change_percentage_24h;
      document.getElementById('coinChange').innerHTML = change>=0 
        ? `<span style="color:#238636">${change.toFixed(2)}%</span>`
        : `<span style="color:#e5534b">${change.toFixed(2)}%</span>`;

      // 7-day sparkline
      if(data.market_data.sparkline_7d && data.market_data.sparkline_7d.price){
        const sparkline = data.market_data.sparkline_7d.price.join(',');
        document.getElementById('coinSparkline').src = `https://quickchart.io/chart?c={type:'sparkline',data:{datasets:[{data:[${sparkline}]}]}}`;
      }

      // Description (HTML safe)
      document.getElementById('coinDesc').innerHTML = data.description.en ? data.description.en.split('. ').slice(0,3).join('. ') + '.' : '';
    })
    .catch(e=>{
      console.error(e);
      document.getElementById('coinName').innerText = "Failed to load coin data.";
    });
     }
