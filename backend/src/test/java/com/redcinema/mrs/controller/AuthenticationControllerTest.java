package com.redcinema.mrs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redcinema.mrs.dto.auth.AuthRequestDTO;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("AuthenticationController integration tests")
class AuthenticationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── Signup ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("POST /auth/signup — creates user and returns JWT")
    void signup_success() throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("integrationUser");
        dto.setPassword("Password123!");
        dto.setFirstName("Integration");
        dto.setLastName("Test");
        dto.setUserEmail("integration@test.com");

        MvcResult result = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authenticationToken").exists())
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("authenticationToken").asText();
        assertThat(token).isNotBlank();
        // Should be a 3-part JWT
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @Order(2)
    @DisplayName("POST /auth/signup — 409 on duplicate username")
    void signup_duplicate() throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("integrationUser");          // same as above
        dto.setPassword("AnotherPass1!");
        dto.setFirstName("Dup");
        dto.setLastName("User");
        dto.setUserEmail("dup@test.com");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(3)
    @DisplayName("POST /auth/signup — 400 on blank username")
    void signup_validation() throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("");  // blank — should fail validation
        dto.setPassword("pass");
        dto.setFirstName("X");
        dto.setLastName("Y");
        dto.setUserEmail("x@test.com");

        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    @Order(4)
    @DisplayName("POST /auth/login — returns JWT for valid credentials")
    void login_success() throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUserName("integrationUser");
        dto.setPassword("Password123!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticationToken").exists());
    }

    @Test
    @Order(5)
    @DisplayName("POST /auth/login — 401 on wrong password")
    void login_badCredentials() throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUserName("integrationUser");
        dto.setPassword("wrongPassword!");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }
}
