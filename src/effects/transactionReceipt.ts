import { createEffect, S } from "envio";
import { createPublicClient, http, keccak256, toBytes } from "viem";
import { polygon, mainnet } from "viem/chains";

function getViemChain(chainId: number) {
  if (chainId === 137) return polygon;
  if (chainId === 1) return mainnet;
  return mainnet;
}

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();
function getClient(chainId: number) {
  if (!clientCache.has(chainId)) {
    const rpcUrl = process.env[`ENVIO_RPC_URL_${chainId}`] || "";
    if (!rpcUrl) return null;
    clientCache.set(chainId, createPublicClient({ chain: getViemChain(chainId), transport: http(rpcUrl) }));
  }
  return clientCache.get(chainId)!;
}

const TRANSFER_TOPIC = keccak256(toBytes("Transfer(address,address,uint256)"));

export interface TransferLog {
  from: string;
  to: string;
  amount: string; // Use string to avoid bigint serialization
  tokenAddress: string;
}

// Input: "chainId:txHash"
export const getTransferLogs = createEffect(
  {
    name: "getTransferLogs",
    input: S.string,
    output: S.string, // JSON-stringified TransferLog[]
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const [chainIdStr, txHash] = input.split(":");
    const chainId = Number(chainIdStr);
    const client = getClient(chainId);
    if (!client) return "[]";
    try {
      const receipt = await client.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
      const transfers: TransferLog[] = [];
      for (const log of receipt.logs) {
        if (log.topics[0] === TRANSFER_TOPIC && log.topics.length >= 3) {
          const from = "0x" + (log.topics[1] as string).slice(26);
          const to = "0x" + (log.topics[2] as string).slice(26);
          const amount = log.data ? BigInt(log.data).toString() : "0";
          transfers.push({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            amount,
            tokenAddress: log.address.toLowerCase(),
          });
        }
      }
      return JSON.stringify(transfers);
    } catch {
      return "[]";
    }
  }
);

// Helper to parse the result
export function parseTransferLogs(result: string): TransferLog[] {
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}
