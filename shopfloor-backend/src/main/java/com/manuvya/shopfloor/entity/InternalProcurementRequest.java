package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's InternalRequest / ProcurementRequest from procurement.component.ts */
@Entity
@Table(name = "internal_procurement_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternalProcurementRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_code", unique = true, length = 20)
    private String requestCode;

    @Column(nullable = false, length = 100)
    private String item;

    @Column(nullable = false)
    private int qty;

    @Column(nullable = false, length = 50)
    private String dept;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Priority priority = Priority.Medium;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RequestStatus status = RequestStatus.Pending;

    @Column(name = "requested_by", length = 50)
    private String requestedBy;

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

    public enum Priority { Low, Medium, High }
    public enum RequestStatus { Pending, Approved, Rejected }
}
