import { Committee } from "generated";

Committee.CommitteeChange.handler(async ({ event, context }) => {
  context.CommitteeChange.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    weight: event.params.weight,
    certification: event.params.certification,
    inCommittee: event.params.inCommittee,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.ContractRegistryAddressUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.InitializationComplete.handler(async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.Locked.handler(async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.MaxCommitteeSizeChanged.handler(async ({ event, context }) => {
  context.MaxCommitteeSizeChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newValue: Number(event.params.newValue),
    oldValue: Number(event.params.oldValue),
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.RegistryManagementTransferred.handler(async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Committee.Unlocked.handler(async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
