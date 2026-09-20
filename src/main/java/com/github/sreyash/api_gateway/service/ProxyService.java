package com.github.sreyash.api_gateway.service;

import com.github.sreyash.api_gateway.dto.ProxyRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProxyService {

    private final RestTemplate restTemplate;

    public ResponseEntity<String> forward(ProxyRequest request, String authenticatedUser) {
        String method = request.getMethod() != null ? request.getMethod().toUpperCase() : "GET";
        String targetUrl = request.getTargetUrl();

        log.info("[PROXY] user={} method={} target={}", authenticatedUser, method, targetUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Forwarded-User", authenticatedUser);
        headers.set("X-Forwarded-By", "api-gateway");

        if (request.getHeaders() != null) {
            for (Map.Entry<String, String> entry : request.getHeaders().entrySet()) {
                headers.set(entry.getKey(), entry.getValue());
            }
        }

        HttpEntity<Object> entity = new HttpEntity<>(request.getBody(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.valueOf(method),
                    entity,
                    String.class
            );

            log.info("[PROXY] user={} target={} status={}", authenticatedUser, targetUrl, response.getStatusCode());
            return response;

        } catch (HttpClientErrorException e) {
            log.warn("[PROXY] user={} target={} error={}", authenticatedUser, targetUrl, e.getStatusCode());
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(e.getResponseBodyAsString());
        }
    }
}