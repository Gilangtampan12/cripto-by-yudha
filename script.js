const buySound = new Audio('buy.mp3');
const sellSound = new Audio('sell.mp3');
const priceContainer = document.getElementById('crypto-prices');
const coins = ['regallion','elitium','bitcoin', 'ethereum', 'dogecoin', 'solana', 'binancecoin','dollar', 'rupiahchains', 'veltrix', 'solvium','neightreign', 'erethium'];

function generateRandomPrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

const priceRanges = {
  regallion: { min: 600000, max: 1000000},
  elitium: { min: 200000, max: 500000},
  solvium: { min: 60000, max: 100000 },
  dollar: { min: 20000, max: 50000},
  neightreign: {min: 15000, max: 20000},
  erethium: { min: 10000, max: 20000},
  bitcoin: { min: 1000, max: 5000 },
  ethereum: { min: 1500, max: 2500 },
  dogecoin: { min: 50, max: 200 },
  solana: { min: 80, max: 120 },
  binancecoin: { min: 250, max: 450 }, 
  veltrix: { min: 160, max: 240},
  rupiahchains: { min: 1, max: 150}
};

const walletContainer = document.getElementById('wallet');
const usernameInput = document.getElementById('username');
const greetingElement = document.getElementById('greeting');
const saldoElement = document.getElementById('saldo');
const portfolioList = document.getElementById('portfolio-list');
const loginButton = document.querySelector('button');

let user = { name: '', balance: 100, portfolio: [] };
let coinPrices = {};

function createCard(name, price) {
  const card = document.createElement('div');
  card.className = 'price-card animate-card';
  card.setAttribute('data-coin', name);
  
  card.innerHTML = `
    <h4>${capitalize(name)}</h4>
    <p>$${price}</p>
    <div class="action-buttons">
      <button class="buy-btn" onclick="buyCoin('${name}')">Beli ${capitalize(name)}</button>
      <button class="sell-btn" onclick="sellCoin('${name}')">Jual ${capitalize(name)}</button>
    </div>
  `;
  
  return card;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading() {
  priceContainer.innerHTML = '<div class="loader"></div>';
}

function showError(message) {
  priceContainer.innerHTML = `<p class="error">${message}</p>`;
}

function formatPrice(price) {
  return price === 'N/A' ? 'Data tidak tersedia' : price.toLocaleString();
}

function fetchPrices() {
  showLoading();
  priceContainer.innerHTML = '';
  
  coins.forEach(coin => {
    const randomPrice = generateRandomPrice(priceRanges[coin].min, priceRanges[coin].max);
    coinPrices[coin] = parseFloat(randomPrice);
    const card = createCard(coin, formatPrice(randomPrice));
    priceContainer.appendChild(card);
  });
}

function login() {
  const username = usernameInput.value.trim();
  if (username === '') {
    alert('Nama pengguna tidak boleh kosong.');
    return;
  }
  
  user.name = username;
  user.balance = 100;
  user.portfolio = [];
  localStorage.setItem('userData', JSON.stringify(user));
  
  greetingElement.textContent = `Selamat datang, ${user.name}!`;
  updateSaldo();
  walletContainer.style.display = 'block';
  usernameInput.disabled = true;
  loginButton.disabled = true;
}

function loadUserData() {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    user = JSON.parse(storedUserData);
    greetingElement.textContent = `Selamat datang, ${user.name}!`;
    updateSaldo();
    walletContainer.style.display = 'block';
  }
}

function buyCoin(coin) {
  const price = coinPrices[coin];
  if (!price) {
    showToast('Harga koin tidak tersedia.', true);
    return;
  }
  
  if (user.balance >= price) {
    user.balance -= price;
    buySound.play();
    updateSaldo();
    addToPortfolio(coin, price);
    showToast(`Berhasil membeli ${capitalize(coin)} dengan harga $${price}!`);
    localStorage.setItem('userData', JSON.stringify(user));
  } else {
    showToast('Saldo tidak cukup untuk membeli koin ini.', true);
  }
}

function sellCoin(coin) {
  const price = coinPrices[coin];
  if (!price) {
    showToast('Harga koin tidak tersedia.', true);
    return;
  }
  
  const coinIndex = user.portfolio.findIndex(item => item.coin === coin);
  if (coinIndex > -1) {
    user.balance += price;
    sellSound.play();
    updateSaldo();
    removeFromPortfolio(coin);
    showToast(`Berhasil menjual ${capitalize(coin)} dengan harga $${price}!`);
    localStorage.setItem('userData', JSON.stringify(user));
  } else {
    showToast(`Anda tidak memiliki ${capitalize(coin)} di portofolio.`, true);
  }
}

function addToPortfolio(coin, price) {
  if (!user.portfolio.some(item => item.coin === coin)) {
    user.portfolio.push({ coin, price });
    updatePortfolio();
  }
}

function removeFromPortfolio(coin) {
  const index = user.portfolio.findIndex(item => item.coin === coin);
  if (index > -1) {
    user.portfolio.splice(index, 1);
    updatePortfolio();
  }
}

function updateSaldo() {
  saldoElement.textContent = `$${user.balance.toFixed(2).toLocaleString()}`;
}

function updatePortfolio() {
  portfolioList.innerHTML = '';
  user.portfolio.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${capitalize(item.coin)} (Harga beli: $${item.price})`;
    portfolioList.appendChild(listItem);
  });
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }, 100);
}

loadUserData();
fetchPrices();
setInterval(fetchPrices, 10000);
