

Readme · MD
# API Gateway
 
A Spring Boot REST API gateway with JWT authentication, per-IP rate limiting, MongoDB persistence, request proxying, and system health monitoring. Fully containerized with Docker, orchestrated on Kubernetes with autoscaling, and tested with a CI pipeline.
 
## Why this exists
 
Most portfolio auth demos stop at "login returns a token." This project goes further and handles the concerns a real gateway actually needs:
 
- **Security** — stateless JWT auth with Spring Security, so no server-side session state to manage or scale
- **Abuse protection** — per-IP rate limiting using a token bucket algorithm (20 requests/min), so a single client can't hammer the endpoints
- **Request forwarding** — proxy controller that forwards authenticated requests to downstream services with user identity headers
- **User lifecycle** — full CRUD for user accounts, not just register and login
- **Observability** — every request is logged with method, path, status, and latency, plus a dedicated health endpoint exposing uptime, memory, and database status
- **Consistency** — every response, success or failure, returns the same `ApiResponse<T>` shape
- **Reliability** — 17 unit and integration tests covering auth, user management, proxy security, and health endpoints, running automatically on every push
## Tech stack
 
| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 4.0.8 |
| Security | Spring Security + JJWT (JSON Web Tokens) |
| Rate limiting | Bucket4j (token bucket algorithm) |
| Database | MongoDB 7 |
| ODM | Spring Data MongoDB |
| API docs | Springdoc OpenAPI (Swagger UI) |
| Testing | JUnit 5, MockMvc |
| Containerization | Docker (multi-stage build) |
| Orchestration | Kubernetes (Deployment, Service, ConfigMap, Secret, HPA) |
| CI/CD | GitHub Actions |
 
## Architecture
 
Every request passes through the same pipeline before reaching business logic:
 
```
Client request
      │
      ▼
RequestLoggingFilter       Logs method, path, latency
      │
      ▼
JwtAuthFilter              Validates Bearer token → 401 if invalid
      │
      ▼
RateLimitService           20 req/min per IP → 429 if exceeded
      │
      ▼
Controller → Service → Repository → MongoDB
      │
      ▼
GlobalExceptionHandler     Wraps every response in ApiResponse<T>
```
 
## API endpoints
 
### Authentication
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a JWT |
 
**Register** — `POST /api/auth/register`
```json
{
  "username": "sreyash",
  "email": "sreyash@test.com",
  "password": "password123"
}
```
Response: `201 Created`
 
**Login** — `POST /api/auth/login`
```json
{
  "username": "sreyash",
  "password": "password123"
}
```
Response: `200 OK` with JWT token, username, and role.
 
Use the returned token in the `Authorization` header for protected endpoints:
```
Authorization: Bearer <token>
```
 
### User management (protected)
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | JWT | View current user's profile |
| PUT | `/api/users/me` | JWT | Update email or password |
| DELETE | `/api/users/me` | JWT | Delete account |
 
**Update profile** — `PUT /api/users/me`
```json
{
  "email": "newemail@test.com",
  "password": "newpassword456"
}
```
Both fields are optional — send whichever you want to update.
 
### Proxy (protected)
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/proxy/forward` | JWT | Forward a request to a downstream service |
 
**Forward request** — `POST /api/proxy/forward`
```json
{
  "targetUrl": "http://localhost:8080/mock/data",
  "method": "GET"
}
```
The gateway attaches `X-Forwarded-User` and `X-Forwarded-By` headers so the downstream service knows who sent the request and that it came through the gateway.
 
### System status (public)
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/status` | No | System overview: uptime, user count, MongoDB status, memory |
| GET | `/api/status/rate-limit/{ip}` | No | Check remaining rate-limit tokens for an IP |
 
### Mock downstream (public)
 
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/mock/data` | No | Returns mock data with forwarded user info |
| POST | `/mock/echo` | No | Echoes back whatever was sent |
 
These exist for testing the proxy controller — they simulate an external service.
 
### Error responses
 
| Status | Cause |
|---|---|
| `400` | Validation failure (missing/invalid fields) |
| `401` | Invalid credentials or expired/invalid JWT |
| `403` | Missing JWT on a protected endpoint |
| `429` | Rate limit exceeded (20 requests/min per IP) |
| `500` | Unexpected server error |
 
All errors follow the same `ApiResponse<T>` shape with `success: false` and a `message` field.
 
## Running locally
 
**Prerequisites:** Java 17, Maven, Docker
 
```bash
# Start MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7
 
# Clone and run
git clone https://github.com/sreyash1141/api-gateway.git
cd api-gateway
mvn clean install
mvn spring-boot:run
```
 
The app starts on `http://localhost:8080`.
 
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- System status: `http://localhost:8080/api/status`
## Running with Docker Compose
 
```bash
docker-compose up --build
```
 
This starts both the gateway and MongoDB together. The gateway connects to MongoDB automatically via the `MONGODB_URI` environment variable.
 
## Running on Kubernetes
 
```bash
# Apply all manifests
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
kubectl apply -f k8s/hpa.yml
 
# Check pods
kubectl get pods
 
# Access the gateway
# NodePort exposes it at port 30080
curl http://localhost:30080/api/status
```
 
The Kubernetes setup includes:
- **Deployment** — 2 replicas of the gateway + 1 MongoDB pod with health probes
- **Service** — NodePort (gateway at 30080) + ClusterIP (MongoDB internal)
- **ConfigMap** — non-sensitive config (MongoDB URI, port, profiles)
- **Secret** — sensitive config (JWT signing key)
- **HPA** — autoscales gateway from 2 to 5 pods at 70% CPU utilization
## Running tests
 
```bash
mvn clean test
```
 
17 tests covering:
- JWT token generation, validation, and expiry (`JwtServiceTest`)
- Registration and login flows (`AuthControllerTest`)
- Profile view, update, and delete with JWT (`UserControllerTest`)
- Proxy authorization checks (`ProxyControllerTest`)
- System status and rate-limit endpoints (`HealthControllerTest`)
## CI/CD
 
Every push and pull request to `main` triggers a GitHub Actions pipeline that:
1. Spins up a MongoDB service container
2. Runs the full test suite
3. Builds the application package
4. Builds the Docker image
See `.github/workflows/ci.yml`.
 
## Postman collection
 
A complete Postman collection with 15 pre-configured requests is included. Import `API_Gateway.postman_collection.json` into Postman — the login request automatically saves the JWT token so all protected endpoints work without manual copy-paste.
 
## Project structure
 
```
api-gateway/
├── .github/workflows/ci.yml
├── k8s/
│   ├── configmap.yml
│   ├── deployment.yml
│   ├── hpa.yml
│   ├── secret.yml
│   └── service.yml
├── src/main/java/com/github/sreyash/api_gateway/
│   ├── config/
│   │   ├── OpenApiConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── HealthController.java
│   │   ├── MockDownstreamController.java
│   │   ├── ProxyController.java
│   │   └── UserController.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── ProxyRequest.java
│   │   ├── RegisterRequest.java
│   │   └── UpdateUserRequest.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   └── RateLimitException.java
│   ├── filter/
│   │   ├── JwtAuthFilter.java
│   │   └── RequestLoggingFilter.java
│   ├── model/
│   │   └── User.java
│   ├── repository/
│   │   └── UserRepository.java
│   └── service/
│       ├── AuthService.java
│       ├── JwtService.java
│       ├── ProxyService.java
│       ├── RateLimitService.java
│       └── UserDetailsServiceImpl.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```
 
## License
 
MIT
 












