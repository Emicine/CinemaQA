package com.redcinema.mrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(
    name = "app_users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_username",  columnNames = "username"),
        @UniqueConstraint(name = "uk_useremail", columnNames = "user_email")
    }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@ToString(exclude = "password")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus userStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime userCreatedAt;

    @Column(nullable = false)
    private LocalDateTime userUpdatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole userRole;

    // ── UserDetails ──────────────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(userRole.name()));
    }

    @Override
    public boolean isAccountNonExpired()  { return userStatus != UserStatus.DELETED; }
    @Override
    public boolean isAccountNonLocked()   { return userStatus != UserStatus.INACTIVE; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled()            { return userStatus == UserStatus.ACTIVE; }

    @PrePersist
    protected void onCreate() {
        userCreatedAt = LocalDateTime.now();
        userUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        userUpdatedAt = LocalDateTime.now();
    }
}
