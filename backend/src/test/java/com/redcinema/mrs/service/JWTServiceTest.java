package com.redcinema.mrs.service;

import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.service.auth.JWTService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JWTService unit tests")
class JWTServiceTest {

    private JWTService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JWTService(60L); // 60-minute expiry

        testUser = User.builder()
                .userId(1L)
                .username("testuser")
                .password("encoded-pass")
                .firstName("Test")
                .lastName("User")
                .userEmail("test@example.com")
                .userStatus(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_USER)
                .build();
    }

    @Test
    @DisplayName("generateToken — returns a non-blank 3-part JWT")
    void generateToken_structure() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("extractUsername — returns the correct subject")
    void extractUsername() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.extractUsername(token)).isEqualTo("testuser");
    }

    @Test
    @DisplayName("isTokenValid — true for fresh token")
    void isTokenValid_fresh() {
        String token = jwtService.generateToken(testUser);
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid — false for an expired token (0-minute expiry)")
    void isTokenValid_expired() {
        JWTService shortLivedService = new JWTService(0L); // expires immediately
        String token = shortLivedService.generateToken(testUser);

        // The token is expired; isTokenValid should catch this without throwing
        assertThat(shortLivedService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid — false for a tampered token")
    void isTokenValid_tampered() {
        String token = jwtService.generateToken(testUser);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("extractAllClaims — contains ROLES claim")
    void extractAllClaims_roles() {
        String token = jwtService.generateToken(testUser);
        var claims = jwtService.extractAllClaims(token);

        assertThat(claims.get("ROLES")).isNotNull();
    }
}
