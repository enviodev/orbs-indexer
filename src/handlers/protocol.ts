import { indexer } from "generated";

indexer.onEvent({ contract: "Protocol", event: "ContractRegistryAddressUpdated" }, async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Protocol", event: "InitializationComplete" }, async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Protocol", event: "Locked" }, async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Protocol", event: "ProtocolVersionChanged" }, async ({ event, context }) => {
  context.ProtocolVersionChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    deploymentSubset: event.params.deploymentSubset,
    currentVersion: event.params.currentVersion,
    nextVersion: event.params.nextVersion,
    fromTimestamp: event.params.fromTimestamp,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Protocol", event: "RegistryManagementTransferred" }, async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "Protocol", event: "Unlocked" }, async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
