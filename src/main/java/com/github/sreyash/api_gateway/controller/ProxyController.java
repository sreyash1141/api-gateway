package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.dto.ApiResponse;
import com.github.sreyash.api_gateway.dto.ProxyRequest;
import com.github.sreyash.api_gateway.exception.RateLimitException;
import com.github.sreyash.api_gateway.service.ProxyService;
import com.github.sreyash.api_gateway.service.RateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proxy")
@RequiredArgsConstructor
@Tag(name = "Proxy", description = "Forward authenticated requests to downstream services")
public class ProxyController {

    private final ProxyService proxyService;
    private final RateLimitService rateLimitService;

    @PostMapping("/forward")
    @Operation(summary = "Forward a request to a downstream service")
    public ResponseEntity<ApiResponse<String>> forward(
            Authentication authentication,
            @Valid @RequestBody ProxyRequest proxyRequest,
            HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        if (!rateLimitService.tryConsume(ip)) {
            throw new RateLimitException(ip);
        }

        ResponseEntity<String> downstream = proxyService.forward(
                proxyRequest,
                authentication.getName()
        );

        return ResponseEntity
                .status(downstream.getStatusCode())
                .body(ApiResponse.ok("Forwarded successfully", downstream.getBody()));
    }
}