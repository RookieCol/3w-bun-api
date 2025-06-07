# Thirdweb bun API

A RESTful API built with Hono and Bun, leveraging Thirdweb SDK v5. It currently provides endpoints to:

- Deploy contracts on Rootstock Testnet (ERC20/721)
- Query deployed contracts by wallet address
- Fetch metadata and type of each contract

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

#### Response

**Status Code:** 200 OK

```json
{
  "status": "ok"
}
```

## Deploy

### ERC20 Token

Deploy a new ERC20 token on Rootstock Testnet.

```bash
curl -X POST http://localhost:4000/v1/deploy/erc20 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyToken",
    "symbol": "MTK",
    "description": "My test token",
    "defaultAdmin": "0x1234567890123456789012345678901234567890",
    "image": "ipfs://<uri>"
    }'
```

**Parameters:**

- `name` (required): Name of the token
- `symbol` (required): Symbol of the token  
- `description` (optional): Description of the token
- `defaultAdmin` (optional): Address that will have admin rights over the contract

### ERC721 Token

Deploy a new ERC721 (NFT) token on Rootstock Testnet.

```bash
curl -X POST http://localhost:4000/v1/deploy/erc721 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyNFT",
    "symbol": "MNFT",
    "description": "My NFT collection",
    "defaultAdmin": "0x681AA2C3266Dd8435411490773f28FE5fa0E5FF7",
    "image": "ipfs://<uri>"
  }'
```

### Response

**Status Code:** 200 OK

```json
{
  "address": "0x1234...5678"  
}
```

### Error Response

**Status Code:** 400 Bad Request

```json
{
  "error": {
    "code": -32010,
    "message": "insufficient funds"
  }
}
```

### Query Deployed Contracts

Get all contracts deployed by a specific wallet address.

```bash
curl http://localhost:4000/v1/deploys/0xYourWalletAddress
```

#### Response

**Status Code:** 200 OK

```json
{
  "totalContracts": 2,
  "erc721Count": 1,
  "erc20Count": 1,
  "contracts": [
    {
      "address": "0x1234...5678",
      "tokenType": "ERC20",
      "metadata": {
        "name": "MyToken",
        "symbol": "MTK",
        "description": "My test token"
      }
    },
    {
      "address": "0x9876...5432",
      "tokenType": "ERC721",
      "metadata": {
        "name": "MyNFT",
        "symbol": "MNFT",
        "description": "My NFT collection"
      }
    }
  ]
}
```

