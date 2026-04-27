import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

// UniswapV2Pair / PancakePair share the same selectors for these — one ABI works for both.
const V2_PAIR_ABI = parseAbi([
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
]);

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();
function getClient(chainId: number) {
  if (!clientCache.has(chainId)) {
    const rpcUrl = process.env[`ENVIO_RPC_URL_${chainId}`] || "";
    if (!rpcUrl) return null;
    clientCache.set(chainId, createPublicClient({
      chain: defineChain({ id: chainId, name: `chain-${chainId}`, nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } }),
      transport: http(rpcUrl),
    }));
  }
  return clientCache.get(chainId)!;
}

// Input: "chainId:poolAddress:blockNumber"
// Output: "<token0>|<token1>|<reserve0>|<reserve1>" — empty string on failure.
export const getV2PoolReserves = createEffect(
  {
    name: "getV2PoolReserves",
    input: S.string,
    output: S.string,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const parts = input.split(":");
    const chainId = Number(parts[0]);
    const pool = parts[1] as `0x${string}`;
    const blockNumber = parts[2] ? BigInt(parts[2]) : undefined;
    const client = getClient(chainId);
    if (!client) return "";

    try {
      const [token0, token1, reserves] = await Promise.all([
        client.readContract({ address: pool, abi: V2_PAIR_ABI, functionName: "token0", blockNumber }),
        client.readContract({ address: pool, abi: V2_PAIR_ABI, functionName: "token1", blockNumber }),
        client.readContract({ address: pool, abi: V2_PAIR_ABI, functionName: "getReserves", blockNumber }),
      ]);
      const [r0, r1] = reserves;
      return `${token0.toLowerCase()}|${token1.toLowerCase()}|${r0.toString()}|${r1.toString()}`;
    } catch {
      return "";
    }
  }
);
