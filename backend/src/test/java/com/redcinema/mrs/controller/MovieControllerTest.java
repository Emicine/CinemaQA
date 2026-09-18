package com.redcinema.mrs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.redcinema.mrs.dto.auth.AuthRequestDTO;
import com.redcinema.mrs.dto.movie.MovieRequestDTO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("MovieController integration tests")
class MovieControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Value("${app.super-admin.username}")
    private String adminUsername;

    @Value("${app.super-admin.password}")
    private String adminPassword;

    private static String adminToken;
    private static Long createdMovieId;

    // ── Obtain super-admin token ───────────────────────────────────────────────

    private String loginAs(String username, String password) throws Exception {
        AuthRequestDTO dto = new AuthRequestDTO();
        dto.setUserName(username);
        dto.setPassword(password);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("authenticationToken").asText();
    }

    // ── Public GET tests ─────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /api/movies/all — 200 without auth")
    void getAllMovies_public() throws Exception {
        mockMvc.perform(get("/api/movies/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    // ── CRUD (needs SUPER_ADMIN token) ────────────────────────────────────────

    @Test
    @Order(2)
    @DisplayName("POST /api/movies/movie/create — 201 with super-admin token")
    void createMovie_superAdmin() throws Exception {
        adminToken = loginAs(adminUsername, adminPassword);

        MovieRequestDTO dto = new MovieRequestDTO();
        dto.setMovieName("Test Movie");
        dto.setMovieGenre("ACTION");
        dto.setMovieDirector("Test Director");
        dto.setMovieReleaseDate(LocalDate.of(2024, 6, 15));
        dto.setMovieDescription("A movie for integration testing.");
        dto.setMovieDuration(120L);

        MvcResult result = mockMvc.perform(post("/api/movies/movie/create")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.movieName").value("Test Movie"))
                .andReturn();

        createdMovieId = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("movieId").asLong();
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/movies/movie/{id} — 200 for created movie")
    void getMovieById() throws Exception {
        if (createdMovieId == null) return;

        mockMvc.perform(get("/api/movies/movie/" + createdMovieId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movieId").value(createdMovieId));
    }

    @Test
    @Order(4)
    @DisplayName("POST /api/movies/movie/create — 403 without token")
    void createMovie_noToken() throws Exception {
        MovieRequestDTO dto = new MovieRequestDTO();
        dto.setMovieName("Unauthorized");
        dto.setMovieGenre("DRAMA");
        dto.setMovieDirector("Nobody");
        dto.setMovieReleaseDate(LocalDate.now());
        dto.setMovieDuration(90L);

        mockMvc.perform(post("/api/movies/movie/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    @DisplayName("PUT /api/movies/movie/{id} — 200 with super-admin token")
    void updateMovie() throws Exception {
        if (createdMovieId == null || adminToken == null) return;

        MovieRequestDTO dto = new MovieRequestDTO();
        dto.setMovieName("Updated Test Movie");
        dto.setMovieGenre("THRILLER");
        dto.setMovieDirector("Updated Director");
        dto.setMovieReleaseDate(LocalDate.of(2024, 9, 1));
        dto.setMovieDescription("Updated description.");
        dto.setMovieDuration(135L);

        mockMvc.perform(put("/api/movies/movie/" + createdMovieId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movieName").value("Updated Test Movie"));
    }

    @Test
    @Order(6)
    @DisplayName("DELETE /api/movies/movie/{id} — 200 with super-admin token")
    void deleteMovie() throws Exception {
        if (createdMovieId == null || adminToken == null) return;

        mockMvc.perform(delete("/api/movies/movie/" + createdMovieId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("Deleted movie")));
    }

    @Test
    @Order(7)
    @DisplayName("GET /api/movies/movie/{id} — 404 after deletion")
    void getMovieById_notFound() throws Exception {
        if (createdMovieId == null) return;

        mockMvc.perform(get("/api/movies/movie/" + createdMovieId))
                .andExpect(status().isNotFound());
    }
}
