package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.dto.ApiResponse;
import com.github.sreyash.api_gateway.dto.UpdateUserRequest;
import com.github.sreyash.api_gateway.model.User;
import com.github.sreyash.api_gateway.service.AuthService;
import com.github.sreyash.api_gateway.service.RateLimitService;
import com.github.sreyash.api_gateway.exception.RateLimitException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User management", description = "View, update, and delete user profiles")
public class UserController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @GetMapping("/me")
    @Operation(summary = "Get current user's profile")
    public ResponseEntity<ApiResponse<Map<String, String>>> getProfile(
            Authentication authentication,
            HttpServletRequest request) {

        checkRateLimit(request);

        User user = authService.getUserByUsername(authentication.getName());

        Map<String, String> profile = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user's email or password")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest updateRequest,
            HttpServletRequest request) {

        checkRateLimit(request);

        User updated = authService.updateUser(
                authentication.getName(),
                updateRequest.getEmail(),
                updateRequest.getPassword()
        );

        Map<String, String> profile = Map.of(
                "id", updated.getId(),
                "username", updated.getUsername(),
                "email", updated.getEmail(),
                "role", updated.getRole().name()
        );

        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profile));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete current user's account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            Authentication authentication,
            HttpServletRequest request) {

        checkRateLimit(request);

        authService.deleteUser(authentication.getName());

        return ResponseEntity.ok(ApiResponse.ok("Account deleted", null));
    }

    private void checkRateLimit(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        if (!rateLimitService.tryConsume(ip)) {
            throw new RateLimitException(ip);
        }
    }
}