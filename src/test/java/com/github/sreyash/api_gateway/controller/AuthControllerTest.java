package com.github.sreyash.api_gateway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.sreyash.api_gateway.dto.LoginRequest;
import com.github.sreyash.api_gateway.model.User;
import com.github.sreyash.api_gateway.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User existingUser = User.builder()
                .username("existinguser")
                .email("existing@test.com")
                .passwordHash(passwordEncoder.encode("correctPassword"))
                .role(User.Role.USER)
                .build();
        userRepository.save(existingUser);
    }

    @Test
    void register_returnsCreated_forNewUser() throws Exception {
        String json = "{\"username\":\"newuser\",\"email\":\"newuser@test.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void register_returnsInternalServerError_forDuplicateUsername() throws Exception {
        String json = "{\"username\":\"existinguser\",\"email\":\"different@test.com\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void login_returnsUnauthorized_forWrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("existinguser");
        request.setPassword("wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_returnsOk_forCorrectCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("existinguser");
        request.setPassword("correctPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}