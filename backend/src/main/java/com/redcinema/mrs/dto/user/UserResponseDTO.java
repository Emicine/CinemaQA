package com.redcinema.mrs.dto.user;

import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDTO {
    private Long userId;
    private String userName;
    private String firstName;
    private String lastName;
    private String userEmail;
    private UserRole userRole;
    private UserStatus userStatus;
    private LocalDateTime userCreatedAt;
    private LocalDateTime userUpdatedAt;
}
