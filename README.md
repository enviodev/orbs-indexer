# Orbs Protocol Indexer

[Envio HyperIndex](https://envio.dev) indexer for the [Orbs Protocol](https://www.orbs.com/)
ecosystem. Indexes governance contracts, TWAP DEX, and Liquidity Hub events
across the chains where Orbs operates, with USD pricing for all swaps.

Ported 1:1 from the original subgraphs at
`subgraphs/liquidity-hub-analytics` and `subgraphs/orbs-twap`, with documented
divergences captured in [PRICING_NOTES.md](./PRICING_NOTES.md).

## Indexed contracts

**Governance (Ethereum mainnet only)** — Delegations, Committee, Elections,
Subscriptions, Protocol, GuardiansRegistration, Certification, OrbsContractRegistry.

**TWAP DEX** — `TwapContract` events on Mainnet, Polygon, BSC, Base, Fantom,
Linea, Arbitrum, Sonic, Sei, Avalanche, Berachain, Flare, Katana (config
present, currently commented out).

**Liquidity Hub** — `Reactor` (Fill), `ExecutorV5` (Resolved/Surplus), and
`ExecutorV6` (ResolvedV6/SurplusV6/ExtraOut) on Mainnet, Polygon, BSC, Base,
Fantom, Linea, Arbitrum, Sonic, Polygon zkEVM, Blast.

See [`config.yaml`](./config.yaml) for exact start blocks and addresses per chain.

## Pricing

Swap USD values are computed at the historical block of each event via three
paths, mirroring the original subgraph:

1. **V2 pool fallback** — for tokens with no oracle (QUICK on Polygon, THE on
   BSC, BOO on Fantom, LYNX on Linea, RAM/CHR/ARX on Arbitrum, BSWAP on Base).
   Reads reserves from a Uniswap-V2-style pair and back-computes USD via a
   known-priced base asset.
2. **Pyth** — for chains where Chainlink isn't deployed: Blast, Sei,
   Berachain. Identified by 32-byte feed IDs.
3. **Chainlink** — default. Feed decimals are read dynamically (most are 8 but
   some L2s publish 18-decimal ETH-paired feeds). See PRICING_NOTES.md
   for an audit of feeds that produce wrong values and how they were handled.

All effects are cached per `(chainId, contract, blockNumber)` in
`.envio/cache/` so re-syncs after code changes are RPC-cheap.

## Run

```bash
TUI_OFF=true pnpm dev
```

Visit http://localhost:8080 — local Hasura password is `testing`.

## Codegen

After editing `config.yaml` or `schema.graphql`:

```bash
pnpm codegen
```

After editing TypeScript:

```bash
pnpm tsc --noEmit
```

## Environment

Every chain you index needs `ENVIO_RPC_URL_<chainId>` in `.env`. Used by Effect
calls (token metadata, oracle prices, V2 pool reserves) and — for Katana,
which isn't on HyperSync — by the indexer's sync engine itself. All env vars
must be `ENVIO_`-prefixed; the hosted service only forwards those at runtime.

`.env` is gitignored. Never inline an RPC URL in `config.yaml`.

## Prerequisites

- [Node.js v22+ (v24 recommended)](https://nodejs.org/en/download/current)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/)
- `ENVIO_API_TOKEN` for HyperSync access

## Further reading

- [AGENTS.md](./AGENTS.md) — workflow + conventions for this project (used by
  Cursor, Claude Code, Codex)
- [PRICING_NOTES.md](./PRICING_NOTES.md) — known data-correctness issues
  inherited from the original subgraph and how this port handles each
- [Envio HyperIndex docs](https://docs.envio.dev/docs/HyperIndex-LLM/hyperindex-complete) —
  full reference for schema, config, handlers, Effect API, testing
