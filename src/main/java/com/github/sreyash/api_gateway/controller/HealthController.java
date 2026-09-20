package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.dto.ApiResponse;
import com.github.sreyash.api_gateway.repository.UserRepository;
import com.github.sreyash.api_gateway.service.RateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.info.BuildProperties;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
@Tag(name = "System status", description = "Health, uptime, and system metrics")
public class HealthController {

    private final UserRepository userRepository;
    private final RateLimitService rateLimitService;
    private final MongoTemplate mongoTemplate;

    @GetMapping
    @Operation(summary = "Get system status overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        Duration uptime = Duration.ofMillis(uptimeMs);

        String formattedUptime = String.format("%dd %dh %dm %ds",
                uptime.toDays(),
                uptime.toHoursPart(),
                uptime.toMinutesPart(),
                uptime.toSecondsPart());

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("application", "api-gateway");
        status.put("status", "UP");
        status.put("uptime", formattedUptime);
        status.put("totalUsers", userRepository.count());
        status.put("mongoStatus", checkMongoStatus());
        status.put("javaVersion", System.getProperty("java.version"));
        status.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        status.put("freeMemoryMB", Runtime.getRuntime().freeMemory() / (1024 * 1024));
        status.put("totalMemoryMB", Runtime.getRuntime().totalMemory() / (1024 * 1024));

        return ResponseEntity.ok(ApiResponse.ok("System status retrieved", status));
    }

    @GetMapping("/rate-limit/{ip}")
    @Operation(summary = "Check remaining rate-limit tokens for an IP")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRateLimitStatus(
            @PathVariable String ip) {

        long remaining = rateLimitService.getAvailableTokens(ip);

        Map<String, Object> info = Map.of(
                "ip", ip,
                "remainingRequests", remaining,
                "maxRequestsPerMinute", 20,
                "windowDuration", "1 minute"
        );

        return ResponseEntity.ok(ApiResponse.ok("Rate limit status retrieved", info));
    }

    private String checkMongoStatus() {
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            return "CONNECTED";
        } catch (Exception e) {
            return "DISCONNECTED: " + e.getMessage();
        }
    }
}