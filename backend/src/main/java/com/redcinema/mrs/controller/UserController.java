package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.APIResponseDTO;
import com.redcinema.mrs.dto.PagedAPIResponseDTO;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import com.redcinema.mrs.dto.user.UserResponseDTO;
import com.redcinema.mrs.dto.user.UserUpdateDTO;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;

    // ── GET /api/users/all  [SUPER_ADMIN] ─────────────────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @GetMapping("/all")
    public ResponseEntity<PagedAPIResponseDTO> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<User> users = userService.getAllUsers(page, pageSize);
        return ResponseEntity.ok(PagedAPIResponseDTO.builder()
                .pageData(users.getContent())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .currentLimit(users.getNumberOfElements())
                .build());
    }

    // ── POST /api/users/user/create  [SUPER_ADMIN] ────────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @PostMapping("/user/create")
    public ResponseEntity<APIResponseDTO> createUser(@Valid @RequestBody UserRequestDTO dto) {
        // Encode password for admin-created accounts
        dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        User newUser = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponseDTO.builder()
                .message("User created with id: " + newUser.getUserId())
                .data(toResponseDTO(newUser))
                .build());
    }

    // ── POST /api/users/user/{userId}/theatre-admin [SUPER_ADMIN] ──
    @Secured("ROLE_SUPER_ADMIN")
    @PostMapping("/user/{userId}/theatre-admin")
    public ResponseEntity<APIResponseDTO> promoteToTheatreAdmin(
            @PathVariable Long userId) {

        User user = userService.getUserById(userId);
        User updated = userService.promoteToTheatreAdmin(user);

        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("User promoted to theatre admin.")
                .data(toResponseDTO(updated))
                .build());
    }

    // ── GET /api/users/user/{userId}  [SUPER_ADMIN] ───────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @GetMapping("/user/{userId}")
    public ResponseEntity<APIResponseDTO> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .data(toResponseDTO(user))
                .build());
    }

    // ── PUT /api/users/user/{userId}  [SUPER_ADMIN] ───────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @PutMapping("/user/{userId}")
    public ResponseEntity<APIResponseDTO> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateDTO dto) {

        User updated = userService.updateUser(userId, dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("User " + updated.getUserId() + " updated.")
                .data(toResponseDTO(updated))
                .build());
    }

    // ── DELETE /api/users/user/{userId}  [SUPER_ADMIN] ───────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<APIResponseDTO> deleteUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Deleted user id: " + user.getUserId()
                         + " email: " + user.getUserEmail())
                .build());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private UserResponseDTO toResponseDTO(User u) {
        return UserResponseDTO.builder()
                .userId(u.getUserId())
                .userName(u.getUsername())
                .firstName(u.getFirstName())      // BUG FIX: was u.getUserEmail()
                .lastName(u.getLastName())
                .userEmail(u.getUserEmail())
                .userRole(u.getUserRole())
                .userStatus(u.getUserStatus())
                .userCreatedAt(u.getUserCreatedAt())
                .userUpdatedAt(u.getUserUpdatedAt())
                .build();
    }
}
