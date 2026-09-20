package com.github.sreyash.api_gateway.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "API Gateway",
                version = "1.0",
                description = "REST API Gateway with JWT authentication, per-IP rate limiting, request proxying, and system health monitoring"
        )
)
public class OpenApiConfig {
}