# Orbs Indexer

Orbs Protocol Indexer (Delegations, Committee, TWAP, Liquidity Hub). Built with [Envio HyperIndex](https://docs.envio.dev).

## Chains

| Network | Chain ID |
|---|---|
| Polygon | 137 |
| Ethereum Mainnet | 1 |
| Arbitrum | 42161 |
| Bsc | 56 |
| Base | 8453 |
| Fantom | 250 |
| Linea | 59144 |
| Sonic | 146 |
| Sei* | 1329 |
| Avalanche | 43114 |
| Blast | 81457 |
| Polygon zkEVM | 1101 |
| Berachain | 80094 |
| Flare | 14 |

## Contracts

- **`Delegations`**: `ContractRegistryAddressUpdated`, `Delegated`, `DelegatedStakeChanged`, `DelegationInitialized`, `InitializationComplete`, `Locked`, `RegistryManagementTransferred`, `Unlocked`
- **`Committee`**: `CommitteeChange`, `ContractRegistryAddressUpdated`, `InitializationComplete`, `Locked`, `MaxCommitteeSizeChanged`, `RegistryManagementTransferred`, `Unlocked`
- **`OrbsContractRegistry`**: `ContractAddressUpdated`, `ContractRegistryUpdated`, `ManagerChanged`
- **`Elections`**: `ContractRegistryAddressUpdated`, `GuardianStatusUpdated`, `GuardianVotedOut`, `GuardianVotedUnready`, `InitializationComplete`, `Locked`, `MinSelfStakePercentMilleChanged`, `RegistryManagementTransferred`, `StakeChanged`, `Unlocked`, `VoteOutCasted`, `VoteOutPercentMilleThresholdChanged`, `VoteUnreadyCasted`, `VoteUnreadyPercentMilleThresholdChanged`, `VoteUnreadyTimeoutSecondsChanged`
- **`OrbsSubscriptions`**: `ContractRegistryAddressUpdated`, `GenesisRefTimeDelayChanged`, `InitializationComplete`, `Locked`, `MinimumInitialVcPaymentChanged`, `Payment`, `RegistryManagementTransferred`, `SubscriberAdded`, `SubscriberRemoved`, `SubscriptionChanged`, `Unlocked`, `VcConfigRecordChanged`, `VcCreated`, `VcOwnerChanged`
- **`Protocol`**: `ContractRegistryAddressUpdated`, `InitializationComplete`, `Locked`, `ProtocolVersionChanged`, `RegistryManagementTransferred`, `Unlocked`
- **`GuardiansRegistration`**: `ContractRegistryAddressUpdated`, `GuardianDataUpdated`, `GuardianMetadataChanged`, `GuardianRegistered`, `GuardianUnregistered`, `InitializationComplete`, `Locked`, `RegistryManagementTransferred`, `Unlocked`
- **`Certification`**: `ContractRegistryAddressUpdated`, `GuardianCertificationUpdate`, `InitializationComplete`, `Locked`, `RegistryManagementTransferred`, `Unlocked`
- **`TwapContract`**: `OrderFilled`, `OrderCreated`, `OrderCanceled`, `OrderCompleted`
- **`Reactor`**: `Fill`
- **`ExecutorV5`**: `Resolved`, `Surplus`
- **`ExecutorV6`**: `ExtraOut`, `ResolvedV6`, `SurplusV6`

## Schema entities (63)

`ContractRegistryAddressUpdated`, `InitializationComplete`, `Locked`, `RegistryManagementTransferred`, `Unlocked`, `Delegated`, `DelegatedStakeChanged`, `DelegationInitialized`, `Delegator`, `DelegatorMap`, `DelegateActions`, `DelegationStakes`, `GuardianInfo`, `GuardianToDelegators`, `DelegatorToGuardian`, `CommitteeChange`, `MaxCommitteeSizeChanged`, `ContractAddressUpdated`, `ContractRegistryUpdated`, `ManagerChanged`, `GuardianStatusUpdated`, `GuardianVotedOut`, `GuardianVotedUnready`, `MinSelfStakePercentMilleChanged`, `StakeChanged`, `VoteOutCasted`, `VoteOutPercentMilleThresholdChanged`, `VoteUnreadyCasted`, `VoteUnreadyPercentMilleThresholdChanged`, `VoteUnreadyTimeoutSecondsChanged`, `GenesisRefTimeDelayChanged`, `MinimumInitialVcPaymentChanged`, `Payment`, `SubscriberAdded`, `SubscriberRemoved`, `SubscriptionChanged`, `VcConfigRecordChanged`, `VcCreated`, `VcOwnerChanged`, `ProtocolVersionChanged`, `GuardianDataUpdated`, `GuardianMetadataChanged`, `GuardianRegistered`, `GuardianUnregistered`, `GuardianCertificationUpdate`, `OrderFilled`, `FilledDaily`, `FilledTotal`, `DailyActiveUsers`, `OrderCreated`, `CreatedDaily`, `CreatedTotal`, `Status`, `StatusNew`, `TwapOutputTokens`, `Fill`, `Swap`, `SwapDaily`, `SwapTotal`, `Resolved`, `Surplus`, `ExtraOut`, `LhOutputTokens`

## Run locally

```bash
pnpm install
pnpm dev
```

GraphQL playground at [http://localhost:8080](http://localhost:8080) (local password: `testing`).

## Generate from `config.yaml` or `schema.graphql`

```bash
pnpm codegen
```

## Pre-requisites

- [Node.js v22+ (v24 recommended)](https://nodejs.org/en/download/current)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/)

## Resources

- [Envio docs](https://docs.envio.dev)
- [HyperIndex overview](https://docs.envio.dev/docs/HyperIndex/overview)
- [Discord](https://discord.gg/envio)
