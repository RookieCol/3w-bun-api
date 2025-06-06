import { createThirdwebClient, defineChain } from "thirdweb";



const secretKey = process.env.THIRDWEB_SECRET_KEY;
const clientId = process.env.THIRDWEB_CLIENT_ID;

if (!secretKey) throw new Error("THIRDWEB_SECRET_KEY is not set");
if (!clientId) throw new Error("THIRDWEB_CLIENT_ID is not set");


// Export a configured client and the Rootstock testnet chain
const thirdwebClient = createThirdwebClient({ secretKey, clientId });
const rootstockTestnet = defineChain(31);

export { thirdwebClient, rootstockTestnet };