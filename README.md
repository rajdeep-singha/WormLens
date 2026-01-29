<h1 div align="center">WormLens</h1>

WormLens is a multichain lending analytics application. It exposes a REST API for aggregated lending/borrowing rates, liquidity, utilization, and user positions across supported protocols and chains.

## Repository structure

- `server/`: Express + TypeScript API (Aave on EVM chains, Solend on Solana)
- `client/`: Web UI (Vite + React + TypeScript)

## Prerequisites

- Node.js 18+ (recommended)
- npm
- RPC endpoints for the chains you want to query:
  - Solana: `SOLANA_RPC_URL`
  - Ethereum: `ETHEREUM_RPC_URL` (required for Aave / Ethereum data)

## Quick start

### Server

```bash
cd server
npm install
npm run build
npm run dev
```

The API will start on `http://localhost:3001` (or `PORT` if set).

### Client

```bash
cd client
npm install
npm run dev
```

## Configuration

Create `server/.env` (or export env vars in your shell) as needed:

```bash
# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Chain RPCs (required per chain)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_URL=<your-ethereum-rpc-url>

#  (Wormhole Query API; contract calls in this repo primarily use RPCs)
WORMHOLE_ENVIRONMENT=mainnet
WORMHOLE_API_KEY=YOUR_API_Key
```

### Why you might only see Solana data

If `ETHEREUM_RPC_URL` is not set, Ethereum providers will not initialize and Aave (Ethereum) queries will fail. In that case, `/api/v1/rates` may return only Solana/Solend results.

To verify what the server sees, open the root route `/`. It returns configuration status including which chains are configured.

## Server scripts (`server/package.json`)

- `npm run dev`: run the API in development mode
- `npm run build`: compile TypeScript to `dist/`
- `npm start`: run the compiled server from `dist/`

## API

Base path: `/api/v1`

### Health

- `GET /health`

### Supported

- `GET /api/v1/supported`

### Rates

- `GET /api/v1/rates`
  - Query params (optional): `chain`, `protocol`, `asset`
- `GET /api/v1/rates/best?type={supply|borrow}&asset={symbol}&amount={optional}`

### Liquidity

- `GET /api/v1/liquidity`
  - Query params (optional): `chain`, `protocol`, `asset`
- `GET /api/v1/liquidity/utilization`
  - Query params (optional): `chain`, `protocol`

### User

- `GET /api/v1/user/:wallet`
  - Query params (optional): `chain`, `protocol`
- `GET /api/v1/user/:wallet/health`

### Analytics

- `GET /api/v1/analytics/overview`
- `GET /api/v1/analytics/compare?asset={symbol}&chains={optional}&protocols={optional}`

## Example requests

```bash
curl "http://localhost:3001/api/v1/rates"
curl "http://localhost:3001/api/v1/rates?chain=ethereum&protocol=aave"
curl "http://localhost:3001/api/v1/liquidity?chain=solana&protocol=solend"
curl "http://localhost:3001/api/v1/rates/best?type=supply&asset=USDC"
```


## Contributing

Contributions are welcome. If you would like to propose changes, please follow the workflow below.

### Development workflow

1. Fork the repository and create a feature branch:

```bash
git checkout -b feat/short-description
```

2. Install dependencies and run locally:

```bash
cd server && npm install && npm run dev
cd ../client && npm install && npm run dev
```

3. Make changes with a focus on:
- Keeping API responses backward-compatible (or clearly documenting breaking changes)
- Adding/adjusting validation for new query params
- Updating the README when endpoints or configuration change

4. Run checks before opening a PR:

```bash
cd server && npm run build
cd ../client && npm run build
```

### Pull requests

- Keep PRs small and focused.
- Include a clear description of the change, motivation, and any trade-offs.
- Add a short test plan (how you verified the change locally).
- If you add a new endpoint, document it in the README under **API**.

### Reporting issues

When filing an issue, include:
- The endpoint you called and the query params
- The server logs (redact secrets)
- Your environment configuration (which RPC URLs are set)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Troubleshooting

- **Only Solana/Solend results**: set `ETHEREUM_RPC_URL` and restart the server.
- **Route `/` not found**: ensure you are running the latest compiled server (`npm run build` then `npm start`) or use `npm run dev`.
- **Invalid chain/protocol**: use the values returned by `GET /api/v1/supported`.
