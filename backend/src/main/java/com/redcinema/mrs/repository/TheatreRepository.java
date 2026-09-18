package com.redcinema.mrs.repository;
import com.redcinema.mrs.entity.Theatre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface TheatreRepository extends JpaRepository<Theatre, Long> {}
