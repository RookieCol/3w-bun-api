import { Hono } from "hono";
import { queryDeployedContracts } from "@/lib/thirdweb/queryDeploys";

const router = new Hono();

// Get deployed contracts by wallet address
router.get('/:walletAddress', async (c) => {
  try {
    const walletAddress = c.req.param('walletAddress');
    
    if (!walletAddress) {
      return c.json({ 
        error: {
          code: 400,
          message: "Wallet address is required"
        }
      }, 400);
    }

    const result = await queryDeployedContracts(walletAddress);
    return c.json(result);
  } catch (err: any) {
    console.error('Error querying deployed contracts:', err);
    
    if (err.code && err.message) {
      return c.json({ 
        error: {
          code: err.code,
          message: err.message
        }
      }, 400);
    }
    
    return c.json({ 
      error: {
        code: 500,
        message: err.message || 'Internal server error'
      }
    }, 500);
  }
});

export default router; 