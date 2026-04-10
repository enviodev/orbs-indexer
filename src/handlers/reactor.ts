import { Reactor, BigDecimal } from "generated";
import { CHAIN_CONFIG, SWAP_TOTAL_ID } from "../constants/chain-config";
import { formatTimestamp } from "../utils/helpers";
import { getTokenSymbol } from "../effects/tokenMetadata";
import { getTransferLogs, parseTransferLogs } from "../effects/transactionReceipt";
import { fetchTokenUsdValue } from "../utils/pricing";

Reactor.Fill.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const chainPrefix = `${chainId}-`;
  const id = `${chainId}_${event.transaction.hash}_${event.logIndex}`;
  const txId = chainPrefix + event.transaction.hash;

  context.Fill.set({
    id,
    orderHash: event.params.orderHash,
    filler: event.params.filler,
    swapper: event.params.swapper,
    nonce: event.params.nonce,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });

  const timestamp = formatTimestamp(event.block.timestamp);
  const userAddress = event.params.swapper.toLowerCase();
  const executorAddress = event.params.filler.toLowerCase();
  const config = CHAIN_CONFIG[chainId];

  const transfersJson = await context.effect(getTransferLogs, `${chainId}:${event.transaction.hash}`);
  const transfers = parseTransferLogs(transfersJson);

  let srcAmount: string | undefined;
  let srcTokenAddress: string | undefined;
  let srcTokenSymbol: string | undefined;
  let dstTokenAddress: string | undefined;
  let dstTokenSymbol: string | undefined;
  let dexAmountOut = 0n;
  let fees: string | undefined;
  let gasFees: string | undefined;

  const feesAddress = config?.lhFeesAddress?.toLowerCase() || "";
  const treasuryAddress = config?.treasuryAddress?.toLowerCase() || "";
  const treasuryAddressNew = config?.treasuryAddressNew?.toLowerCase() || "";

  for (const transfer of transfers) {
    if (!srcAmount && transfer.from === userAddress && transfer.to === executorAddress) {
      srcAmount = transfer.amount;
      srcTokenAddress = transfer.tokenAddress;
      srcTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${srcTokenAddress}`);
    } else if (transfer.from === executorAddress && transfer.to === userAddress) {
      dexAmountOut += BigInt(transfer.amount);
      if (!dstTokenAddress) {
        dstTokenAddress = transfer.tokenAddress;
        dstTokenSymbol = await context.effect(getTokenSymbol, `${chainId}:${dstTokenAddress}`);
      }
    } else if (transfer.to === feesAddress && dstTokenAddress && transfer.tokenAddress === dstTokenAddress) {
      fees = transfer.amount;
    } else if (!gasFees && (transfer.to === treasuryAddress || transfer.to === treasuryAddressNew) && dstTokenAddress && transfer.tokenAddress === dstTokenAddress) {
      gasFees = transfer.amount;
    }
  }

  const dollarValue = await fetchTokenUsdValue(
    context, chainId,
    srcTokenSymbol, srcTokenAddress, srcAmount,
    dstTokenSymbol, dstTokenAddress, dexAmountOut > 0n ? dexAmountOut.toString() : undefined
  );

  context.Swap.set({
    id: txId,
    userAddress,
    srcTokenSymbol,
    srcTokenAddress,
    srcAmount,
    dstTokenSymbol,
    dollarValue,
    dstTokenAddress,
    dexAmountOut: dexAmountOut.toString(),
    executorAddress,
    timestamp,
    txHash: event.transaction.hash,
    fees,
    gasFees,
  });

  // Daily aggregation
  const day = timestamp.slice(0, 10);
  const dayKey = chainPrefix + day;
  let daily = await context.SwapDaily.get(dayKey);
  if (!daily) {
    context.SwapDaily.set({ id: dayKey, date: day, dailyTotalCalculatedValue: dollarValue, dailyCount: 1 });
  } else {
    context.SwapDaily.set({
      ...daily,
      dailyTotalCalculatedValue: daily.dailyTotalCalculatedValue.plus(dollarValue),
      dailyCount: (daily.dailyCount || 0) + 1,
    });
  }

  const totalKey = chainPrefix + SWAP_TOTAL_ID;
  let total = await context.SwapTotal.get(totalKey);
  if (!total) {
    context.SwapTotal.set({ id: totalKey, cumulativeTotalCalculatedValue: dollarValue, totalCount: 1 });
  } else {
    context.SwapTotal.set({
      ...total,
      cumulativeTotalCalculatedValue: total.cumulativeTotalCalculatedValue.plus(dollarValue),
      totalCount: (total.totalCount || 0) + 1,
    });
  }
});
