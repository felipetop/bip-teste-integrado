# Desafio Sicoob — Fullstack Integrado

Solução do desafio técnico de fullstack proposto pela BIP. Stack em camadas com EJB + Spring Boot + Angular consumindo H2 (dev/test) e Postgres (prod).

A especificação original do desafio está em [`docs/README.md`](docs/README.md). O contrato OpenAPI da API está versionado em [`docs/openapi.yaml`](docs/openapi.yaml) e pode ser importado em ferramentas como Postman, Insomnia ou usado para gerar clientes (TypeScript, etc.).

## Stack

- Java 17
- Spring Boot 3.2.5 (REST + Data JPA + Validation + Actuator)
- Jakarta EE (`@Stateless`, `@PersistenceContext`)
- Hibernate 6
- H2 (dev/test) — em memória
- PostgreSQL (prod)
- springdoc-openapi (Swagger UI)
- JUnit 5, Mockito, AssertJ
- Angular (pendente)

## Pré-requisitos

- JDK 17+
- Maven 3.8+

Não precisa de Postgres nem Docker para rodar local — o backend usa H2 em memória no profile `dev` (default).

## Rodar local

Como o projeto é multi-módulo, na primeira vez precisa instalar o `ejb-module` no repositório local antes de subir o backend:

```bash
mvn install -DskipTests
mvn -pl backend-module spring-boot:run
```

A aplicação sobe em `http://localhost:8080`.

## Endpoints disponíveis

| URL | O que faz |
|---|---|
| `GET /api/v1/beneficios` | (mock — será substituído pelo CRUD real) |
| `GET /actuator/health` | Health check |
| `GET /swagger-ui.html` | Swagger UI |
| `GET /v3/api-docs` | OpenAPI JSON |
| `GET /v3/api-docs.yaml` | OpenAPI YAML |
| `GET /h2-console` | Console do H2 — JDBC URL `jdbc:h2:mem:bipdb`, user `sa`, senha vazia |

## Rodar testes

```bash
mvn test
```

Cobertura atual no `ejb-module`:
- 4 cenários de unidade do `BeneficioEjbService.transfer` (caminho feliz, saldo insuficiente, valor inválido com 5 variações, origem == destino)
- 1 teste de integração de concorrência (10 threads transferindo simultaneamente, prova que o lock pessimista impede lost update)

Total: **9 testes passando**.

## Estrutura

```
.
├── pom.xml                   POM agregador multi-módulo
├── ejb-module/               lógica de domínio (EJB + JPA)
│   └── src/main/java/com/example/ejb/
│       ├── domain/           entidade Beneficio
│       ├── service/          BeneficioEjbService (transfer com lock)
│       └── exception/        exceções de domínio
├── backend-module/           API REST Spring Boot
│   └── src/main/java/com/example/backend/
│       ├── BackendApplication.java
│       └── controller/       BeneficioController
├── frontend/                 Angular (placeholder)
├── db/                       schema/seed originais do template
└── docs/README.md            especificação original do desafio
```

## Banco

| Profile | Banco | Quando |
|---|---|---|
| `dev` (default) | H2 em memória | desenvolvimento local |
| `test` | H2 em memória | execução dos testes |
| `prod` | PostgreSQL via `DATABASE_URL` | deploy |

O profile é selecionado pela env var `SPRING_PROFILES_ACTIVE` ou pelo default em `application.yml`.

## Bug do EJB

O desafio pediu correção do `BeneficioEjbService.transfer`, que originalmente:
- não validava saldo
- não usava locking
- podia gerar inconsistência por lost update

A correção está em [`ejb-module/src/main/java/com/example/ejb/service/BeneficioEjbService.java`](ejb-module/src/main/java/com/example/ejb/service/BeneficioEjbService.java) e cobre:
- validação de entrada (`fromId`, `toId`, `amount`)
- lock pessimista via `LockModeType.PESSIMISTIC_WRITE` (com aquisição em ordem de ID para evitar deadlock)
- validação de benefício ativo e saldo suficiente
- `@Transactional(rollbackFor = Exception.class)` garantindo rollback inclusive em checked exceptions

A entidade mantém também `@Version` como defesa em profundidade (optimistic locking).

## Decisão sobre integração EJB

O `ejb-module` tem a classe anotada `@Stateless` (contrato Jakarta EE), mas é consumida como bean Spring com `@Transactional` em vez de rodar num container EJB tradicional (WildFly/Payara). Decisão pragmática para o escopo do desafio: mantém a separação de camadas e o contrato Jakarta, sem o overhead de subir um container completo.

## Status

- [x] Estrutura multi-módulo Maven
- [x] Entidade `Beneficio` + perfis dev/test/prod
- [x] Correção do bug do `transfer` com testes
- [x] Teste de concorrência (lost update)
- [ ] CRUD real no backend (`Repository`, `Service`, `Controller` reescrito, DTOs, GlobalExceptionHandler)
- [ ] Frontend Angular consumindo a API
- [ ] Deploy (Fly.io + Cloudflare Pages)
