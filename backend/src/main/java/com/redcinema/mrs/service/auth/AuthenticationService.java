package com.redcinema.mrs.service.auth;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.user.UserRequestDTO;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.exception.UserConflictException;
import com.redcinema.mrs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserService userService;
    private final JWTService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Registers a new user, encodes the password, and returns a JWT.
     */
    @Transactional
    public String signUp(UserRequestDTO dto) {
        if (userService.existsByUsernameOrEmail(dto.getUsername(), dto.getUserEmail())) {
            throw new UserConflictException(
                    ExceptionConstants.USER_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }
        // Encode password before persisting
        dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        User newUser = userService.createUser(dto);
        return jwtService.generateToken(newUser);
    }

    /**
     * Generates a fresh JWT for an already-authenticated user (called after
     * AuthenticationManager.authenticate() succeeds in the controller).
     */
    public String generateTokenForUser(String username) {
        User user = userService.getUserByUsername(username);
        return jwtService.generateToken(user);
    }
}
