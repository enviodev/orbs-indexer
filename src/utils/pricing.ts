import { BigDecimal } from "generated";
import { getChainlinkPrice, getChainlinkOracleDecimals } from "../effects/oraclePrice";
import { getPythPrice } from "../effects/pythPrice";
import { getV2PoolReserves } from "../effects/v2Pool";
import { getTokenDecimals } from "../effects/tokenMetadata";
import { getOracleAddress, CHAIN_CONFIG } from "../constants/chain-config";
import type { SpecialTokenConfig } from "../constants/chain-config";

function generateDivFactor(decimals: number): BigDecimal {
  return new BigDecimal("1" + "0".repeat(decimals));
}

// Pyth feed IDs are 32-byte values rendered as "0x" + 64 hex chars = 66 chars.
// Chainlink oracles are 20-byte addresses = 42 chars. We branch on length.
function isPythFeedId(oracleId: string): boolean {
  return oracleId.length === 66;
}

// Mirrors the original subgraph getV2Price(): returns
//   (reserve0 / 10^token0Decimals) / (reserve1 / 10^token1Decimals)
// i.e. "real units of token0 per real unit of token1".
async function getV2Price(context: any, chainId: number, pool: string, blockNumber?: number): Promise<BigDecimal | null> {
  const result = await context.effect(getV2PoolReserves, `${chainId}:${pool}:${blockNumber || ""}`);
  if (!result) return null;
  const [token0, token1, r0Str, r1Str] = result.split("|");
  if (!token0 || !token1 || !r0Str || !r1Str) return null;
  const [d0, d1] = await Promise.all([
    context.effect(getTokenDecimals, `${chainId}:${token0}`),
    context.effect(getTokenDecimals, `${chainId}:${token1}`),
  ]);
  const real0 = new BigDecimal(r0Str).div(generateDivFactor(d0));
  const real1 = new BigDecimal(r1Str).div(generateDivFactor(d1));
  if (real1.isZero()) return null;
  return real0.div(real1);
}

// Per-raw-unit USD price for a special token (V2-pool fallback).
// Mirrors the special-token branches in subgraphs/{liquidity-hub-analytics,orbs-twap}/src/utils/utils.ts
// fetchUSDValue, with two fixes — see PRICING_NOTES.md:
//
//   v2price                — pool / decimals                   (QUICK on Polygon, THE on BSC)
//                            Pool is target/USD-stable; pool returns USD-per-target-real.
//   v2price_inverse        — 1 / (pool * decimals)             (CHR on Arbitrum)
//                            Pool returns target/USDC, so USD-per-target = 1/pool.
//                            Subgraph's `decimals/pool` is dimensionally wrong.
//   v2recursive            — pool * baseAsset per-raw-USD      (ARX, BSWAP, BOO, RAM)
//                            Pool ordering: base = token0, target = token1.
//                            poolPrice = real_base/real_target, per-raw-target = pool * basePerRaw.
//   v2recursive_inverse    — baseAsset per-raw-USD / pool      (LYNX)
//                            Pool ordering: target = token0, base = token1.
//                            poolPrice = real_target/real_base, per-raw-target = basePerRaw / pool.
async function fetchSpecialTokenUSDValue(
  context: any,
  chainId: number,
  special: SpecialTokenConfig,
  blockNumber?: number
): Promise<BigDecimal> {
  const poolPrice = await getV2Price(context, chainId, special.pool, blockNumber);
  if (!poolPrice) return new BigDecimal(0);
  if (poolPrice.isZero()) return new BigDecimal(0);
  const decimalsFactor = new BigDecimal(special.decimals);

  if (special.type === "v2price") {
    return poolPrice.div(decimalsFactor);
  }
  if (special.type === "v2price_inverse") {
    return new BigDecimal("1").div(poolPrice).div(decimalsFactor);
  }

  // recursive types — multiply or divide by base asset's per-raw-unit USD price
  if (!special.baseAsset || !special.baseAssetAddress) return new BigDecimal(0);
  const basePerRawUnit = await fetchUSDValue(
    context, chainId, special.baseAsset, special.baseAssetAddress, blockNumber
  );
  if (basePerRawUnit.isZero()) return new BigDecimal(0);

  if (special.type === "v2recursive") {
    return poolPrice.times(basePerRawUnit);
  }
  if (special.type === "v2recursive_inverse") {
    return basePerRawUnit.div(poolPrice);
  }

  return new BigDecimal(0);
}

export async function fetchUSDValue(
  context: any,
  chainId: number,
  assetName: string,
  assetAddress: string,
  blockNumber?: number
): Promise<BigDecimal> {
  const config = CHAIN_CONFIG[chainId];
  if (!config) return new BigDecimal(0);

  // Special-token pricing first — the original subgraph checks these before falling through to oracles.
  const special = config.specialTokens[assetName];
  if (special) {
    return await fetchSpecialTokenUSDValue(context, chainId, special, blockNumber);
  }

  const oracleId = getOracleAddress(chainId, assetName);
  if (!oracleId) return new BigDecimal(0);

  const decimals = await context.effect(getTokenDecimals, `${chainId}:${assetAddress}`);
  const divFactor = generateDivFactor(decimals);

  if (isPythFeedId(oracleId)) {
    if (!config.pythOracleAddress) return new BigDecimal(0);
    const result = await context.effect(
      getPythPrice,
      `${chainId}:${config.pythOracleAddress}:${oracleId}:${blockNumber || ""}`
    );
    if (!result) return new BigDecimal(0);
    const [priceStr, expoStr] = result.split("|");
    if (!priceStr || !expoStr) return new BigDecimal(0);
    // Pyth: real price = price * 10^expo. expo is typically negative (e.g. -8).
    const expo = Number(expoStr);
    const expoFactor = generateDivFactor(Math.abs(expo));
    const realPrice = expo < 0
      ? new BigDecimal(priceStr).div(expoFactor)
      : new BigDecimal(priceStr).times(expoFactor);
    return realPrice.div(divFactor);
  }

  // Chainlink path — historical block-specific call. Scale by the feed's actual decimals
  // (most USD feeds are 8, but ETH-paired feeds are 18 — see PRICING_NOTES.md for context).
  const priceStr = await context.effect(getChainlinkPrice, `${chainId}:${oracleId}:${blockNumber || ""}`);
  if (!priceStr) return new BigDecimal(0);
  const oracleDecimals = await context.effect(getChainlinkOracleDecimals, `${chainId}:${oracleId}`);
  return new BigDecimal(priceStr).div(divFactor).div(generateDivFactor(oracleDecimals));
}

export async function fetchTokenUsdValue(
  context: any,
  chainId: number,
  srcTokenSymbol: string | null | undefined,
  srcTokenAddress: string | null | undefined,
  srcAmount: string | null | undefined,
  dstTokenSymbol: string | null | undefined,
  dstTokenAddress: string | null | undefined,
  dexAmountOut: string | null | undefined,
  blockNumber?: number
): Promise<BigDecimal> {
  if (srcAmount && srcTokenSymbol && srcTokenAddress) {
    const price = await fetchUSDValue(context, chainId, srcTokenSymbol, srcTokenAddress, blockNumber);
    if (!price.isZero()) {
      return price.times(new BigDecimal(srcAmount));
    }
  }
  if (dexAmountOut && dstTokenSymbol && dstTokenAddress) {
    const price = await fetchUSDValue(context, chainId, dstTokenSymbol, dstTokenAddress, blockNumber);
    if (!price.isZero()) {
      return price.times(new BigDecimal(dexAmountOut));
    }
  }
  return new BigDecimal(0);
}
