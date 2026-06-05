// Stato dell'applicazione
let currentCoinId = 'bitcoin';
let currentDays = '1';
let cryptoChart = null;
let currentCryptoPrice = 0;
let watchlist = JSON.parse(localStorage.getItem('crypto_watchlist')) || ['bitcoin', 'ethereum', 'ripple'];

// Elementi del DOM
const searchInput = document.getElementById('search-crypto');
const addWatchlistBtn = document.getElementById('add-watchlist-btn');
const watchlistContainer = document.getElementById('watchlist-container');
const tfButtons = document.querySelectorAll('.tf-btn');
const cryptoInput = document.getElementById('crypto-input');
const fiatInput = document.getElementById('fiat-input');

// Inizializzazione Dashboard
window.addEventListener('load', () => {
    renderWatchlist();
    loadCoinData(currentCoinId);
    setupEventListeners();
});

function setupEventListeners() {
    // Cambio Timeframe del grafico
    tfButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tfButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDays = e.target.getAttribute('data-days');
            loadChartData();
        });
    });

    // Logica di ricerca e aggiunta a Watchlist
    addWatchlistBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        try {
            // Verifica se la moneta esiste controllando le API
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${query}`);
            if (res.ok) {
                if (!watchlist.includes(query)) {
                    watchlist.push(query);
                    saveWatchlist();
                    renderWatchlist();
                    loadCoinData(query);
                }
                searchInput.value = '';
            } else {
                alert("Moneta non trovata. Inserisci l'ID esatto di CoinGecko (es. 'ripple', 'cardano')");
            }
        } catch (e) {
            console.error("Errore aggiunta watchlist", e);
        }
    });

    // Calcolatrice / Convertitore di Valuta in tempo reale
    cryptoInput.addEventListener('input', () => {
        fiatInput.value = (cryptoInput.value * currentCryptoPrice).toFixed(2);
    });
}

// Carica tutti i dati di una moneta specifica
async function loadCoinData(coinId) {
    currentCoinId = coinId;
    
    // Cambia la classe active nella sidebar
    document.querySelectorAll('.watchlist-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-id') === coinId) item.classList.add('active');
    });

    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);
        const data = await res.json();

        currentCryptoPrice = data.market_data.current_price.eur;
        
        // Aggiorna UI Testuale
        document.getElementById('coin-name').innerHTML = `${data.name} <span id="coin-symbol">${data.symbol}</span>`;
        document.getElementById('coin-price').textContent = `€${currentCryptoPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
        
        const change24h = data.market_data.price_change_percentage_24h;
        const changeBadge = document.getElementById('coin-change');
        changeBadge.textContent = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        changeBadge.className = `price-badge ${change24h >= 0 ? 'positive' : 'negative'}`;

        // Aggiorna Dati di Mercato (Widgets)
        document.getElementById('market-cap').textContent = `€${data.market_data.market_cap.eur.toLocaleString('it-IT')}`;
        document.getElementById('total-volume').textContent = `€${data.market_data.total_volume.eur.toLocaleString('it-IT')}`;
        document.getElementById('high-24h').textContent = `€${data.market_data.high_24h.eur.toLocaleString('it-IT')}`;
        document.getElementById('low-24h').textContent = `€${data.market_data.low_24h.eur.toLocaleString('it-IT')}`;

        // Aggiorna Calcolatrice
        document.getElementById('calc-crypto-symbol').textContent = data.symbol.toUpperCase();
        cryptoInput.value = 1;
        fiatInput.value = currentCryptoPrice.toFixed(2);

        // Carica il relativo grafico storico
        loadChartData();

    } catch (error) {
        console.error("Errore nel recupero dati della moneta:", error);
    }
}

// Carica e istanzia il grafico storico dei prezzi con Chart.js
async function loadChartData() {
    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${currentCoinId}/market_chart?vs_currency=eur&days=${currentDays}`);
        const data = await res.json();

        // Trasforma i timestamp in array di ore o date leggibili
        const labels = data.prices.map(val => {
            const date = new Date(val[0]);
            return currentDays === '1' 
                ? date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) 
                : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        });

        const prices = data.prices.map(val => val[1]);

        // Distruggi il grafico precedente se già esistente
        if (cryptoChart) cryptoChart.destroy();

        // Configurazione Stile Grafico Neon
        const ctx = document.getElementById('cryptoChart').getContext('2d');
        const isPositive = prices[prices.length - 1] >= prices[0];
        const accentColor = isPositive ? '#0ecb81' : '#f6465d';

        // Creazione Gradiente Sfumato sotto la linea del prezzo
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, isPositive ? 'rgba(14, 203, 129, 0.2)' : 'rgba(246, 46, 93, 0.2)');
        gradient.addColorStop(1, 'rgba(24, 26, 32, 0)');

        cryptoChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Prezzo (EUR)',
                    data: prices,
                    borderColor: accentColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#848e9c', maxTicksLimit: 8 } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#848e9c' } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });

    } catch (error) {
        console.error("Errore nel caricamento del grafico:", error);
    }
}

// Renderizza la lista preferiti nella Sidebar tramite chiamata multipla leggera
async function renderWatchlist() {
    watchlistContainer.innerHTML = '';
    
    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Watchlist vuota.</p>';
        return;
    }

    try {
        const ids = watchlist.join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`);
        const data = await res.json();

        watchlist.forEach(id => {
            if (!data[id]) return;

            const coinPrice = data[id].eur;
            const coinPriceChange = data[id].eur_24h_change || 0;
            const isPositive = coinPriceChange >= 0;

            const itemHTML = `
                <div class="watchlist-item ${id === currentCoinId ? 'active' : ''}" data-id="${id}">
                    <div class="wl-info" onclick="loadCoinData('${id}')">
                        <h4>${id.charAt(0).toUpperCase() + id.slice(1)}</h4>
                        <span>${id.substring(0, 3)}</span>
                    </div>
                    <div class="wl-prices">
                        <span class="price" onclick="loadCoinData('${id}')">€${coinPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                        <span class="change ${isPositive ? 'text-green' : 'text-red'}" onclick="loadCoinData('${id}')">
                            ${isPositive ? '+' : ''}${coinPriceChange.toFixed(2)}%
                        </span>
                        <button class="remove-wl-btn" onclick="removeFromWatchlist('${id}', event)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            watchlistContainer.innerHTML += itemHTML;
        });
    } catch (e) {
        console.error("Errore nel rendering della watchlist", e);
    }
}

function removeFromWatchlist(id, event) {
    event.stopPropagation(); // Evita di attivare il click sulla scheda principale
    watchlist = watchlist.filter(item => item !== id);
    saveWatchlist();
    renderWatchlist();
    
    // Se elimini la moneta visualizzata, carica la prima disponibile della lista
    if (currentCoinId === id && watchlist.length > 0) {
        loadCoinData(watchlist[0]);
    }
}

function saveWatchlist() {
    localStorage.setItem('crypto_watchlist', JSON.stringify(watchlist));
}