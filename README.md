#  CryptoPulse // Modern Financial Dashboard

CryptoPulse is a high-performance, real-time cryptocurrency tracking dashboard featuring a sleek, professional dark mode UI inspired by advanced trading platforms. Built entirely with vanilla frontend technologies and integrated with interactive financial charting, it delivers a smooth experience for monitoring market trends and statistics.

![UI Design](https://img.shields.io/badge/UI--Design-TradingView%20Style-yellow)
![JavaScript ES6+](https://img.shields.io/badge/Language-JavaScript%20ES6+-yellow)
![Charting](https://img.shields.io/badge/Charts-Chart.js-0ecb81)
![API-Keyless](https://img.shields.io/badge/API-Keyless%20%2F%20CoinGecko-blue)

---

##  Features

* **Interactive Financial Charts:** Renders fluid, neon-styled line graphs using `Chart.js` with toggleable timeframes (24h, 7 days, 30 days) and price-direction-aware color scaling (green for gains, red for losses).
* **Live Market Metrics:** Fetches up-to-date data on total market cap, 24h trading volume, and 24h high/low price boundaries.
* **Persistent Watchlist:** A custom sidebar tracking system where users can add or remove tokens. The list is stored natively using the browser's `localStorage` to keep data intact across refreshes.
* **Instant Currency Calculator:** An integrated rapid conversion widget that computes exact fiat (EUR) equivalents as you type based on real-time market rates.
* **Zero-Setup API Integration:** Connects directly to the public CoinGecko REST API without requiring any authentication keys or backend configuration.

---

## 🛠️ Tech Stack & Architecture

This dashboard is designed to run completely on the client side, offering fast execution and straightforward static deployment.

* **Frontend Structure:** Semantic HTML5 layout featuring a standard two-column financial dashboard split (Sidebar & Main stage).
* **Styling Framework:** Pure CSS3 utilizing advanced Flexbox/Grid architectures, custom properties for theme palette consistency, and professional responsive media queries.
* **Data Visualization:** `Chart.js` loaded asynchronously via CDN, configured with customized line gradient fills, hidden legends, and interactive tooltips.
* **Data Layer:** Native JavaScript (ES6+) asynchronous `fetch` requests with strict error/exception boundaries for API downtimes.

---

##  Project Structure

```text
cryptopulse/
│
├── index.html          # Semantic layout, trading canvas, and widget architecture
├── style.css           # Custom dark theme, neon trend badges, and dashboard layout
└── script.js           # Asynchronous state machine, local storage syncing, and Chart.js instances
