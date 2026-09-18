package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import com.redcinema.mrs.dto.user.UserUpdateDTO;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.exception.UserConflictException;
import com.redcinema.mrs.exception.UserNotFoundException;
import com.redcinema.mrs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // ── Read ─────────────────────────────────────────────────────────────────

    public Page<User> getAllUsers(int page, int pageSize) {
        return userRepository.findAll(PageRequest.of(page, pageSize));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(
                        ExceptionConstants.USER_NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(
                        ExceptionConstants.USER_NOT_FOUND_BY_USERNAME, HttpStatus.NOT_FOUND));
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        return userRepository.existsByUsernameOrUserEmail(username, email);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * Creates a new user.  The caller is responsible for encoding the password
     * before calling this method (AuthenticationService does this for signup;
     * Super-Admin creation path goes through here directly, also pre-encoded).
     */
    @Transactional
    public User createUser(UserRequestDTO dto) {
        if (existsByUsernameOrEmail(dto.getUsername(), dto.getUserEmail())) {
            throw new UserConflictException(
                    ExceptionConstants.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())          // must already be encoded
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .userEmail(dto.getUserEmail())
                .userStatus(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_USER)
                .build();

        return userRepository.save(user);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public User updateUser(Long userId, UserUpdateDTO dto) {
        User user = getUserById(userId);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());

        // Only update password when a non-blank value is supplied
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    // ── Promote / Demote ──────────────────────────────────────────────────────

    @Transactional
    public User promoteToTheatreAdmin(User user) {
        user.setUserRole(UserRole.ROLE_THEATRE_ADMIN);
        return userRepository.save(user);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long userId) {
        getUserById(userId);          // validates existence first
        userRepository.deleteById(userId);
    }
}
