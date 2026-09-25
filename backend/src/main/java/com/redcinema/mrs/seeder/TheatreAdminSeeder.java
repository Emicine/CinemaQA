package com.redcinema.mrs.seeder;

import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TheatreAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        String username = "theatreAdmin";
        String email = "theatreadmin@redcinema.com";
        String rawPassword = "theatrePassword@123";

        // Ne crée pas de doublon si le compte existe déjà
        if (userRepository.existsByUsernameOrUserEmail(username, email)) {
            log.info("Theatre-admin '{}' already exists — skipping seed.", username);
            return;
        }

        User theatreAdmin = User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .firstName("Theatre")
                .lastName("Admin")
                .userEmail(email)
                .userStatus(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_THEATRE_ADMIN)
                .build();

        userRepository.save(theatreAdmin);

        log.info("Theatre-admin '{}' seeded successfully.", username);
    }
}