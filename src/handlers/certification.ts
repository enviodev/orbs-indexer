import { indexer } from "generated";

indexer.onEvent(
  { contract: "Certification", event: "ContractRegistryAddressUpdated" },
  async ({ event, context }) => {
    context.ContractRegistryAddressUpdated.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      addr: event.params.addr,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);

indexer.onEvent(
  { contract: "Certification", event: "GuardianCertificationUpdate" },
  async ({ event, context }) => {
    context.GuardianCertificationUpdate.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      guardian: event.params.guardian,
      isCertified: event.params.isCertified,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);

indexer.onEvent(
  { contract: "Certification", event: "InitializationComplete" },
  async ({ event, context }) => {
    context.InitializationComplete.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);

indexer.onEvent(
  { contract: "Certification", event: "Locked" },
  async ({ event, context }) => {
    context.Locked.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);

indexer.onEvent(
  { contract: "Certification", event: "RegistryManagementTransferred" },
  async ({ event, context }) => {
    context.RegistryManagementTransferred.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      previousRegistryAdmin: event.params.previousRegistryAdmin,
      newRegistryAdmin: event.params.newRegistryAdmin,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);

indexer.onEvent(
  { contract: "Certification", event: "Unlocked" },
  async ({ event, context }) => {
    context.Unlocked.set({
      id: `${event.chainId}_${event.transaction.hash}_${event.logIndex}`,
      blockNumber: BigInt(event.block.number),
      blockTimestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    });
  },
);
