# Second Hand Marketplace DApp

This is a very simple decentralized application where users can sell second hand items. Users connect with an Ethereum wallet (e.g. MetaMask) and can list items for sale. Other users can browse listings, filter by category and price, and purchase items using an ERC20 token such as USDC.

## Structure

- `contracts/Marketplace.sol` – Solidity smart contract.
- `frontend/index.html` – minimal front-end using ethers.js via CDN.

## Running Locally

1. Deploy `Marketplace.sol` with the address of the ERC20 token used for
   payments using your preferred tool (e.g. Hardhat or Remix).
2. Update `frontend/app.js` with the deployed contract address and token address.
3. Open `frontend/index.html` in a browser with MetaMask installed.

## Features

- Wallet login via MetaMask
- Add products with name, description, price, category and image
- Explore available products
- Filter by category and maximum price
- Purchase items using an ERC20 token with funds held in escrow
- Seller or buyer confirms delivery to release funds
- Refund automatically available after 15 days if not settled

This repository only contains the code and does not include compiled artifacts or node dependencies.

## Manual Testing Guide

Follow these steps to try the marketplace locally:

1. Install the MetaMask browser extension and create or import a wallet.
2. Deploy `contracts/Marketplace.sol`, providing the ERC20 token address in the
   constructor. Use a local blockchain (e.g. Hardhat Network) or a public testnet.
3. Copy the deployed contract address and token address then update the
   `contractAddress` and `tokenAddress` variables in `frontend/app.js`.
4. Serve the `frontend` folder with a static file server such as `npx serve`, or
   open `frontend/index.html` directly in your browser.
5. Click **Connect Wallet** to connect MetaMask.
6. Use the **Add Product** form to list items and test filtering or purchasing
   with another account. After buying an item, either party can confirm
   settlement via the **Pending Transactions** section, or wait 15 days to
   trigger a refund.

This project does not include automated tests; user testing is performed
manually through the web interface.
