package com.redcinema.mrs.repository;

import com.redcinema.mrs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrUserEmail(String username, String userEmail);
    boolean existsByUsernameOrUserEmail(String username, String userEmail);
}
