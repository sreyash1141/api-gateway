package com.github.sreyash.api_gateway.exception;

public class RateLimitException extends RuntimeException {
    public RateLimitException(String ipAddress) {
        super("Rate limit exceeded for IP: " + ipAddress);
    }
}