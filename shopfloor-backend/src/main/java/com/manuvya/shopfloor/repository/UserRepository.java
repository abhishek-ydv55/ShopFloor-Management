package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmpId(String empId);
    boolean existsByEmail(String email);
    boolean existsByEmpId(String empId);
    List<User> findByRole(String role);
    List<User> findByActiveTrue();
}
