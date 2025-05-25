# Thirdweb bun API

A RESTful API built with Hono and Bun, leveraging Thirdweb SDK v5. It currently provides endpoints to:

- Deploy contracts on Rootstock Testnet (ERC20/721)
- Query deployed contracts by wallet address (to be implemented)
- Fetch metadata and type of each contract (to be implemented)


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/server.ts
```

## API Endpoints

### Health Check

Check the API status.

```bash
curl http://localhost:4000/health
```

#### Success Response

**Status Code:** 200 OK

```json
{
  "status": "ok"
}
```

### Deploy ERC20 Token

Deploy a new ERC20 token on Rootstock Testnet.

```bash
curl -X POST http://localhost:4000/v1/deploy/erc20 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyToken",
    "symbol": "MTK",
    "description": "My test token"
  }'
```

### Deploy ERC721 Token

Deploy a new ERC721 (NFT) token on Rootstock Testnet.

```bash
curl -X POST http://localhost:4000/v1/deploy/erc721 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyNFT",
    "symbol": "MNFT",
    "description": "My NFT collection"
  }'
```

**Status Code:** 200 OK

```json
{
  "address": "0x1234...5678"  // The deployed contract address
}
```

#### Error Response

**Status Code:** 400 Bad Request

```json
{
  "error": {
    "code": -32010,
    "message": "insufficient funds"
  }
}
```

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
