# Desafio Fullstack Integrado

Solução do desafio fullstack: EJB + Spring Boot + Angular, com correção de bug em transferência financeira concorrente.

## Demo

- **Frontend:** https://bip-teste-integrado.surge.sh
- **API:** https://bip-teste-integrado.fly.dev
- **Swagger UI:** https://bip-teste-integrado.fly.dev/swagger-ui.html
- **Health:** https://bip-teste-integrado.fly.dev/actuator/health

A especificação original do desafio está em [`docs/README.md`](docs/README.md). O contrato OpenAPI versionado em [`docs/openapi.yaml`](docs/openapi.yaml) pode ser importado em Postman/Insomnia ou usado para gerar clientes.

## Stack

**Backend**
- Java 17, Spring Boot 3.2.5
- Jakarta EE (`@Stateless`, `@PersistenceContext`) consumido como bean Spring
- Spring Data JPA, Hibernate 6, Bean Validation
- H2 em memória (todos os profiles)
- springdoc-openapi (Swagger UI)
- JUnit 5, Mockito, AssertJ

**Frontend**
- Angular 21 (standalone components, signals, control flow)
- Tailwind CSS v4
- ngx-mask (máscara de moeda BR)
- Vitest

**Infra**
- Backend em Fly.io (Dockerfile multi-stage)
- Frontend em Surge.sh
- CI no GitHub Actions

## Rodar local

Pré-requisitos: JDK 17, Maven 3.8+, Node 20.19+ (ou 22 LTS / 24).

**Backend** (na primeira vez precisa instalar o `ejb-module` no repositório local):

```bash
mvn install -DskipTests
mvn -pl backend-module spring-boot:run
```

API em `http://localhost:8080`, Swagger em `http://localhost:8080/swagger-ui.html`, console H2 em `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:bipdb`, user `sa`, senha vazia).

**Frontend:**

```bash
cd frontend
npm ci
npm start
```

App em `http://localhost:4200`. A URL da API vem de [`src/environments/environment.ts`](frontend/src/environments/environment.ts) (default `http://localhost:8080`) e o backend já libera CORS para `localhost:4200`.

## Rodar testes

```bash
mvn test                          # backend (EJB + REST)
cd frontend && npm test           # frontend
```

Cobertura:

| Módulo | Testes | O que cobre |
|---|---|---|
| `ejb-module` | 9 | unidade do `transfer` (caminho feliz, saldo insuficiente, valor inválido em 5 variações, origem == destino) + integração de concorrência (10 threads simultâneas provando que o lock pessimista impede *lost update*) |
| `backend-module` | 15 | controllers via `@WebMvcTest` — CRUD de benefícios + endpoint de transferência, incluindo erros mapeados para Problem Details |
| `frontend` | 40 | services de API com `HttpTestingController`, formulário de benefício, página de transferência, simulação, loading/notification |

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/beneficios` | lista paginada (`?page=&size=&ativo=`) |
| `GET` | `/api/v1/beneficios/{id}` | detalhe |
| `POST` | `/api/v1/beneficios` | criar |
| `PUT` | `/api/v1/beneficios/{id}` | atualizar |
| `DELETE` | `/api/v1/beneficios/{id}` | desativar (soft delete) |
| `POST` | `/api/v1/transferencias` | transferir saldo entre dois benefícios ativos |
| `GET` | `/actuator/health` | health check |
| `GET` | `/swagger-ui.html` | documentação interativa |

Erros retornam [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807). Códigos:
- `400` validação (`MethodArgumentNotValidException`)
- `404` benefício inexistente
- `409` `OptimisticLockException`
- `422` regras de domínio (saldo insuficiente, benefício inativo, transferência inválida)

## Estrutura

```
.
├── pom.xml                       POM agregador multi-módulo
├── ejb-module/                   domínio (EJB + JPA)
│   └── src/main/java/com/example/ejb/
│       ├── domain/               entidade Beneficio (com @Version)
│       ├── service/              BeneficioEjbService (transfer com lock)
│       └── exception/            exceções de domínio
├── backend-module/               API REST Spring Boot
│   ├── Dockerfile                multi-stage para Fly.io
│   ├── entrypoint.sh             converte DATABASE_URL (Heroku-style) em SPRING_DATASOURCE_*
│   └── src/main/java/com/example/backend/
│       ├── config/               CORS, OpenAPI
│       ├── controller/           BeneficioController, TransferenciaController
│       ├── dto/                  request/response (entidade nunca exposta)
│       ├── exception/            GlobalExceptionHandler (Problem Details)
│       ├── repository/           Spring Data JPA
│       └── service/              orquestração (delega ao EJB)
├── frontend/                     Angular 21
│   └── src/app/
│       ├── core/                 services de API, interceptors, loading, notification
│       ├── features/             beneficios (list, form), transferencias (transferir)
│       └── shared/ui/            componentes reusáveis (picker, simulação)
├── fly.toml                      config do deploy
└── docs/                         brief original + OpenAPI
```

## Bug do EJB

O `BeneficioEjbService.transfer` original não validava nada e podia gerar *lost update* sob concorrência. A correção em [`ejb-module/src/main/java/com/example/ejb/service/BeneficioEjbService.java`](ejb-module/src/main/java/com/example/ejb/service/BeneficioEjbService.java) cobre:

- validação de entrada (`fromId`, `toId`, `amount > 0`, `from != to`)
- carregamento com `LockModeType.PESSIMISTIC_WRITE` em ordem crescente de ID (evita deadlock entre threads cruzadas)
- validação de benefício ativo e saldo suficiente
- `@Transactional(rollbackFor = Exception.class)` para garantir rollback em checked exceptions
- `@Version` na entidade como defesa em profundidade

O teste de concorrência em [`BeneficioEjbServiceConcurrencyTest`](ejb-module/src/test/java/com/example/ejb/service/BeneficioEjbServiceConcurrencyTest.java) dispara 10 threads em paralelo via `CountDownLatch` e valida que a soma final é exatamente igual à inicial — prova que o lock funciona.

## Decisões arquiteturais

**EJB consumido como bean Spring.** O `ejb-module` mantém a anotação `@Stateless` e o contrato Jakarta EE, mas é injetado como bean Spring com `@Transactional` em vez de rodar num container (WildFly/Payara). Decisão pragmática para o escopo: preserva a separação em camadas e o vocabulário Jakarta sem o overhead de um servidor de aplicação.

**H2 em todos os profiles.** Para a demo ao vivo, o backend usa H2 em memória. Mantém paridade entre dev/test/prod e elimina a dependência de banco gerenciado para um avaliador rodar localmente. O contrato JPA é o mesmo para qualquer dialeto — trocar para Postgres é mudar `application.yml` e ajustar a connection string.

**DTOs nas fronteiras.** A entidade `Beneficio` nunca cruza o limite do controller. Request/response têm classes próprias e o mapeamento é explícito.

**Problem Details.** Erros HTTP seguem RFC 7807, com tipos e títulos consistentes. O `error.interceptor.ts` no frontend extrai `detail` e exibe via snackbar.
