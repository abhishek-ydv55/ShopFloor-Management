package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's MachineUseHour interface from ticket.model.ts */
@Entity
@Table(name = "machine_use_hours")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MachineUseHour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String machine;

    @Column(nullable = false)
    private int hours;

    /** ISO date string — matches Angular's string date field */
    @Column(nullable = false, length = 20)
    private String date;

    @Column(name = "logged_by", length = 50)
    private String loggedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
