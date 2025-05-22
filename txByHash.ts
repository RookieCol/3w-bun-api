import { createThirdwebClient, defineChain, type Address } from "thirdweb";
import { getContract } from "thirdweb/contract";
import { getContractMetadata } from "thirdweb/extensions/common";
import { isERC721 } from "thirdweb/extensions/erc721";
import {
    getRpcClient,
    eth_getTransactionReceipt,
} from "thirdweb/rpc";
import { checksumAddress } from "thirdweb/utils";

const secretKey = '5033638d3031429cd77516c2302eb3f6';

if (!secretKey) {
  throw new Error("THIRDWEB_SECRET_KEY is not set");
}

const client = createThirdwebClient({
    clientId: secretKey,
});

const chain = defineChain(31);

/**
 * Fetches deploy transactions for a given wallet address
 */
async function fetchDeployTransactions(
  walletAddress: string,
  clientId: string,
  blockTimestamp?: number,
  limit: number = 20
) {
  const DEPLOY_FUNCTION_SELECTOR = "0xd057c8b1";
  
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

/**
 * Extracts deployed contract address from transaction hash
 */
async function getAddressFromTxHash(txHash: string): Promise<string | null> {
  try {
    const rpcRequest = getRpcClient({ client, chain });
    const transactionReceipt = await eth_getTransactionReceipt(rpcRequest, { hash: txHash as Address });
    
    const topic = transactionReceipt.logs[0]?.topics[2];
    if (topic) {
      const address = checksumAddress(topic.slice(-42));
      return address;
    }
    return null;
  } catch (error) {
    console.error(`Error getting address from tx hash ${txHash}:`, error);
    return null;
  }
}

/**
 * Creates a contract object for a given address and fetches its metadata
 */
async function createContractObjectWithMetadata(address: string) {
  try {
    const contract = getContract({
      address: address as Address,
      chain: chain, // Rootstock
      client: client,
    });
    
    // Check token standards
    let isERC721Contract = false;
    let isERC20Contract = false;
    let tokenType = "ERC20"; // Default to ERC20
    
    try {
      isERC721Contract = await isERC721({ contract });
      if (isERC721Contract) {
        tokenType = "ERC721";
        isERC20Contract = false;
      } else {
        // If not ERC721, assume it's ERC20
        isERC20Contract = true;
      }
    } catch (erc721Error: any) {
      // If ERC721 check fails, assume it's ERC20
      isERC20Contract = true;
    }
    
    // Fetch contract metadata
    let metadata = null;
    try {
      metadata = await getContractMetadata({ contract });
    } catch (metadataError: any) {
      // Silent fail for metadata
    }
    
    console.log(`  → ${address} (${tokenType})`);
    
    return { 
      contract, 
      metadata, 
      tokenType,
      isERC721: isERC721Contract,
      isERC20: isERC20Contract
    };
    
  } catch (error) {
    console.error(`Error creating contract for address ${address}:`, error);
    return null;
  }
}

/**
 * Main function that fetches all deploy transactions and extracts addresses
 */
async function fetchAllDeployedAddresses(walletAddress: string, clientId: string) {
  try {
    console.log(`Fetching deploy transactions for wallet: ${walletAddress}`);
    
    // Step 1: Fetch all deploy transaction hashes
    const deployTransactions = await fetchDeployTransactions(walletAddress, clientId);
    const hashes = (deployTransactions as {data: {hash: string}[]}).data.map((tx: {hash: string}) => tx.hash);
    
    console.log(`\nFound ${hashes.length} deploy transactions. Processing contracts...`);
    
    // Step 2: Extract addresses from each transaction hash
    const addresses: string[] = [];
    const contractsWithMetadata: any[] = [];
    
    for (const hash of hashes) {
      const address = await getAddressFromTxHash(hash);
      
      if (address) {
        addresses.push(address);
        
        // Step 3: Create contract object and fetch metadata
        const contractData = await createContractObjectWithMetadata(address);
        if (contractData) {
          contractsWithMetadata.push(contractData);
        }
      }
    }
    
    // Token type summary
    const erc721Count = contractsWithMetadata.filter(item => item.isERC721).length;
    const erc20Count = contractsWithMetadata.filter(item => item.isERC20).length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total contracts found: ${contractsWithMetadata.length}`);
    console.log(`ERC721: ${erc721Count} | ERC20: ${erc20Count}`);
    
    console.log("\nContract Details:");
    contractsWithMetadata.forEach((item, index) => {
      console.log(`${index + 1}. ${item.contract.address} (${item.tokenType})`);
      if (item.metadata) {
        console.log(`   Name: ${item.metadata.name || 'N/A'} | Symbol: ${item.metadata.symbol || 'N/A'}`);
        console.log(`   Description: ${item.metadata.description || 'N/A'}`);
      }
    });
    
    return { addresses, contractsWithMetadata };
    
  } catch (error) {
    console.error("Error in fetchAllDeployedAddresses:", error);
    return { addresses: [], contractsWithMetadata: [] };
  }
}

// Execute the script
const clientId = "5033638d3031429cd77516c2302eb3f6";
const walletAddress = "0xC0BF05DE429252699cCFD7aBA2645f640e816257";

fetchAllDeployedAddresses(walletAddress, clientId);