import { createThirdwebClient, defineChain } from "thirdweb";

/**
 * Fetches deploy transactions for a given wallet address
 * @param walletAddress The wallet address to fetch deploys for
 * @param clientId ThirdWeb client ID
 * @param blockTimestamp Optional timestamp to filter transactions after
 * @param limit Optional limit of transactions to return (default 20)
 * @returns Promise containing the deploy transactions
 */
async function fetchDeployTransactions(
  walletAddress: string,
  clientId: string,
  blockTimestamp?: number,
  limit: number = 20
) {
  // Function selector for deploy transactions
  const DEPLOY_FUNCTION_SELECTOR = "0xd057c8b1";
  
  // Build URL with parameters
  const baseUrl = "https://insight.thirdweb.com/v1/wallets";
  const params = new URLSearchParams({
    chain_id: "31",
    filter_function_selector: DEPLOY_FUNCTION_SELECTOR,
    limit: limit.toString(),
    clientId: clientId
  });

  if (blockTimestamp) {
    params.append("filter_block_timestamp_gte", blockTimestamp.toString());
  }

  const url = `${baseUrl}/${walletAddress}/transactions?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching deploy transactions:", error);
    throw error;
  }
}

// Example usage
const clientId = "5033638d3031429cd77516c2302eb3f6";
const walletAddress = "0xC0BF05DE429252699cCFD7aBA2645f640e816257";

async function main() {
    try {
        const deployTransactions = await fetchDeployTransactions(walletAddress, clientId);
        const hashes = (deployTransactions as {data: {hash: string}[]}).data.map((tx: {hash: string}) => tx.hash);
        console.log("Transaction hashes:", hashes);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
