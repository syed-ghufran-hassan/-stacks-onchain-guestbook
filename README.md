# Stacks Onchain Guestbook

A single-page onchain guestbook dApp built with [Scaffold Stacks](https://scaffoldstacks.mintlify.app/). Connect a Stacks wallet, write a message to a Clarity smart contract on Stacks testnet, and read all messages back from the chain.

Built for the **Scaffold Stacks test-flight bounty** — 20 developers putting Scaffold Stacks to the test.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [How It Works](#how-it-works)
- [Smart Contract](#smart-contract)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Deployment](#deployment)
- [Feedback — Scaffold Stacks Experience](#feedback--scaffold-stacks-experience)
- [Known Issues](#known-issues)
- [Security Note](#security-note)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

The Stacks Onchain Guestbook demonstrates the full end-to-end flow of a Stacks dApp:

- A **Clarity smart contract** deployed to Stacks testnet
- A **Next.js frontend** that connects to the contract
- **Wallet integration** via `@stacks/connect` (Leather / Xverse)
- Real **onchain interaction** — every message is a signed transaction

No database. No backend. Everything lives on Bitcoin-secured Stacks.

---

## Live Demo

| Field | Value |
| --- | --- |
| **Frontend (Vercel)** | [[https://stacks-onchain-guestbook-hoflw2188-syedghufranhassans-projects.vercel.app/](https://syed-ghufran-hassan.github.io/-stacks-onchain-guestbook/) |
| **Contract (Testnet)** | `ST1RDEMSE8XWD013B34N22PWQPVYTESFP9H0RB2G6.guestbook` |
| **Explorer** | [View on Hiro Explorer](https://explorer.hiro.so/address/ST1RDEMSE8XWD013B34N22PWQPVYTESFP9H0RB2G6?chain=testnet) |

 

---

## How It Works

1. **Connect Wallet** — user connects a Stacks wallet (Leather or Xverse), network set to Testnet.
2. **Write a Message** — the frontend calls `write-message` on the contract. The wallet prompts the user to sign.
3. **Message Stored Onchain** — the contract saves the message with the author's address, the message text, and the Stacks block height.
4. **Read Messages** — the frontend calls `get-message-count` and `get-message` (read-only) to display all messages.

Every message is a real transaction. Refresh the page and the data is still there — because it lives onchain.

---

## Smart Contract

| Field | Value |
| --- | --- |
| **File** | `contracts/contracts/guestbook.clar` |
| **Network** | Stacks Testnet |
| **Clarity version** | 3 |

### Functions

| Function | Type | Description |
| --- | --- | --- |
| `write-message (message (string-ascii 200))` | Public | Stores a new message from `tx-sender` and increments the counter |
| `get-message (id uint)` | Read-only | Returns the message at the given ID |
| `get-message-count` | Read-only | Returns the total number of messages |

### Data

```clarity
(define-map messages
  { id: uint }
  {
    author: principal,
    message: (string-ascii 200),
    timestamp: uint
  }
)

(define-data-var message-count uint u0)
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Smart Contract | [Clarity](https://clarity-lang.org/) |
| Contract Tooling | [Clarinet](https://github.com/hirosystems/clarinet) |
| Scaffold | [Scaffold Stacks](https://scaffoldstacks.mintlify.app/) |
| Frontend | [Next.js 15](https://nextjs.org/) + TypeScript |
| Wallet | [`@stacks/connect`](https://github.com/hirosystems/connect) (Leather, Xverse) |
| State | [Jotai](https://jotai.org/) |
| Deploy | [Vercel](https://vercel.com/) |

---

## Project Structure

```
.
├── contracts/                       # Clarinet project
│   ├── contracts/
│   │   └── guestbook.clar           # The Clarity smart contract
│   ├── deployments/
│   │   └── default.testnet-plan.yaml
│   ├── settings/
│   │   └── Testnet.toml             # NOT committed (contains mnemonic)
│   └── Clarinet.toml
│
└── frontend/                        # Next.js app
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   └── page.tsx             # Guestbook UI
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   └── WalletConnect.tsx    # Wallet provider + connect button
    │   └── store/
    │       └── wallet.ts            # Jotai atoms for wallet state
    ├── package.json
    └── next.config.ts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/) 1.75+ (for the Scaffold Stacks CLI)
- [Clarinet](https://github.com/hirosystems/clarinet) 3.23+
- A Stacks wallet — [Leather](https://leather.io/) or [Xverse](https://www.xverse.app/) — set to **Testnet**

> The frontend depends on `@stacks/connect@8`, `@stacks/transactions@7`, and `@stacks/network@7`. If you see "not exported" errors, run `rm -rf node_modules package-lock.json && npm install` to reset.

### 1. Clone the repo

```bash
git clone https://github.com/syed-ghufran-hassan/-stacks-onchain-guestbook.git
cd -stacks-onchain-guestbook
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### 3. Set up the contract (optional, for redeployment)

Create `contracts/settings/Testnet.toml` with your deployer mnemonic:

```toml
[accounts.deployer]
mnemonic = "your twenty four word seed phrase here ..."
```

> ⚠️ **Never commit this file.** It's already in `.gitignore`.

Get testnet STX from the [Hiro faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet).

### 4. Deploy the contract

```bash
cd contracts
clarinet deployments apply --testnet
```

### 5. Point the frontend at your contract

Edit `frontend/src/app/page.tsx`:

```ts
const CONTRACT_ADDRESS = "YOUR_DEPLOYER_ADDRESS";
const CONTRACT_NAME = "guestbook";
```

---

## Usage

1. Open the app in a browser with a Stacks wallet extension (Chrome/Brave/Edge — Firefox requires manual wallet install).
2. Click **Connect Wallet** in the header.
3. Approve the connection in your wallet (ensure it's set to **Testnet**).
4. Type a message (max 200 characters) and click **Write onchain**.
5. Sign the transaction in your wallet.
6. Wait ~10 seconds for the block to confirm.
7. Click **Refresh** — your message appears in the list.

---

## Deployment

### Contract

Deployed to **Stacks Testnet**:

```
ST1RDEMSE8XWD013B34N22PWQPVYTESFP9H0RB2G6.guestbook
```

### Frontend

Deployed to **Vercel**:

1. Push the repo to GitHub.
2. Import the repo on [Vercel](https://vercel.com/new).
3. Set **Root Directory** to `frontend`.
4. Deploy.

Vercel auto-detects Next.js and gives you a public HTTPS URL.

---

## Feedback — Scaffold Stacks Experience

Notes from building this dApp with Scaffold Stacks, for the bounty's test-flight purpose.

### What worked well

- **Project scaffolding** — `stacksdapp new` gives you a working contract + frontend in one command. Way faster than wiring Clarinet and Next.js together manually.
- **Contract compilation & error messages** — Clarinet's errors are precise. When I used the outdated `block-height` keyword, it pointed directly to `stacks-block-height` for Clarity 3 — exactly what a good compiler error should do.
- **Wallet integration** — `@stacks/connect` handles Leather and Xverse out of the box. Connection state syncing into Jotai atoms is a clean pattern.
- **Deployment** — Once the deployment plan format was corrected, `clarinet deployments apply --testnet` was seamless.
 

### What could be improved

- **Deployment plan format mismatch** — `stacksdapp deploy` expected an older flat `transaction-type` field, but Clarinet generated the newer nested `contract-publish` structure. This cost significant debugging time. Either `stacksdapp` should track the Clarinet plan format, or the docs should warn about the version mismatch.
- **Mobile testing friction** — Testing against a mobile wallet requires HTTPS. `http://192.168.x.x` is silently rejected by Xverse's in-app browser. A documented ngrok workflow (or built-in dev HTTPS) would help.
- **Firefox wallet support** — Neither Leather nor Xverse ships in the Firefox Add-ons store anymore. Firefox-first devs are stuck installing from source.
- **`@stacks` package version conflicts** — Scaffold Stacks ships with `@stacks/connect` v7/v8 (which uses the SIP-030 `request()` API), but Clarinet's generated tooling and some examples still assume the v6 `showConnect`/`openContractCall` API. Mixing major versions of `@stacks/connect`, `@stacks/network`, and `@stacks/transactions` produces confusing errors (`request function is not implemented`, `StacksTestnet is not exported`, `privateKeyToAddress is not exported`). A version matrix in the Scaffold Stacks docs would save hours of trial-and-error.

### Time to ship

Approximately **12 hours**, including environment setup, contract iteration, and frontend wiring.

---

## Known Issues

- Wallet connection requires an up-to-date Leather or Xverse extension. Older versions don't implement the SIP-030 `request()` method and will fail with `request function is not implemented`.
- Mobile testing requires HTTPS. `http://192.168.x.x` is silently rejected by Xverse's in-app browser — use ngrok or deploy to Vercel first.
- Firefox does not currently have Leather or Xverse in its Add-ons store. Use Chrome, Brave, or Edge for development.

---

## Security Note

The `contracts/settings/Testnet.toml` file contains the deployer's seed phrase and is **deliberately excluded from this repository** via `.gitignore`. Never commit real mnemonics to any public repo.

---

## License

MIT

---

## Acknowledgments

- [Scaffold Stacks](https://scaffoldstacks.mintlify.app/) — the tooling this was built with
- [Hiro](https://www.hiro.so/) — Clarinet, Stacks.js, and the testnet explorer
- [Stacks Foundation](https://stacks.org/) — for making Bitcoin programmable

---

Built by [@syed-ghufran-hassan](https://github.com/syed-ghufran-hassan) for the Scaffold Stacks test-flight bounty.
