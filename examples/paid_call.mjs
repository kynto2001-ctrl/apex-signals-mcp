// Call a paid APEX tool with automatic x402 payment.
//   npm install @x402/mcp @x402/core @x402/evm @modelcontextprotocol/sdk viem
//   PRIVATE_KEY=0x... node paid_call.mjs
// Use a dedicated wallet holding only a little USDC on Base. The hook below
// refuses any single payment above MAX_ATOMIC (USDC has 6 decimals).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { wrapMCPClientWithPayment } from "@x402/mcp";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const MAX_ATOMIC = 20_000n; // $0.02
const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const payments = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const mcp = new Client({ name: "apex-example", version: "1.0.0" });
const client = wrapMCPClientWithPayment(mcp, payments, {
  autoPayment: true,
  onPaymentRequested: async ({ paymentRequired }) =>
    BigInt(paymentRequired.accepts[0].amount) <= MAX_ATOMIC,
});

await mcp.connect(new StreamableHTTPClientTransport(new URL("https://apexrunner.ai/mcp")));

const free = await client.callTool("get_free_market_snapshot", {});
console.log(free.content[0].text);

const paid = await client.callTool("regime", { coin: "BTC" });
if (paid.isError) {
  // Payment declined by the hook, or failed (e.g. insufficient_funds): the result holds
  // the payment requirements and the reason, never the tool's data.
  let reason = paid.content[0].text;
  try { reason = JSON.parse(reason).error ?? reason; } catch {}
  console.error("not paid:", reason);
} else {
  console.log(paid.content[0].text);
  console.log("settled:", paid.paymentResponse?.transaction);
}
await mcp.close();
