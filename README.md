# Orbs Indexer

A multichain Orbs Protocol indexer built with [Envio HyperIndex](https://docs.envio.dev). Tracks delegations, the guardian committee, elections, governance, the Orbs subscription system, TWAP execution, and the Liquidity Hub across 14 chains.

## Chains (14)

`1`, `14`, `56`, `137`, `146`, `250`, `1101`, `1329`, `8453`, `42161`, `43114`, `59144`, `80094`, `81457`

## What it indexes

### Core registries and protocol
- `OrbsContractRegistry`, `Protocol`: registry address updates, lock/unlock, registry management
- `Certification`, `GuardiansRegistration`: guardian status, certifications

### Delegations and committee
- `Delegations`: delegator-to-guardian delegations, stake changes, delegation initialisation
- `Committee`: committee changes, max-size updates, manager changes
- `Elections`: guardian status, voting unready/out, min self-stake, stake changes

### Subscriptions
- `OrbsSubscriptions`: Orbs subscription lifecycle

### TWAP and Liquidity Hub
- `Reactor`, `TwapContract`: TWAP execution and Liquidity Hub events
- `ExecutorV5`, `ExecutorV6`: executor versions

## Schema

63 GraphQL entities including `Delegator`, `DelegatorMap`, `DelegateActions`, `DelegationStakes`, `GuardianInfo`, `GuardianToDelegators`, `DelegatorToGuardian`, `CommitteeChange`, `StakeChanged`, plus event-level entities.

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
