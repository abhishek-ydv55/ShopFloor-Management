package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a system user (worker/employee).
 * Maps to Angular's Worker model + auth email/role mapping.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "emp_id"),
        @UniqueConstraint(columnNames = "email")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_id", nullable = false, unique = true, length = 20)
    private String empId;

    @Column(nullable = false, length = 100)
    private String name;

    /** Matches Angular role values: admin, manager, supervisor, technician, maintenance, procurement, inventory, worker */
    @Column(nullable = false, length = 30)
    private String role;

    /** Login email — maps to Angular ROLE_MAP and ROUTE_MAP */
    @Column(unique = true, length = 100)
    private String email;

    /** BCrypt-encoded password */
    @Column(nullable = false)
    private String password;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
