import { BigDecimal } from "generated";
import { getChainlinkPrice } from "../effects/oraclePrice";
import { getTokenDecimals } from "../effects/tokenMetadata";
import { getOracleAddress, CHAIN_CONFIG } from "../constants/chain-config";

const FACTOR_1E8 = new BigDecimal("1e8");

function generateDivFactor(decimals: number): BigDecimal {
  return new BigDecimal("1" + "0".repeat(decimals));
}

export async function fetchUSDValue(
  context: any,
  chainId: number,
  assetName: string,
  assetAddress: string
): Promise<BigDecimal> {
  const config = CHAIN_CONFIG[chainId];
  if (!config) return new BigDecimal(0);

  const oracleId = getOracleAddress(chainId, assetName);
  if (oracleId) {
    const decimals = await context.effect(getTokenDecimals, `${chainId}:${assetAddress}`);
    const divFactor = generateDivFactor(decimals);

    // Chainlink oracle
    const priceStr = await context.effect(getChainlinkPrice, `${chainId}:${oracleId}`);
    if (priceStr) {
      return new BigDecimal(priceStr).div(divFactor).div(FACTOR_1E8);
    }
  }

  return new BigDecimal(0);
}

export async function fetchTokenUsdValue(
  context: any,
  chainId: number,
  srcTokenSymbol: string | null | undefined,
  srcTokenAddress: string | null | undefined,
  srcAmount: string | null | undefined,
  dstTokenSymbol: string | null | undefined,
  dstTokenAddress: string | null | undefined,
  dexAmountOut: string | null | undefined
): Promise<BigDecimal> {
  if (srcAmount && srcTokenSymbol && srcTokenAddress) {
    const price = await fetchUSDValue(context, chainId, srcTokenSymbol, srcTokenAddress);
    if (!price.isZero()) {
      return price.times(new BigDecimal(srcAmount));
    }
  }
  if (dexAmountOut && dstTokenSymbol && dstTokenAddress) {
    const price = await fetchUSDValue(context, chainId, dstTokenSymbol, dstTokenAddress);
    if (!price.isZero()) {
      return price.times(new BigDecimal(dexAmountOut));
    }
  }
  return new BigDecimal(0);
}
