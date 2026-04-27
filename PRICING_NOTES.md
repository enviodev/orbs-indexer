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

## Bug 2 — Linea FOXY oracle returns garbage instead of reverting

### Symptom

Linea (`chain_id = 59144`) cumulative volume hit ~$1.6 × 10¹⁶ ("sixteen
quadrillion dollars"). The single largest swap claimed $1 × 10¹³ for
swapping 100K FOXY → 0.379 ETH (real value: ~$1,300).

### Root cause

The original subgraph config `subgraphs/orbs-twap/config/linea.json`
had:

```
"foxy": "0xdE14081b6bd39230EcA7Be1137413b7b87B07C07"
```

This is the **FOXY token contract itself**, not a Chainlink oracle.
Probing it shows:

```
decimals()      → reverts
latestAnswer()  → returns ~10005469022000 (1e16 range, looks like
                  totalSupply or balanceOf state, not a price)
```

The pricing math then divides a ~1e16 garbage number by `1e18 *
1e8 = 1e26` and multiplies by `1e23` raw FOXY input, producing ~$1e13.

### Fix

Drop the FOXY entry from `CHAIN_CONFIG[59144].oracleAddresses`. FOXY
swaps now contribute `$0` until a real oracle exists. Note that FOXY
acts as the destination side of many Linea swaps via LH; those swaps
still get priced via the *other* token in the pair (when that token
has a valid oracle).

This is the same class of bug as Bug 1 (LINK on Polygon zkEVM): the
original subgraph config points at a contract that *responds* to the
Chainlink selectors with garbage instead of reverting cleanly.

## Bug 3 — RAM (Arbitrum) special-token formula was inverted

### Symptom

Arbitrum (`chain_id = 42161`) cumulative volume hit ~$2.1 × 10¹⁵.
Every inflated swap involved RAM.

### Root cause

The original subgraph treats RAM and LYNX with the same formula:

```ts
return wethPrice / lynxWeth;  // for LYNX
return wethPrice / ramWeth;   // for RAM
```

But LYNX and RAM have **opposite token orderings** in their pools:

| Token | Address (start) | Pool counterpart | Sorted order |
|-------|-----------------|------------------|--------------|
| LYNX  | 0x1a51b…        | WETH (0xe5d7…)   | LYNX = token0 |
| RAM   | 0xaaa6c…        | WETH (0x82af…)   | WETH = token0 |

`getV2Price` returns `real_token0 / real_token1`. Working through the
dimensions:

- LYNX = token0, WETH = token1 → poolPrice = real_LYNX/real_WETH
  → per-raw-LYNX = wethPerRaw / poolPrice ✓ subgraph formula correct
- RAM = token1, WETH = token0 → poolPrice = real_WETH/real_RAM
  → per-raw-RAM = wethPerRaw × poolPrice ✗ subgraph formula wrong

The subgraph applies LYNX's formula to RAM, inflating per-raw-RAM by
a factor of ~`(1/poolPrice)²`. With ~250,000 RAM per WETH, that's a
6×10¹⁰ overstatement.

### Fix

Change RAM's `specialTokens` entry from `v2recursive_inverse` to
`v2recursive`. ARX and BSWAP (also on Arbitrum/Base, both with WETH
as token0) already used `v2recursive` correctly — RAM matches their
pool ordering and should use the same type.

A more robust long-term option: detect token ordering at runtime from
`getV2PoolReserves` and pick the formula automatically. The current
fix relies on the operator picking the right `type` — which is fine
for the small set of special tokens we have, but worth revisiting if
new ones get added.

## Bug 4 — CHR (Arbitrum) special-token formula was dimensionally wrong

### Symptom

CHR pricing on Arbitrum produced values ~10³⁶× too large. (Volume
impact small in practice — few CHR trades — but the formula is
fundamentally broken.)

### Root cause

CHR/USDC pool: CHR = token0 (0x15b2…), USDC = token1 (0xaf88…).
poolPrice = real_CHR / real_USDC = "CHR per USDC".

What we want: per-raw-CHR USD price.

- 1 USDC = poolPrice CHR → 1 CHR = (1/poolPrice) USDC ≈ (1/poolPrice) USD
- per-raw-CHR = (1/poolPrice) / 10^CHR_decimals = 1 / (poolPrice × 1e18)

What the original subgraph computes:

```ts
return CHR_DECIMALS / getV2Price(CHR_USDC_POOL);
//   = 1e18 / poolPrice
```

That's `1e18 / poolPrice` instead of `1 / (poolPrice × 1e18)` — off
by a factor of `1e36`.

### Fix

Update the `v2price_inverse` branch in `pricing.ts` to compute
`1 / (pool × decimals)` instead of `decimals / pool`.

This diverges from strict subgraph parity but produces sensible USD.
Polygon and BSC special tokens (QUICK, THE — `v2price` type) use the
mirror formula `pool / decimals`, which has always been correct
because their pool ordering puts the USD-stable token as token0.

## Bug 5 — SwapDaily / SwapTotal aggregations contaminated by previous runs

### Symptom

Even after fixing the per-Swap pricing math, `SwapDaily` and
`SwapTotal` rows hold values inconsistent with their constituent
`Swap.dollarValue` fields. Example: Fantom 2024-12-26 had 179 swaps
with combined `Swap.dollarValue` of $1,147 but `SwapDaily` reports
$995 trillion for that day.

### Root cause

The aggregation logic in `executor.ts` and `reactor.ts` increments
`SwapDaily.dailyTotalCalculatedValue` and
`SwapTotal.cumulativeTotalCalculatedValue` once per `Resolved` /
`ResolvedV6` event using the *current* run's pricing math. When code
changes, previously-written aggregate values are not recomputed.
`Swap.dollarValue` *is* recomputed on every Resolved/Surplus, but
the aggregates only ever monotonically increase.

### Fix

This isn't a code bug per se — it's an artifact of running pricing
fixes against a database populated by previous (buggier) code. Two
operator options:

1. **Wipe the database and resync from scratch.** Cleanest fix.
   All entities (per-swap and aggregate) get recomputed with the
   current code, no stale values stick. Required after any pricing-
   logic change that should affect historical data.
2. **Recompute aggregates from `Swap.dollarValue` rows.** Possible
   via a one-shot SQL migration but adds complexity. Only worth doing
   if a full resync is too expensive.

For this customer migration the recommended path is (1) once the
pricing logic settles. Track when known-buggy code last touched the
database; everything before that point is suspect.

## Bug 6 — placeholder

Add new bugs above this line as they are discovered.
