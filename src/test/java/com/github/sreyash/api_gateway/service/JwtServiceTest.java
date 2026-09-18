package com.github.sreyash.api_gateway.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret",
                "test-secret-key-for-unit-tests-must-be-long-enough-256-bits");
        ReflectionTestUtils.setField(jwtService, "expiryMs", 900000L);
    }

    @Test
    void generateToken_and_extractUsername_roundTrip() {
        String token = jwtService.generateToken("sreyash");
        String extractedUsername = jwtService.extractUsername(token);

        assertEquals("sreyash", extractedUsername);
    }

    @Test
    void validateToken_returnsTrue_forValidTokenAndMatchingUsername() {
        String token = jwtService.generateToken("sreyash");

        boolean isValid = jwtService.validateToken(token, "sreyash");

        assertTrue(isValid);
    }

    @Test
    void validateToken_returnsFalse_forMismatchedUsername() {
        String token = jwtService.generateToken("sreyash");

        boolean isValid = jwtService.validateToken(token, "someoneelse");

        assertFalse(isValid);
    }

    @Test
    void generateToken_producesDifferentTokens_forDifferentUsers() {
        String token1 = jwtService.generateToken("sreyash");
        String token2 = jwtService.generateToken("admin");

        assertNotEquals(token1, token2);
    }
}