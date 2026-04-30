import { OrbsContractRegistry } from "generated";

OrbsContractRegistry.ContractAddressUpdated.handler(async ({ event, context }) => {
  context.ContractAddressUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    contractName: event.params.contractName,
    addr: event.params.addr,
    managedContract: event.params.managedContract,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsContractRegistry.ContractRegistryUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    newContractRegistry: event.params.newContractRegistry,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

OrbsContractRegistry.ManagerChanged.handler(async ({ event, context }) => {
  context.ManagerChanged.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    role: event.params.role,
    newManager: event.params.newManager,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
