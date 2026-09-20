package com.github.sreyash.api_gateway.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class ProxyRequest {

    @NotBlank(message = "Target URL is required")
    private String targetUrl;

    private String method;

    private Map<String, String> headers;

    private Object body;
}