# API Gateway

A Spring Boot REST API gateway with JWT authentication, per-IP rate limiting, centralized exception handling, and full API documentation via Swagger. Built as a self-contained, containerized service with a CI pipeline.

## Why this exists

Most portfolio auth demos stop at "login returns a token." This project goes a step further and handles the concerns a real gateway actually needs to worry about:

- **Security** — stateless JWT auth, so no server-side session state to manage or scale
- **Abuse protection** — per-IP rate limiting using a token bucket algorithm, so a single client can't hammer the auth endpoints
- **Consistency** — every response, success or failure, comes back in the same `ApiResponse<T>` shape, so consumers never have to guess the response format
- **Observability** — every request is logged with method, path, status, and latency
- **Reliability** — unit and integration tests cover the auth flow end to end, and a CI pipeline runs them automatically on every push

## Tech stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 4.0.8 |
| Security | Spring Security + JJWT (JSON Web Tokens) |
| Rate limiting | Bucket4j (token bucket algorithm) |
| Database | H2 (in-memory) |
| ORM | Spring Data JPA / Hibernate |
| API docs | Springdoc OpenAPI (Swagger UI) |
| Testing | JUnit 5, MockMvc |
| Containerization | Docker (multi-stage build) |
| CI/CD | GitHub Actions |

## Architecture

Every request passes through the same pipeline before it reaches business logic:

```
Client request
      │
      ▼
RequestLoggingFilter   (logs method, path, latency)
      │
      ▼
JwtAuthFilter           (validates Bearer token → 401 if invalid)
      │
      ▼
RateLimitService         (20 requests/min per IP → 429 if exceeded)
      │
      ▼
Controller → Service → Repository → H2 database
      │
      ▼
GlobalExceptionHandler   (wraps every response in ApiResponse<T>)
```

## API endpoints

### `POST /api/auth/register`

Registers a new user.

**Query parameters:** `username`, `email`, `password`

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": null
}
```

### `POST /api/auth/login`

Authenticates a user and returns a JWT.

**Request body:**
```json
{
  "username": "sreyash",
  "password": "yourpassword"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "username": "sreyash",
    "role": "USER"
  }
}
```

Use the returned token in the `Authorization` header for any protected endpoint:
```
Authorization: Bearer <token>
```

### Error responses

| Status | Cause |
|---|---|
| `400` | Validation failure (missing/invalid fields) |
| `401` | Invalid credentials or expired/invalid token |
| `429` | Rate limit exceeded (20 requests/min per IP) |
| `500` | Unexpected server error |

All errors follow the same `ApiResponse<T>` shape with `success: false` and a `message` field.

## Running locally

**Prerequisites:** Java 17, Maven

```bash
git clone https://github.com/sreyash1141/api-gateway.git
cd api-gateway
mvn clean install
mvn spring-boot:run
```

The app starts on `http://localhost:8080`.

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:gatewaydb`, user: `sa`, no password)

## Running with Docker

```bash
docker-compose up --build
```

## Running tests

```bash
mvn clean test
```

Tests cover:
- JWT token generation, validation, and expiry (`JwtServiceTest`)
- Registration and login flows, including duplicate users and bad credentials (`AuthControllerTest`)

## CI/CD

Every push and pull request to `main` triggers a GitHub Actions pipeline that:
1. Runs the full test suite
2. Builds the application package
3. Builds the Docker image

See `.github/workflows/ci.yml`.

## Roadmap

- [ ] MongoDB integration for flexible, schema-less data alongside the relational store
- [ ] Kubernetes deployment manifests (Deployment, Service, ConfigMap, HPA)
- [ ] Proxy controller to forward authenticated requests to downstream services
- [ ] Live deployment on Railway/Render with a public demo link

## License

MIT
