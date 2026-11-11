# APEX Runner Crypto Signals — MCP server

Live crypto market signals for AI trading agents, served over the
[Model Context Protocol](https://modelcontextprotocol.io) and paid per call with
[x402](https://x402.org) (USDC on Base). No account, no API key.

This repository is the public companion to the hosted server: connection details,
the payment model, an example client and the MCP Registry `server.json`.
The server itself is hosted at `https://apexrunner.ai/mcp`; its source is not published here.

## What it provides

49 tools: 46 paid signals and 3 free tools.

- **Market regime and sentiment:** regime detection and confluence across BTC, ETH and SOL,
  regime-transition probability, Fear & Greed, altcoin season, BTC dominance.
- **Derivatives pressure:** funding rates (including Hyperliquid), liquidation pressure and
  liquidation magnets, crowded-trade detection, whale sentiment.
- **Execution:** execution-window timing, slippage forecast, order routing, volatility and
  funding ticks.
- **Composites:** combined alpha, conviction and stress scores, and market bundles.

The current list of tools, with prices and input schemas, is always at
[`https://apexrunner.ai/mcp.json`](https://apexrunner.ai/mcp.json) (generated from the live server),
or ask the server with `tools/list`.

**Note:** APEX Runner's own trading grids are currently paused. Market signals are computed from
live data; tools that report on APEX's own bots say so in their response.

## Connect

| | |
|---|---|
| URL | `https://apexrunner.ai/mcp` |
| Transport | Streamable HTTP (stateless) |
| Auth | None — paid tools are paid per call with x402 |

Any MCP client that supports remote Streamable HTTP servers can connect. Start with the free
`get_free_market_snapshot` tool to confirm the connection: it returns BTC price, Fear & Greed,
the BTC regime and a preview of the APEX alpha score, with no payment.

## Payment (x402)

Paid tools cost $0.007 each ($0.014 for `market_tick`), settled in USDC on Base mainnet
(`eip155:8453`). The server follows the
[x402 MCP transport](https://github.com/coinbase/x402):

1. Call a paid tool with no payment. The server returns a tool result with `isError: true` and
   the `PaymentRequired` object (amount, asset, network, payTo) in `structuredContent`, also
   JSON-encoded in the first text content item.
2. Sign the payment and retry the same call with the `PaymentPayload` in
   `params._meta["x402/payment"]`.
3. The result carries the tool's data, and the settlement receipt in
   `result._meta["x402/payment-response"]`.

Clients without x402 support still see the price and instructions in the error result.

### Example client (Node)

[`examples/paid_call.mjs`](examples/paid_call.mjs) uses Coinbase's
[`@x402/mcp`](https://www.npmjs.com/package/@x402/mcp) (`wrapMCPClientWithPayment`) to call the
free tool, then a paid tool with automatic payment and a per-call spending cap.
Use a dedicated wallet that holds only a small amount of USDC.

## Links

- Website: https://apexrunner.ai
- API docs: https://apexrunner.ai/signals/docs/
- HTTP x402 endpoints and catalog: https://apexrunner.ai/signals/catalog

## License

MIT — see [LICENSE](LICENSE). Covers the contents of this repository (docs, example, metadata).
