let signer;
let contract;
let token;

const contractAddress = "0xYourContractAddress"; // replace after deployment
const tokenAddress = "0xYourTokenAddress"; // replace with ERC20 token address
const abi = [
  "function productCount() view returns (uint)",
  "function products(uint) view returns (uint id, address seller, string name, string description, uint price, string category, string image, bool sold, address buyer, uint purchaseTime, bool settled)",
  "function createProduct(string name,string description,uint price,string category,string image)",
  "function buyProduct(uint id)",
  "function confirmSettlement(uint id)",
  "function refund(uint id)",
  "event ProductCreated(uint id, address seller, uint price, string category)",
  "event ProductSold(uint id, address buyer)",
  "event ProductSettled(uint id)",
  "event ProductRefunded(uint id)"
];
const tokenAbi = [
  "function approve(address spender, uint value) returns (bool)",
];

async function connect() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    document.getElementById("connect").innerText = "Wallet Connected";
    loadProducts();
    loadTransactions();
  } else {
    alert("Install MetaMask");
  }
}

async function loadProducts() {
  const count = await contract.productCount();
  const filterCat = document.getElementById("filterCategory").value.toLowerCase();
  const maxPrice = parseFloat(document.getElementById("filterPrice").value) || Infinity;
  const container = document.getElementById("products");
  container.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const p = await contract.products(i);
    if (p[7]) continue; // sold
    const priceEth = ethers.formatEther(p[4]);
    if (filterCat && !p[5].toLowerCase().includes(filterCat)) continue;
    if (parseFloat(priceEth) > maxPrice) continue;
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p[6]}" width="100" />
      <h3>${p[2]}</h3>
      <p>${p[3]}</p>
      <p>Category: ${p[5]}</p>
      <p>Price: ${priceEth}</p>
      <button onclick="buyProduct(${p[0]}, '${p[4]}')">Buy</button>
    `;
    container.appendChild(div);
  }
}

async function addProduct(evt) {
  evt.preventDefault();
  const name = document.getElementById("name").value;
  const image = document.getElementById("image").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const price = ethers.parseEther(document.getElementById("price").value);
  const tx = await contract.createProduct(name, description, price, category, image);
  await tx.wait();
  loadProducts();
  loadTransactions();
}

async function buyProduct(id, price) {
  await token.approve(contractAddress, price);
  const tx = await contract.buyProduct(id);
  await tx.wait();
  loadProducts();
  loadTransactions();
}

async function loadTransactions() {
  if (!signer) return;
  const myAddress = await signer.getAddress();
  const count = await contract.productCount();
  const container = document.getElementById("transactions");
  container.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const p = await contract.products(i);
    if (!p[7] || p[10]) continue; // not sold or already settled
    if (p[8].toLowerCase() !== myAddress.toLowerCase() && p[1].toLowerCase() !== myAddress.toLowerCase()) continue;
    const priceEth = ethers.formatEther(p[4]);
    const div = document.createElement("div");
    div.className = "product";
    let actions = "";
    const expired = Date.now() / 1000 >= (Number(p[9]) + 15 * 24 * 60 * 60);
    if (myAddress.toLowerCase() === p[8].toLowerCase()) {
      actions += `<button onclick="confirmSettlement(${p[0]})">Confirm Received</button>`;
      if (expired) actions += ` <button onclick="refund(${p[0]})">Refund</button>`;
    } else if (myAddress.toLowerCase() === p[1].toLowerCase()) {
      actions += `<button onclick="confirmSettlement(${p[0]})">Confirm Delivered</button>`;
    }
    div.innerHTML = `
      <img src="${p[6]}" width="100" />
      <h3>${p[2]}</h3>
      <p>Price: ${priceEth}</p>
      ${actions}
    `;
    container.appendChild(div);
  }
}

async function confirmSettlement(id) {
  const tx = await contract.confirmSettlement(id);
  await tx.wait();
  loadTransactions();
}

async function refund(id) {
  const tx = await contract.refund(id);
  await tx.wait();
  loadTransactions();
}

document.getElementById("connect").onclick = connect;
document.getElementById("productForm").onsubmit = addProduct;
document.getElementById("applyFilters").onclick = loadProducts;
