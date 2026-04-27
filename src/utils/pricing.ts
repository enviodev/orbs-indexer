import { BigDecimal } from "generated";
import { getChainlinkPrice } from "../effects/oraclePrice";
import { getPythPrice } from "../effects/pythPrice";
import { getTokenDecimals } from "../effects/tokenMetadata";
import { getOracleAddress, CHAIN_CONFIG } from "../constants/chain-config";

const FACTOR_1E8 = new BigDecimal("1e8");

function generateDivFactor(decimals: number): BigDecimal {
  return new BigDecimal("1" + "0".repeat(decimals));
}

// Pyth feed IDs are 32-byte values rendered as "0x" + 64 hex chars = 66 chars.
// Chainlink oracles are 20-byte addresses = 42 chars. We branch on length.
function isPythFeedId(oracleId: string): boolean {
  return oracleId.length === 66;
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
    // To stay in BigDecimal land, divide by 10^|expo| when expo < 0, multiply otherwise.
    const expo = Number(expoStr);
    const expoFactor = generateDivFactor(Math.abs(expo));
    const realPrice = expo < 0
      ? new BigDecimal(priceStr).div(expoFactor)
      : new BigDecimal(priceStr).times(expoFactor);
    return realPrice.div(divFactor);
  }

  // Chainlink path — historical block-specific call.
  const priceStr = await context.effect(getChainlinkPrice, `${chainId}:${oracleId}:${blockNumber || ""}`);
  if (!priceStr) return new BigDecimal(0);
  return new BigDecimal(priceStr).div(divFactor).div(FACTOR_1E8);
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
