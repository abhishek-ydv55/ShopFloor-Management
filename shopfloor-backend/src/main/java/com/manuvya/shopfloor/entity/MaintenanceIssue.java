package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's MaintenanceIssue + Issue interfaces from ticket.model.ts and issue.service.ts */
@Entity
@Table(name = "maintenance_issues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String machine;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String severity;

    /** ISO date string — matches Angular's string date field */
    @Column(nullable = false, length = 20)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private IssueStatus status = IssueStatus.Open;

    @Column(name = "reported_by", length = 50)
    private String reportedBy;

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

    public enum IssueStatus {
        Open,
        // Stored as "In Progress" in Angular — we map on the DTO layer
        In_Progress,
        Closed
    }
}
