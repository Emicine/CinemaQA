package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.auth.AuthRequestDTO;
import com.redcinema.mrs.dto.auth.AuthResponseDTO;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import com.redcinema.mrs.service.auth.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final AuthenticationManager authenticationManager;

    /**
     * POST /auth/signup
     * Creates a new ROLE_USER account and returns a JWT.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> signUp(@Valid @RequestBody UserRequestDTO dto) {
        String token = authenticationService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponseDTO.builder().authenticationToken(token).build());
    }

    /**
     * POST /auth/login
     * Authenticates credentials and returns a fresh JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO dto) {
        // Throws BadCredentialsException (→ 401) if credentials are wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUserName(), dto.getPassword()));

        String token = authenticationService.generateTokenForUser(dto.getUserName());
        return ResponseEntity.ok(AuthResponseDTO.builder().authenticationToken(token).build());
    }
}
