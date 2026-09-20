package com.github.sreyash.api_gateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/mock")
@Tag(name = "Mock downstream", description = "Simulated downstream service for proxy testing")
public class MockDownstreamController {

    @GetMapping("/data")
    @Operation(summary = "Returns mock data")
    public ResponseEntity<Map<String, Object>> getData(
            @RequestHeader(value = "X-Forwarded-User", required = false) String forwardedUser) {

        return ResponseEntity.ok(Map.of(
                "source", "mock-downstream-service",
                "timestamp", Instant.now().toString(),
                "forwardedUser", forwardedUser != null ? forwardedUser : "none",
                "data", Map.of(
                        "items", 42,
                        "status", "healthy"
                )
        ));
    }

    @PostMapping("/echo")
    @Operation(summary = "Echoes back whatever was sent")
    public ResponseEntity<Map<String, Object>> echo(
            @RequestBody(required = false) Object body,
            @RequestHeader(value = "X-Forwarded-User", required = false) String forwardedUser) {

        return ResponseEntity.ok(Map.of(
                "source", "mock-downstream-service",
                "timestamp", Instant.now().toString(),
                "forwardedUser", forwardedUser != null ? forwardedUser : "none",
                "echoedBody", body != null ? body : "empty"
        ));
    }
}