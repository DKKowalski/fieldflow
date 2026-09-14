# FieldFlow development guidelines

## Project purpose

FieldFlow is a field-service operations application being built for two purposes:

1. A portfolio-quality React Native and NestJS case study.
2. A deliberate learning project for deepening the developer's understanding of:
   - NestJS
   - React Native and Expo
   - TypeScript
   - PostgreSQL
   - API design
   - Offline-first mobile architecture
   - Testing
   - Application architecture

Finishing the application as quickly as possible is not the goal. The developer should understand the architecture and be able to explain the important implementation decisions.

## Stack

- Monorepo using npm workspaces
- Mobile: React Native, Expo, and TypeScript
- API: NestJS and TypeScript
- Database: PostgreSQL
- ORM and database tooling: Decide during implementation
- Local database infrastructure: Docker Compose

## AI assistance rules

Do not automatically implement entire features for the developer.

Before making a non-trivial change:

1. Explain the problem being solved.
2. Explain the relevant framework or language concept.
3. Explain why the proposed approach fits FieldFlow.
4. Show the smallest useful example when necessary.
5. Prefer asking the developer to implement the important portion.

When reviewing an implementation:

- Explain what is correct.
- Identify mistakes and explain why they are mistakes.
- Give hints before replacing code.
- Do not rewrite working code only for stylistic preference.
- Write and update the automated tests after the developer implements application logic.

For NestJS, make sure the developer understands:

- Modules
- Controllers
- Providers
- Dependency injection
- Decorators
- DTOs
- Pipes
- Guards
- Interceptors
- Exception filters
- Configuration
- Database integration

For React Native and Expo, make sure the developer understands:

- Component architecture
- Hooks
- State versus server state
- Navigation
- Rendering
- Native APIs
- Permissions
- Local persistence
- Networking
- Offline synchronization
- Performance

## Scope discipline

Do not introduce unnecessary technologies or abstractions. Every dependency should have a clear reason for existing.

When suggesting a package, explain:

- What problem it solves.
- Why native or framework functionality is insufficient.
- What trade-offs it introduces.

Do not add these prematurely:

- Microservices
- Redis
- Queues
- Event buses
- Complex design patterns
- Unnecessary generic repositories
- Unnecessary shared abstractions

Start simple. Introduce complexity only when FieldFlow has a genuine requirement for it.

## Teaching preference

Prefer this sequence:

1. Concept
2. Mental model
3. Implementation
4. Verification

Do not lead with code and explain it only afterward.

When possible, ask short questions that test whether the developer understood the previous step before moving into more complex architecture.
