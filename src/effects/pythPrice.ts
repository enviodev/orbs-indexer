import { createEffect, S } from "envio";
import { createPublicClient, http, parseAbi, defineChain } from "viem";

// Pyth IPyth interface — getPrice and getPriceUnsafe both return PriceFeed.Price.
// We try getPrice first (subject to staleness check), then fall back to getPriceUnsafe.
const PYTH_ABI = parseAbi([
  "function getPrice(bytes32 id) view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)",
  "function getPriceUnsafe(bytes32 id) view returns (int64 price, uint64 conf, int32 expo, uint256 publishTime)",
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

// Input: "chainId:pythAddress:feedId:blockNumber"
// Output: "<price>|<expo>" e.g. "5234567890|-8" — empty string on failure.
export const getPythPrice = createEffect(
  {
    name: "getPythPrice",
    input: S.string,
    output: S.string,
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const parts = input.split(":");
    const chainId = Number(parts[0]);
    const pythAddress = parts[1];
    const feedId = parts[2];
    const blockNumber = parts[3] ? BigInt(parts[3]) : undefined;
    const client = getClient(chainId);
    if (!client) return "";

    const tryRead = async (functionName: "getPrice" | "getPriceUnsafe") => {
      return await client.readContract({
        address: pythAddress as `0x${string}`,
        abi: PYTH_ABI,
        functionName,
        args: [feedId as `0x${string}`],
        blockNumber,
      });
    };

    let result: readonly [bigint, bigint, number, bigint];
    try {
      result = await tryRead("getPrice");
    } catch {
      try {
        result = await tryRead("getPriceUnsafe");
      } catch {
        return "";
      }
    }
    const [price, , expo] = result;
    return `${price.toString()}|${expo.toString()}`;
  }
);
