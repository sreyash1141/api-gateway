package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.dto.ApiResponse;
import com.github.sreyash.api_gateway.dto.LoginRequest;
import com.github.sreyash.api_gateway.dto.LoginResponse;
import com.github.sreyash.api_gateway.service.AuthService;
import com.github.sreyash.api_gateway.service.RateLimitService;
import com.github.sreyash.api_gateway.exception.RateLimitException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.github.sreyash.api_gateway.dto.RegisterRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        if (!rateLimitService.tryConsume(ip)) {
            throw new RateLimitException(ip);
        }

        String result = authService.register(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(result, null));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        if (!rateLimitService.tryConsume(ip)) {
            throw new RateLimitException(ip);
        }

        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}