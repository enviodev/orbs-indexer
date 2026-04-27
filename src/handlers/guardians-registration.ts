import { indexer } from "generated";

indexer.onEvent({ contract: "GuardiansRegistration", event: "ContractRegistryAddressUpdated" }, async ({ event, context }) => {
  context.ContractRegistryAddressUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    addr: event.params.addr,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "GuardianDataUpdated" }, async ({ event, context }) => {
  context.GuardianDataUpdated.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    isRegistered: event.params.isRegistered,
    ip: event.params.ip,
    orbsAddr: event.params.orbsAddr,
    name: event.params.name,
    website: event.params.website,
    registrationTime: event.params.registrationTime,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "GuardianMetadataChanged" }, async ({ event, context }) => {
  context.GuardianMetadataChanged.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    key: event.params.key,
    newValue: event.params.newValue,
    oldValue: event.params.oldValue,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "GuardianRegistered" }, async ({ event, context }) => {
  context.GuardianRegistered.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "GuardianUnregistered" }, async ({ event, context }) => {
  context.GuardianUnregistered.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    guardian: event.params.guardian,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "InitializationComplete" }, async ({ event, context }) => {
  context.InitializationComplete.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "Locked" }, async ({ event, context }) => {
  context.Locked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "RegistryManagementTransferred" }, async ({ event, context }) => {
  context.RegistryManagementTransferred.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    previousRegistryAdmin: event.params.previousRegistryAdmin,
    newRegistryAdmin: event.params.newRegistryAdmin,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});

indexer.onEvent({ contract: "GuardiansRegistration", event: "Unlocked" }, async ({ event, context }) => {
  context.Unlocked.set({
    id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  });
});
