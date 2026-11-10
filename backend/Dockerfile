# Multi-stage Docker build for MoveSmart Spring Boot REST API
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper & POM
COPY pom.xml .
COPY src ./src

# Package backend application (skip tests in docker build for speed)
RUN apk add --no-cache maven && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Non-root security user
RUN addgroup -S movesmart && adduser -S movesmart -G movesmart
USER movesmart:movesmart

# Copy compiled jar
COPY --from=builder /build/target/*.jar app.jar

# Environment defaults
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV JWT_SECRET=MoveSmartProductionJwtSecretKeyMustBeAtLeast32BytesLongForSecurity2026!

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
