import { createThirdwebClient, defineChain } from "thirdweb";
import { deployERC20Contract, deployERC721Contract } from "thirdweb/deploys";
import { privateKeyToAccount } from "thirdweb/wallets";

const secretKey = process.env.THIRDWEB_CLIENT_ID;

if (!secretKey) {
  throw new Error("THIRDWEB_SECRET_KEY is not set");
}

// Setup the Thirdweb client
const client = createThirdwebClient({
  secretKey: secretKey,
});

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

const account = privateKeyToAccount({
  client,
  privateKey: privateKey,
});

// Define your parameters
const rootstockTestnet = defineChain(31); // e.g., "ethereum", "polygon", etc.

const contractAddressERC20 = await deployERC20Contract({
    chain: rootstockTestnet,
    client,
    account,
    type: "TokenERC20",
    params: {
      name: "RookieTokeb",
      description: "Make it happen",
      symbol: "MIH",
   }
});

console.log(contractAddressERC20);
// const contractAddress = await deployERC721Contract({
//     chain:rootstockTestnet,
//     client,
//     account,
//     type: "DropERC721",
//     params: {
//       name: "MyNFT",
//       description: "My NFT contract",
//       symbol: "NFT",
//    }
// });

// console.log(contractAddress);






