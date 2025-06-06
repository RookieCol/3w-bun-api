import { Hono } from "hono";
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors'
import deployRoutes from "@/routes/deployRoute";
import healthcheckRoutes from "@/routes/healtcheckRoute";
import queryDeploysRoutes from "@/routes/queryDeploysRoute";

const app = new Hono();

app.use(prettyJSON())

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Mount routes
app.route('/', healthcheckRoutes);
app.route('/v1/deploy', deployRoutes);  
app.route('/v1/deploys', queryDeploysRoutes);

export default { 
    port: 4000, 
    fetch: app.fetch, 
  } 