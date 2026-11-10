# Multi-stage Docker build for MoveSmart Spring Boot REST API

FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root security user and prepare upload storage directory
RUN addgroup -S movesmart && adduser -S movesmart -G movesmart \
    && mkdir -p /app/uploads \
    && chown -R movesmart:movesmart /app

# Copy compiled JAR
COPY --from=builder --chown=movesmart:movesmart /build/target/*.jar app.jar

# Runtime configuration
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

USER movesmart:movesmart

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT:-8080}"]
