import "dotenv/config";
import { serve } from "@hono/node-server";
import { Context, Hono, HonoRequest } from "hono";
import { logger } from "hono/logger";
import { getConnInfo } from "@hono/node-server/conninfo";

const extractFromRequest = (req: HonoRequest) => {
  let remoteIp = req.header("x-forwarded-for");
  if (!remoteIp) {
    remoteIp = req.header("x-real-ip");
  }

  if (remoteIp && remoteIp.includes(",")) {
    remoteIp = remoteIp.split(",")[0].trim();
  }

  return remoteIp;
};

const extractFromRuntime = (c: Context) => {
  const connInfo = getConnInfo(c);
  return connInfo.remote.address;
};

const app = new Hono();

app.use(logger());

app.get("/me", (c) => {
  const remoteIp =
    extractFromRequest(c.req) || extractFromRuntime(c) || "unknown";
  return c.json({ you: remoteIp });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
