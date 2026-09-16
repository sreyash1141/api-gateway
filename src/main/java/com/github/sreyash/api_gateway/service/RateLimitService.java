package com.github.sreyash.api_gateway.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(20)
                .refillGreedy(20, Duration.ofMinutes(1))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public boolean tryConsume(String ipAddress) {
        Bucket bucket = buckets.computeIfAbsent(ipAddress, k -> createNewBucket());
        return bucket.tryConsume(1);
    }

    public long getAvailableTokens(String ipAddress) {
        Bucket bucket = buckets.computeIfAbsent(ipAddress, k -> createNewBucket());
        return bucket.getAvailableTokens();
    }
}