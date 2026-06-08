package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's Machine interface in manage-machines.component.ts */
@Entity
@Table(name = "machines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Machine {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MachineStatus status;

    /** Cumulative usage hours — updated every time supervisor logs daily hours */
    @Column(nullable = false)
    @Builder.Default
    private int hours = 0;

    /** Threshold hours set by maintenance manager; crossing this auto-triggers Maintenance status */
    @Column(name = "threshold_hours", nullable = false)
    @Builder.Default
    private int thresholdHours = 0;

    @Column(nullable = false, length = 50)
    private String location;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MachineStatus { Active, Maintenance, Inactive }
}
