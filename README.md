# 🌐 Web3 Social Media DApp

> A decentralized, autonomous social media platform built with Web3, PostgreSQL, and React.

## 📖 Introduction

This project is a Web3-based social media application that integrates blockchain features such as on-chain logging (tweets, follows, NFTs) and contract event listening. It is designed to be **decentralized**, **secure**, and **extensible**, aiming to provide a next-generation social networking experience.

## 🏗️ Architecture

- **Frontend & Backend Decoupling**  
  React-based frontend and Express-based backend operate independently, both capable of blockchain interaction.

- **PostgreSQL**  
  A distributed database used for persistent storage, chosen to balance decentralization and performance.

- **Redis**  
  Caching layer that ensures low latency and enhances user experience.

- **Smart Contract Listener**  
  Listens to on-chain events (e.g., tweets, follows, NFT interactions) to maintain state consistency and ensure data immutability.

- **Modular Smart Contracts**  
  Includes contracts for:
  - `TweetLog`
  - `FollowLog`
  - `NFTInteractionLog`

## 🖥️ Application (Frontend)

> Developed with React

### 🚀 Setup

```bash
# Install dependencies
npm install

# Start the development server
npm start
````

## 🔧 Backend

> Built with Express.js

### 📦 Prerequisites

* PostgreSQL
* Redis

### 🚀 Run the Server

```bash
node main.js
```

## 🧩 Features

* 📝 On-chain tweet publishing and tracking
* 👥 Decentralized following mechanism
* 🖼️ NFT support for identity and content
* ⛓️ Real-time blockchain event syncing
* 🌐 Designed for DAO-style governance and censorship resistance

## 📂 Project Structure (Simplified)

```bash
web3-social-dapp/
├── frontend/          # React-based UI
│   ├── public/
│   └── src/
├── backend/           # Express backend
│   ├── routes/
│   ├── services/
│   └── contracts/     # Smart contract ABIs & listeners
├── scripts/           # Setup & deployment scripts
├── .env.example       # Example environment config
└── README.md
```

## 🤝 Contribution

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License. See [LICENSE](./LICENSE) for more information.

## 🧱 Credits

Forked and inspired by:
[@nitantchhajed/social-media-dapp](https://github.com/nitantchhajed/social-media-dapp)

---

> ⚠️ Note: Please ensure your `.env` file includes the required configurations for PostgreSQL, Redis, and contract addresses before launching.

```


