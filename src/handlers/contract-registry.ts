import { indexer } from "generated";

indexer.onEvent({ contract: "OrbsContractRegistry", event: "ContractAddressUpdated" }, async ({ event, context }) => {
  context.ContractAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    contractName: event.params.contractName,
    addr: event.params.addr,
    managedContract: event.params.managedContract,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsContractRegistry", event: "ContractRegistryUpdated" }, async ({ event, context }) => {
  context.ContractRegistryUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    newContractRegistry: event.params.newContractRegistry,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "OrbsContractRegistry", event: "ManagerChanged" }, async ({ event, context }) => {
  context.ManagerChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    role: event.params.role,
    newManager: event.params.newManager,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
