# Thirdweb bun API

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/server.ts
```

## API Endpoints

### Deploy ERC20 Token

Deploy a new ERC20 token on Rootstock Testnet.

```bash
curl -X POST http://localhost:4000/deploy/erc20 \
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
curl -X POST http://localhost:4000/deploy/erc721 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyNFT",
    "symbol": "MNFT",
    "description": "My NFT collection"
  }'
```

### Response Format

#### Success Response

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
