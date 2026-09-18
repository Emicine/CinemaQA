package com.redcinema.mrs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redcinema.mrs.dto.auth.AuthRequestDTO;
import com.redcinema.mrs.dto.theatre.TheatreRequestDTO;
import com.redcinema.mrs.dto.screen.ScreenRequestDTO;
import com.redcinema.mrs.dto.seat.SeatRequestDTO;
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
@DisplayName("TheatreController integration tests")
class TheatreControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Value("${app.super-admin.username}")
    private String adminUsername;

    @Value("${app.super-admin.password}")
    private String adminPassword;

    private static String adminToken;
    private static Long createdTheatreId;
    private static Long regularUserToken_UserId;

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

    private String signupAs(String username, String password, String email) throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername(username); dto.setPassword(password);
        dto.setFirstName("Test"); dto.setLastName("User");
        dto.setUserEmail(email);
        MvcResult r = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString())
                .get("authenticationToken").asText();
    }

    private TheatreRequestDTO buildTheatreDto(Long adminId) {
        SeatRequestDTO seat = new SeatRequestDTO();
        seat.setRowId(1); seat.setSeatNumber(1);
        seat.setSeatType("SINGLE"); seat.setSeatPrice(250.0);

        ScreenRequestDTO screen = new ScreenRequestDTO();
        screen.setScreenName("Screen A");
        screen.setSeats(List.of(seat));

        TheatreRequestDTO dto = new TheatreRequestDTO();
        dto.setTheatreName("Test Cinemas");
        dto.setTheatreLocation("Mumbai");
        dto.setTheatreAdminId(adminId);
        dto.setScreens(List.of(screen));
        return dto;
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /api/theatres/all — 200 without auth")
    void getAllTheatres_public() throws Exception {
        mockMvc.perform(get("/api/theatres/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/theatres/theatre/create — 401 without token")
    void createTheatre_noToken() throws Exception {
        mockMvc.perform(post("/api/theatres/theatre/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildTheatreDto(1L))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/theatres/theatre/create — 201 with super-admin token")
    void createTheatre_success() throws Exception {
        adminToken = loginAs(adminUsername, adminPassword);

        // Find the super-admin's userId to use as theatreAdminId
        MvcResult usersResult = mockMvc.perform(get("/api/users/all")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andReturn();

        Long superAdminId = objectMapper.readTree(
                usersResult.getResponse().getContentAsString())
                .path("pageData").get(0).path("userId").asLong();

        MvcResult result = mockMvc.perform(post("/api/theatres/theatre/create")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildTheatreDto(superAdminId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.theatreName").value("Test Cinemas"))
                .andExpect(jsonPath("$.data.theatreLocation").value("Mumbai"))
                .andReturn();

        createdTheatreId = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("theatreId").asLong();
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/theatres/theatre/{id} — 200 for created theatre")
    void getTheatreById() throws Exception {
        if (createdTheatreId == null) return;
        mockMvc.perform(get("/api/theatres/theatre/" + createdTheatreId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.theatreId").value(createdTheatreId))
                .andExpect(jsonPath("$.data.theatreLocation").value("Mumbai"));
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/theatres/theatre/{id} — 404 for non-existent ID")
    void getTheatreById_notFound() throws Exception {
        mockMvc.perform(get("/api/theatres/theatre/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(6)
    @DisplayName("DELETE /api/theatres/theatre/{id} — 403 for regular user")
    void deleteTheatre_forbidden() throws Exception {
        String userToken = signupAs("theatre-tester", "Password123!", "theatre-tester@test.com");
        mockMvc.perform(delete("/api/theatres/theatre/" + createdTheatreId)
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
}
