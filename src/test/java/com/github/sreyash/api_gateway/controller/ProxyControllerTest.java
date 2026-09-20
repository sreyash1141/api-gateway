package com.github.sreyash.api_gateway.controller;

import com.github.sreyash.api_gateway.model.User;
import com.github.sreyash.api_gateway.repository.UserRepository;
import com.github.sreyash.api_gateway.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProxyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String validToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = User.builder()
                .username("proxyuser")
                .email("proxy@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.USER)
                .build();
        userRepository.save(user);

        validToken = jwtService.generateToken("proxyuser");
    }

    @Test
    void forward_returnsUnauthorized_withoutToken() throws Exception {
        String json = "{\"targetUrl\":\"http://localhost:8080/mock/data\",\"method\":\"GET\"}";

        mockMvc.perform(post("/api/proxy/forward")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void forward_returnsBadRequest_withoutTargetUrl() throws Exception {
        String json = "{\"method\":\"GET\"}";

        mockMvc.perform(post("/api/proxy/forward")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}