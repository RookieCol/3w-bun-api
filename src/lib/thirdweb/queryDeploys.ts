import {
  createThirdwebClient,
  defineChain,
  Insight,
  getContract
} from "thirdweb";
import type { Transaction } from "thirdweb/dist/types/insight";
import {
  getRpcClient,
  eth_getTransactionReceipt,
} from "thirdweb/rpc";
import type { Address } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";

const secretKey = process.env.THIRDWEB_SECRET_KEY;
const clientId = process.env.THIRDWEB_CLIENT_ID;

if (!secretKey) throw new Error("THIRDWEB_SECRET_KEY is not set");
if (!clientId) throw new Error("THIRDWEB_CLIENT_ID is not set");

const client = createThirdwebClient({ secretKey, clientId });
const chain = defineChain(31);

interface ContractInfo {
  address: string;
  tokenType: string;
  metadata: {
    name: string;
    symbol: string;
    description: string;
  };
}

interface QueryDeploysResult {
  totalContracts: number;
  erc721Count: number;
  erc20Count: number;
  contracts: ContractInfo[];
}

/**
 * Fetches all deployed contracts for a given owner wallet address
 */
export async function queryDeployedContracts(ownerWallet: string): Promise<QueryDeploysResult> {
  const deployerWallet = "0xC0BF05DE429252699cCFD7aBA2645f640e816257";
  
  // Fetch all transactions with pagination
  const allTransactions = await fetchAllTransactions(deployerWallet);
  
  // Get receipts for all transactions
  const receipts = await fetchTransactionReceipts(allTransactions);
  
  // Extract contracts based on log patterns
  const extractedContracts = extractContractsFromReceipts(receipts, ownerWallet);
  
  // Fetch metadata for all contracts
  const contractsWithMetadata = await fetchContractsMetadata(extractedContracts);
  
  // Format result
  return formatContractsResult(contractsWithMetadata);
}

/**
 * Fetches all transactions with pagination
 */
async function fetchAllTransactions(deployerWallet: string): Promise<Transaction[]> {
  const allTransactions: Transaction[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;
  
  while (hasMore) {
    const transactions: Transaction[] = await Insight.getTransactions({
      client,
      walletAddress: deployerWallet,
      chains: [chain],
      queryOptions: {
        filter_function_selector: "0xd057c8b1",
        limit,
        page,
      },
    });
    
    if (transactions.length === 0) {
      hasMore = false;
    } else {
      allTransactions.push(...transactions);
      page++;
      if (transactions.length < limit) {
        hasMore = false;
      }
    }
  }
  
  return allTransactions;
}

/**
 * Fetches transaction receipts for all transactions
 */
async function fetchTransactionReceipts(transactions: Transaction[]) {
  const hashes = transactions.map((tx) => tx.hash);
  const rpcRequest = getRpcClient({ client, chain });
  
  return await Promise.all(
    hashes.map((hash) =>
      eth_getTransactionReceipt(rpcRequest, { hash: hash as Address }).catch(() => null)
    )
  );
}

/**
 * Extracts contracts from receipts using different logic for ERC20 vs ERC721
 */
function extractContractsFromReceipts(receipts: any[], targetOwner: string) {
  const extractedContracts: Array<{address: string, type: string}> = [];
  const normalizedTarget = targetOwner.toLowerCase().trim().replace(/^0x0*/, "0x");
  
  receipts.forEach((receipt) => {
    if (!receipt) return;
    
    // Contract address is always in logs[0].topics[2]
    const contractAddr = receipt.logs[0]?.topics[2] ? 
      "0x" + receipt.logs[0].topics[2].slice(-40).toLowerCase() : null;
    
    if (!contractAddr) return;
    
    let ownerAddr = null;
    let type = "Unknown";
    
    if (receipt.logs.length === 8) {
      // ERC20 logic
      type = "ERC20";
      if (receipt.logs[1]?.topics[2]) {
        ownerAddr = "0x" + receipt.logs[1].topics[2].slice(-40).toLowerCase();
      } else if (receipt.logs[0]?.topics[1]) {
        ownerAddr = "0x" + receipt.logs[0].topics[1].slice(-40).toLowerCase();
      }
    } else if (receipt.logs.length === 13) {
      // ERC721 logic
      type = "ERC721";
      if (receipt.logs[3]?.topics[2]) {
        ownerAddr = "0x" + receipt.logs[3].topics[2].slice(-40).toLowerCase();
      }
    }
    
    if (ownerAddr && ownerAddr === normalizedTarget) {
      extractedContracts.push({ address: contractAddr, type });
    }
  });
  
  return extractedContracts;
}

/**
 * Fetches metadata for all contracts
 */
async function fetchContractsMetadata(contracts: Array<{address: string, type: string}>) {
  const contractsWithMetadata: Array<{
    address: string;
    type: string;
    metadata: any;
  }> = [];

  for (const contractInfo of contracts) {
    try {
      const contract = getContract({
        client,
        chain,
        address: contractInfo.address as Address,
      });

      const metadata = await getContractMetadata({ contract });
      
      contractsWithMetadata.push({
        address: contractInfo.address,
        type: contractInfo.type,
        metadata
      });
    } catch (error) {
      contractsWithMetadata.push({
        address: contractInfo.address,
        type: contractInfo.type,
        metadata: null
      });
    }
  }

  return contractsWithMetadata;
}

/**
 * Formats the final result in the required JSON structure
 */
function formatContractsResult(contractsWithMetadata: Array<{address: string, type: string, metadata: any}>): QueryDeploysResult {
  const erc20Contracts = contractsWithMetadata.filter(c => c.type === "ERC20");
  const erc721Contracts = contractsWithMetadata.filter(c => c.type === "ERC721");
  
  return {
    totalContracts: contractsWithMetadata.length,
    erc721Count: erc721Contracts.length,
    erc20Count: erc20Contracts.length,
    contracts: contractsWithMetadata.map(contract => ({
      address: contract.address,
      tokenType: contract.type,
      metadata: contract.metadata ? {
        name: contract.metadata.name || "N/A",
        symbol: contract.metadata.symbol || "N/A", 
        description: contract.metadata.description || "N/A"
      } : {
        name: "N/A",
        symbol: "N/A",
        description: "N/A"
      }
    }))
  };
} 