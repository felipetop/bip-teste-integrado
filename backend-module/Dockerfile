# --- Build stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copia POMs primeiro pra aproveitar cache de dependências
COPY pom.xml ./
COPY ejb-module/pom.xml ejb-module/
COPY backend-module/pom.xml backend-module/

# Pre-fetch deps (best-effort, se falhar segue adiante)
RUN mvn -pl backend-module -am dependency:go-offline -B || true

# Agora copia o código e empacota
COPY ejb-module/src ejb-module/src
COPY backend-module/src backend-module/src
RUN mvn -pl backend-module -am package -DskipTests -B

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copia o jar do build stage
COPY --from=build /workspace/backend-module/target/backend-module-*.jar app.jar

# Script que converte DATABASE_URL (postgres://) pra formato JDBC do Spring
COPY backend-module/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
