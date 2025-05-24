import { Hono } from "hono";
import { deployERC20, deployERC721 } from "@/lib/thirdweb/deploy";

const router = new Hono();

// Deploy ERC20 token
router.post('/erc20', async (c) => {
  const body = await c.req.json();
  try {
    const address = await deployERC20(body);
    return c.json({ address });
  } catch (err: any) {
    console.error(err);
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


router.post('/erc721', async (c) => {
  const body = await c.req.json();
  try {
    const address = await deployERC721(body);
    return c.json({ address });
  } catch (err: any) {
    console.error(err);

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