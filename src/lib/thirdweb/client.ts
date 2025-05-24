import { createThirdwebClient, defineChain } from "thirdweb";

const secretKey = process.env.THIRDWEB_SECRET_KEY;
if (!secretKey) {
  throw new Error("THIRDWEB_SECRET_KEY is not set");
}

// Export a configured client and the Rootstock testnet chain
const thirdwebClient = createThirdwebClient({ secretKey });
const rootstockTestnet = defineChain(31);

export { thirdwebClient, rootstockTestnet };