package com.redcinema.mrs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redcinema.mrs.dto.auth.AuthRequestDTO;
import com.redcinema.mrs.dto.reservation.ReservationRequestDTO;
import com.redcinema.mrs.dto.showseat.ShowSeatRequestDTO;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("ReservationController integration tests")
class ReservationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Value("${app.super-admin.username}")
    private String adminUsername;

    @Value("${app.super-admin.password}")
    private String adminPassword;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String loginAs(String username, String password) throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUserName(username);
        dto.setPassword(password);
        MvcResult r = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString())
                .get("authenticationToken").asText();
    }

    private String signupAndGetToken(String username, String email) throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername(username); dto.setPassword("Password123!");
        dto.setFirstName("Res"); dto.setLastName("User"); dto.setUserEmail(email);
        MvcResult r = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString())
                .get("authenticationToken").asText();
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("POST /api/reservations/reserve — 403 for unauthenticated request")
    void reserve_unauthenticated() throws Exception {
        ReservationRequestDTO dto = new ReservationRequestDTO();
        dto.setUserId(1L);
        dto.setShowId(1L);
        ShowSeatRequestDTO seat = new ShowSeatRequestDTO();
        seat.setSeatId(1L);
        dto.setShowSeats(List.of(seat));

        mockMvc.perform(post("/api/reservations/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/reservations/reserve — 400 for empty seat list")
    void reserve_emptySeatList() throws Exception {
        String token = signupAndGetToken("reservationUser1", "resuser1@test.com");

        ReservationRequestDTO dto = new ReservationRequestDTO();
        dto.setUserId(1L);
        dto.setShowId(1L);
        dto.setShowSeats(List.of()); // empty — validation error

        mockMvc.perform(post("/api/reservations/reserve")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.showSeats").exists());
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/reservations/user/{userId}/all — 200 returns empty list for new user")
    void getReservations_emptyForNewUser() throws Exception {
        String token = signupAndGetToken("reservationUser2", "resuser2@test.com");

        // Decode userId from token (it's in the claims)
        String[] parts = token.split("\\.");
        String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
        long userId = objectMapper.readTree(payload).path("userId").asLong();

        mockMvc.perform(get("/api/reservations/user/" + userId + "/all")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @Order(4)
    @DisplayName("PUT /api/reservations/cancel/{id} — 404 for non-existent reservation")
    void cancelReservation_notFound() throws Exception {
        String token = loginAs(adminUsername, adminPassword);
        mockMvc.perform(put("/api/reservations/cancel/999999")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
