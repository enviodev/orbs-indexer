# Pricing notes — porting from the original subgraph

This file tracks pricing-related quirks discovered while porting
`subgraphs/liquidity-hub-analytics` and `subgraphs/orbs-twap` to this Envio
indexer. The intent of the port is **1:1 parity with the subgraph**, with two
narrow exceptions documented below where strict parity would propagate
known data-correctness bugs.

---

## How pricing works in this indexer

Three pricing paths, mirroring the original subgraph:

1. **Special tokens (V2 pool)** — `src/utils/pricing.ts → fetchSpecialTokenUSDValue`.
   Tokens with no oracle (QUICK, THE, CHR, ARX, RAM, BSWAP, BOO, LYNX) are
   priced from a Uniswap-V2-style pool. Configured in
   `CHAIN_CONFIG[chainId].specialTokens`.

2. **Pyth** — `src/effects/pythPrice.ts`. Used on Blast, Sei, Berachain.
   Detected by oracle ID being 32 bytes (66 hex chars).

3. **Chainlink** — `src/effects/oraclePrice.ts`. Default for everything else.
   Detected by oracle ID being a 20-byte address (42 hex chars).

The branch order in `fetchUSDValue`: special tokens first, then oracle
(Pyth or Chainlink) second.

---

## Bug 1 — Polygon zkEVM LINK was a LINK/ETH feed (not LINK/USD)

### Symptom

After the first sync of the ported indexer, Polygon zkEVM (`chain_id = 1101`)
reported a cumulative swap volume of **~$5.0B** on a small trickle of swaps.
The single largest swap claimed **$2.7B** for transferring 67 LINK. LINK was
trading around $15 at the time (true value of that swap: ~$1,000).

Inspecting the top swaps showed every inflated row involved LINK as either
src or dst token. Every other token on Polygon zkEVM (ETH, USDC, MATIC, POL,
DAI, CRV, WBTC) showed plausible USD values.

### Root cause

The original subgraph config `subgraphs/liquidity-hub-analytics/config/polygon-zkevm.json`
points the LINK oracle at:

```
"link": "0x0E3eA8Bc02eE78D21Edad8E1E907E575fCa1C1A8"
```

Direct RPC probes against this contract:

```
decimals()    → 18
description() → "LINK / ETH"
```

So this is a **LINK/ETH** Chainlink feed at 18-decimal precision — it returns
"how much ETH 1 LINK is worth", *not* "how much USD 1 LINK is worth". For
context, the other Polygon zkEVM oracles in the same config are correctly
USD-paired:

| Feed                                       | Decimals | Description |
|--------------------------------------------|----------|-------------|
| `0x97d9F9A00dEE0004BE8ca0A8fa374d486567eE2D` | 8        | ETH / USD   |
| `0x0167D934CB7240e65c35e347F00Ca5b12567523a` | 8        | USDC / USD  |
| `0x0E3eA8Bc02eE78D21Edad8E1E907E575fCa1C1A8` | 18       | LINK / ETH  |

The original subgraph’s pricing math hardcoded the assumption that *every*
Chainlink answer is scaled by `1e8` (the standard for USD pairs). Combined
with treating the answer as USD-denominated, this produced two compounding
errors for any non-standard feed:

- **Wrong scale**: dividing an 18-decimal answer by `1e8` makes the per-unit
  price `10^10` larger than intended.
- **Wrong unit**: the answer is denominated in ETH, but treated as USD —
  effectively multiplying by ETH/USD (~3,000×) on top.

For 67 LINK at the actual feed value of `0x000e4c159b2041b9` (4.02e15, i.e.
0.00402 ETH per LINK), the math worked out to:

```
4.02e15 / 10^18 (LINK decimals) / 10^8 (assumed feed scaling) = 4.02e-11   per raw LINK wei
67 LINK = 6.7e19 raw units
6.7e19 × 4.02e-11 ≈ $2.7B
```

Real value: 67 × $15 = **$1,005**.

### What the original subgraph would have produced

Identical inflated values. The subgraph's `fetchUSDValue` performs the same
two divisions:

```ts
return latestAnswer.value
  .divDecimal(generateDivFactor(assetDecimals))
  .div(FACTOR_1E8);
```

We are not introducing a new bug — we surfaced one that was already present.
Polygon zkEVM has very low LH/TWAP volume, so this likely went unnoticed in
the original deployment.

### Fix in this indexer

Two changes, intentionally **diverging from strict subgraph parity**:

1. **`src/effects/oraclePrice.ts`** — added `getChainlinkOracleDecimals` effect
   that reads `decimals()` from the feed contract, cached per `(chainId, oracle)`
   tuple. `pricing.ts` now scales by the feed's *actual* decimals instead of
   the hardcoded `1e8`. This means an 18-decimal feed is correctly handled if
   one is misconfigured on any chain — defense in depth against a class of
   bug, not just this one instance.

2. **`src/constants/chain-config.ts`** — removed the LINK entry from
   `CHAIN_CONFIG[1101].oracleAddresses`. Even with dynamic decimal scaling,
   the LINK/ETH feed would still produce ETH-denominated numbers
   misinterpreted as USD (just no longer wildly inflated — instead silently
   undercounting by ~ETH/USD price). There is no LINK/USD feed published on
   Polygon zkEVM Chainlink at the time of writing. Until one exists, LINK
   on Polygon zkEVM falls through to `$0` rather than producing misleading
   values.

After these fixes, Polygon zkEVM LINK swaps contribute `0` to volume rather
than billions. All other tokens on Polygon zkEVM (and every other chain)
continue to price correctly.

If/when Chainlink publishes a `LINK/USD` feed on Polygon zkEVM, add it back:

```ts
LINK: "0x...",  // LINK/USD oracle, 8 decimals
```

---

## How to audit other chains for the same class of bug

Anyone configuring oracles for a new chain (or auditing existing ones) should
verify each feed against expectations. Quick recipe with `cast` (foundry):

```bash
RPC=$ENVIO_RPC_URL_<chainId>
cast call $ORACLE_ADDR "decimals()(uint8)" --rpc-url $RPC
cast call $ORACLE_ADDR "description()(string)" --rpc-url $RPC
```

Or with raw `curl`:

```bash
# decimals (selector 0x313ce567)
curl -s "$RPC" -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc":"2.0","method":"eth_call","id":1,
  "params":[{"to":"<ORACLE>","data":"0x313ce567"},"latest"]
}'

# description (selector 0x7284e416)
curl -s "$RPC" -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc":"2.0","method":"eth_call","id":1,
  "params":[{"to":"<ORACLE>","data":"0x7284e416"},"latest"]
}'
```

Expectations for each entry in `CHAIN_CONFIG[chainId].oracleAddresses`:

- `decimals()` should be `8` — Chainlink USD pairs use 8 decimals universally.
- `description()` should be `"<TOKEN> / USD"`. Anything else (`"X / ETH"`,
  `"X / BTC"`, etc.) means the feed is not USD-denominated and *will* produce
  garbage USD totals.

The dynamic-decimal fix in this indexer hides the worst case (wildly
inflated values from 18-decimal feeds), but **it cannot rescue a non-USD
feed**. Such feeds must either be replaced with a USD pair or removed from
the config.

---

## Bug 2 — placeholder

Add new bugs above this line as they are discovered.
