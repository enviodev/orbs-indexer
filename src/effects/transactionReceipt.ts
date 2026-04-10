import { createEffect, S } from "envio";
import { HypersyncClient, JoinMode } from "@envio-dev/hypersync-client";

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const clientCache = new Map<number, HypersyncClient>();
function getHypersyncClient(chainId: number): HypersyncClient {
  if (!clientCache.has(chainId)) {
    clientCache.set(
      chainId,
      new HypersyncClient({
        url: `https://${chainId}.hypersync.xyz`,
        apiToken: process.env.ENVIO_API_TOKEN || "",
      })
    );
  }
  return clientCache.get(chainId)!;
}

export interface TransferLog {
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
}

// Input: "chainId:blockNumber:txHash"
export const getTransferLogs = createEffect(
  {
    name: "getTransferLogs",
    input: S.string,
    output: S.string, // JSON-stringified TransferLog[]
    cache: true,
    rateLimit: false,
  },
  async ({ input }) => {
    const parts = input.split(":");
    const chainId = Number(parts[0]);
    const blockNumber = Number(parts[1]);
    const txHash = parts[2] || "";

    const client = getHypersyncClient(chainId);
    try {
      const res = await client.get({
        fromBlock: blockNumber,
        toBlock: blockNumber + 1,
        logs: [
          {
            topics: [[TRANSFER_TOPIC]],
          },
        ],
        transactions: [
          {
            hash: [txHash],
          },
        ],
        fieldSelection: {
          log: [
            "Address",
            "Data",
            "Topic0",
            "Topic1",
            "Topic2",
            "Topic3",
            "TransactionHash",
          ],
        },
        joinMode: JoinMode.JoinAll,
      });

      const transfers: TransferLog[] = [];
      for (const log of res.data.logs) {
        if (
          log.topics[0] === TRANSFER_TOPIC &&
          log.transactionHash?.toLowerCase() === txHash.toLowerCase() &&
          log.topics.length >= 3 &&
          log.topics[1] &&
          log.topics[2]
        ) {
          const from = "0x" + log.topics[1]!.slice(26);
          const to = "0x" + log.topics[2]!.slice(26);
          const amount = log.data ? BigInt(log.data).toString() : "0";
          transfers.push({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            amount,
            tokenAddress: (log.address || "").toLowerCase(),
          });
        }
      }
      return JSON.stringify(transfers);
    } catch {
      return "[]";
    }
  }
);

export function parseTransferLogs(result: string): TransferLog[] {
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}
