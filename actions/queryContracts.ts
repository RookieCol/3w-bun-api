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

async function main(ownerWallet: string) {
  // Step 1: Fetch all transactions (both ERC20 and ERC721 use same selector)
  const deployerWallet = "0xC0BF05DE429252699cCFD7aBA2645f640e816257";
  
  let allTransactions: Transaction[] = [];
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
        limit: limit,
        page: page,
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

  // Step 2: Get receipts
  const hashes: string[] = allTransactions.map((tx) => tx.hash);
  const rpcRequest = getRpcClient({ client, chain });
  
  const receipts = await Promise.all(
    hashes.map((hash) =>
      eth_getTransactionReceipt(rpcRequest, { hash: hash as Address }).catch(() => null)
    )
  );

  // Step 3: Extract contracts using different logic based on log count
  const contractAddress: string[] = [];
  const owner: string[] = [];
  const contractType: string[] = [];
  
  receipts.forEach((receipt) => {
    if (receipt) {
      // Contract address is always in logs[0].topics[2]
      const contractAddr = receipt.logs[0]?.topics[2] ? 
        "0x" + receipt.logs[0].topics[2].slice(-40).toLowerCase() : null;
      
      let ownerAddr = null;
      let type = "Unknown";
      
      if (receipt.logs.length === 8) {
        // ERC20 logic: logs[1].topics[2] or logs[0].topics[1]
        type = "ERC20";
        if (receipt.logs[1]?.topics[2]) {
          ownerAddr = "0x" + receipt.logs[1].topics[2].slice(-40).toLowerCase();
        } else if (receipt.logs[0]?.topics[1]) {
          ownerAddr = "0x" + receipt.logs[0].topics[1].slice(-40).toLowerCase();
        }
      } else if (receipt.logs.length === 13) {
        // ERC721 logic: logs[3].topics[2]
        type = "ERC721";
        if (receipt.logs[3]?.topics[2]) {
          ownerAddr = "0x" + receipt.logs[3].topics[2].slice(-40).toLowerCase();
        }
      }
      
      if (contractAddr && ownerAddr && type !== "Unknown") {
        contractAddress.push(contractAddr);
        owner.push(ownerAddr);
        contractType.push(type);
      }
    }
  });

  // Step 4: Filter by owner
  const targetOwner = ownerWallet.toLowerCase().trim();
  const deployedByWallet: Array<{address: string, type: string}> = [];
  
  const minLength = Math.min(owner.length, contractAddress.length, contractType.length);
  for (let i = 0; i < minLength; i++) {
    const ownerAddr = owner[i];
    const contractAddr = contractAddress[i];
    const type = contractType[i];
    
    if (ownerAddr && contractAddr && type) {
      const normalizedTarget = targetOwner.replace(/^0x0*/, "0x").toLowerCase();
      
      if (ownerAddr === normalizedTarget) {
        deployedByWallet.push({ address: contractAddr, type });
      }
    }
  }

  // Step 5: Get metadata for all contracts
  console.log("Fetching contract metadata...");
  const contractsWithMetadata: Array<{
    address: string;
    type: string;
    metadata: any;
  }> = [];

  for (let i = 0; i < deployedByWallet.length; i++) {
    const contractData = deployedByWallet[i];
    if (!contractData) continue;
    
    const { address, type } = contractData;
    
    try {
      const contract = getContract({
        client,
        chain,
        address: address as Address,
      });

      const metadata = await getContractMetadata({ contract });
      
      contractsWithMetadata.push({
        address,
        type,
        metadata
      });
      
      console.log(`✅ Fetched metadata for ${address} (${type})`);
    } catch (error) {
      console.log(`❌ Failed to fetch metadata for ${address}: ${error}`);
      contractsWithMetadata.push({
        address,
        type,
        metadata: null
      });
    }
  }

  // Step 6: Format results in the specified JSON format
  const erc20Contracts = contractsWithMetadata.filter(c => c.type === "ERC20");
  const erc721Contracts = contractsWithMetadata.filter(c => c.type === "ERC721");
  
  const formattedResult = {
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

  // Display the formatted JSON
  console.log("\n=== DEPLOYED CONTRACTS ===");
  console.log(JSON.stringify(formattedResult, null, 2));

  return formattedResult;
}

// Run the function with the owner wallet
main("0x681AA2C3266Dd8435411490773f28FE5fa0E5FF7").catch(console.error); 