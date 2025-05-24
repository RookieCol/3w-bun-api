import { thirdwebClient, rootstockTestnet } from "@/lib/thirdweb/client";
import { deployERC20Contract, deployERC721Contract } from "thirdweb/deploys";
import { privateKeyToAccount } from "thirdweb/wallets";

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not set");
}

// Initialize a server-side account once
const account = privateKeyToAccount({
  client: thirdwebClient,
  privateKey,
});

/**
 * Deploys an ERC20 token with the given parameters.
 */
export async function deployERC20(params: {
  name: string;
  symbol: string;
  description?: string;
  defaultAdmin?: string;
}): Promise<string> {
  const { name, symbol, description, defaultAdmin } = params;
  return await deployERC20Contract({
    chain: rootstockTestnet,
    client: thirdwebClient,
    account,
    type: "TokenERC20",
    params: { name, symbol, description, defaultAdmin },
  });
}

/**
 * Deploys an ERC721 (Drop) contract with the given parameters.
 */
export async function deployERC721(params: {
  name: string;
  symbol: string;
  description?: string;
}): Promise<string> {
  return await deployERC721Contract({
    chain: rootstockTestnet,
    client: thirdwebClient,
    account,
    type: "DropERC721",
    params,
  });
}
