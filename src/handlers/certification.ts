import { Certification } from "generated";

Certification.ContractRegistryAddressUpdated.handler(async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Certification.GuardianCertificationUpdate.handler(async ({ event, context }) => {
  context.GuardianCertificationUpdate.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    guardian: event.params.guardian,
    isCertified: event.params.isCertified,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Certification.InitializationComplete.handler(async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Certification.Locked.handler(async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

Certification.RegistryManagementTransferred.handler(async ({ event, context }) => {
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

Certification.Unlocked.handler(async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    chainId: event.chainId,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
