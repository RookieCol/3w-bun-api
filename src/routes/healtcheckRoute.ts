import { Hono } from "hono";

const router = new Hono();


router.get('/', (c) => c.text('Welcome to the Thirdweb Hono API'));
router.get('/health', (c) => c.json({ status: 'ok' }));

export default router; 