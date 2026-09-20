package com.github.sreyash.api_gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getStatus_returnsOk_withoutAuth() throws Exception {
        mockMvc.perform(get("/api/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.application").value("api-gateway"))
                .andExpect(jsonPath("$.data.mongoStatus").value("CONNECTED"));
    }

    @Test
    void getRateLimitStatus_returnsOk_forAnyIp() throws Exception {
        mockMvc.perform(get("/api/status/rate-limit/127.0.0.1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ip").value("127.0.0.1"))
                .andExpect(jsonPath("$.data.maxRequestsPerMinute").value(20));
    }
}