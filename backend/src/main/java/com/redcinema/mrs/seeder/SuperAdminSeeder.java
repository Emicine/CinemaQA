package com.redcinema.mrs.seeder;

import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a super-admin user on first startup.
 *
 * BUG FIX: the original {@code ApplicationListener<ContextRefreshedEvent>}
 * fired on every context refresh (including test context loads), causing
 * duplicate inserts.  Using {@link ApplicationRunner} ensures it runs exactly
 * once per application start.  An existence check further guarantees idempotency.
 *
 * Credentials can be overridden via environment variables:
 *   SUPER_ADMIN_USERNAME / SUPER_ADMIN_PASSWORD / SUPER_ADMIN_EMAIL
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SuperAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.super-admin.username:superAdmin}")
    private String username;

    @Value("${app.super-admin.password:superPassword@123}")
    private String rawPassword;

    @Value("${app.super-admin.email:superadmin@redcinema.com}")
    private String email;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Idempotency check — skip if super-admin already exists
        if (userRepository.existsByUsernameOrUserEmail(username, email)) {
            log.info("Super-admin '{}' already exists — skipping seed.", username);
            return;
        }

        User superAdmin = User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .firstName("Super")
                .lastName("Admin")
                .userEmail(email)
                .userStatus(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_SUPER_ADMIN)
                .build();

        userRepository.save(superAdmin);
        log.info("✅ Super-admin '{}' seeded successfully.", username);
    }
}
