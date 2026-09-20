package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.dto.ApiResponse;
import com.github.sreyash.api_gateway.model.AuditLog;
import com.github.sreyash.api_gateway.model.User;
import com.github.sreyash.api_gateway.repository.AuditLogRepository;
import com.github.sreyash.api_gateway.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "User management and audit logs (admin only)")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/users")
    @Operation(summary = "List all registered users")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAllUsers() {

        List<Map<String, String>> users = userRepository.findAll().stream()
                .map(user -> {
                    Map<String, String> map = new LinkedHashMap<>();
                    map.put("id", user.getId());
                    map.put("username", user.getUsername());
                    map.put("email", user.getEmail());
                    map.put("role", user.getRole().name());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", users));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user by ID")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity
                    .status(404)
                    .body(ApiResponse.error("User not found"));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get the 50 most recent audit log entries")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentLogs() {

        List<AuditLog> logs = auditLogRepository.findTop50ByOrderByTimestampDesc();
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", logs));
    }

    @GetMapping("/logs/{username}")
    @Operation(summary = "Get audit logs for a specific user")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogsByUser(
            @PathVariable String username) {

        List<AuditLog> logs = auditLogRepository.findByUsernameOrderByTimestampDesc(username);
        return ResponseEntity.ok(ApiResponse.ok("Audit logs for " + username, logs));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get request statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalLogs", auditLogRepository.count());
        stats.put("getRequests", auditLogRepository.countByMethod("GET"));
        stats.put("postRequests", auditLogRepository.countByMethod("POST"));
        stats.put("putRequests", auditLogRepository.countByMethod("PUT"));
        stats.put("deleteRequests", auditLogRepository.countByMethod("DELETE"));

        return ResponseEntity.ok(ApiResponse.ok("Request stats retrieved", stats));
    }
}