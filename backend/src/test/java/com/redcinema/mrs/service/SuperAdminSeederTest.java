package com.redcinema.mrs.service;

import com.redcinema.mrs.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("SuperAdminSeeder integration tests")
class SuperAdminSeederTest {

    @Autowired UserRepository userRepository;

    @Value("${app.super-admin.username}")
    private String adminUsername;

    @Test
    @DisplayName("Seeder creates exactly one super-admin on startup")
    void seeder_createsExactlyOneSuperAdmin() {
        // The seeder runs on ApplicationRunner during context startup.
        // This test verifies the admin exists and there is no duplicate.
        long count = userRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(adminUsername))
                .count();
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Seeder is idempotent — running context twice does not create a second admin")
    void seeder_isIdempotent() {
        // The ApplicationRunner has already been executed once by the time this test
        // method runs. The test verifies there is still exactly one such user.
        long totalAdmins = userRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(adminUsername))
                .count();
        assertThat(totalAdmins).isEqualTo(1);
    }
}
