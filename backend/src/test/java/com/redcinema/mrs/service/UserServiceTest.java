package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.user.UserRequestDTO;
import com.redcinema.mrs.dto.user.UserUpdateDTO;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.exception.UserConflictException;
import com.redcinema.mrs.exception.UserNotFoundException;
import com.redcinema.mrs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService unit tests")
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;

    @InjectMocks UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .username("john")
                .password("encoded-pass")
                .firstName("John")
                .lastName("Doe")
                .userEmail("john@example.com")
                .userStatus(UserStatus.ACTIVE)
                .userRole(UserRole.ROLE_USER)
                .build();
    }

    // ── getUserById ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserById — returns user when found")
    void getUserById_found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        User result = userService.getUserById(1L);

        assertThat(result.getUsername()).isEqualTo("john");
        assertThat(result.getFirstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("getUserById — throws UserNotFoundException when not found")
    void getUserById_notFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(UserNotFoundException.class);
    }

    // ── createUser ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createUser — saves and returns user")
    void createUser_success() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("jane");
        dto.setPassword("encoded-already");
        dto.setFirstName("Jane");
        dto.setLastName("Smith");
        dto.setUserEmail("jane@example.com");

        when(userRepository.existsByUsernameOrUserEmail("jane", "jane@example.com"))
                .thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.createUser(dto);

        assertThat(result.getUsername()).isEqualTo("jane");
        assertThat(result.getUserRole()).isEqualTo(UserRole.ROLE_USER);
        assertThat(result.getUserStatus()).isEqualTo(UserStatus.ACTIVE);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("createUser — throws UserConflictException when duplicate")
    void createUser_duplicate() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setUsername("john");
        dto.setPassword("pass");
        dto.setFirstName("J");
        dto.setLastName("D");
        dto.setUserEmail("john@example.com");

        when(userRepository.existsByUsernameOrUserEmail("john", "john@example.com"))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(UserConflictException.class);
        verify(userRepository, never()).save(any());
    }

    // ── updateUser ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateUser — updates name fields and re-encodes password when provided")
    void updateUser_withPassword() {
        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setFirstName("Jonathan");
        dto.setLastName("Doe");
        dto.setPassword("newSecret99");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("newSecret99")).thenReturn("new-encoded");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateUser(1L, dto);

        assertThat(result.getFirstName()).isEqualTo("Jonathan");
        assertThat(result.getPassword()).isEqualTo("new-encoded");
    }

    @Test
    @DisplayName("updateUser — does NOT re-encode when password is blank")
    void updateUser_blankPassword() {
        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setFirstName("Johnny");
        dto.setLastName("Doe");
        dto.setPassword("");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateUser(1L, dto);

        assertThat(result.getFirstName()).isEqualTo("Johnny");
        assertThat(result.getPassword()).isEqualTo("encoded-pass"); // unchanged
        verify(passwordEncoder, never()).encode(any());
    }

    // ── promoteToTheatreAdmin ─────────────────────────────────────────────────

    @Test
    @DisplayName("promoteToTheatreAdmin — changes role to THEATRE_ADMIN")
    void promoteToTheatreAdmin() {
        when(userRepository.save(sampleUser)).thenReturn(sampleUser);

        User promoted = userService.promoteToTheatreAdmin(sampleUser);

        assertThat(promoted.getUserRole()).isEqualTo(UserRole.ROLE_THEATRE_ADMIN);
    }

    // ── deleteUser ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteUser — delegates to repository")
    void deleteUser_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        doNothing().when(userRepository).deleteById(1L);

        assertThatCode(() -> userService.deleteUser(1L)).doesNotThrowAnyException();
        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteUser — throws when user does not exist")
    void deleteUser_notFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(UserNotFoundException.class);
        verify(userRepository, never()).deleteById(any());
    }
}
