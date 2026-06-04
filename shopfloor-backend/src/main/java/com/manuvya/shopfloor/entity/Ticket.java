package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maps to Angular's Ticket interface.
 * Priority: High | Medium | Low
 * Status: Open | Pending | Closed
 * ApprovalStatus: Approved | Pending | Rejected
 */
@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    @Id
    @Column(nullable = false, unique = true, length = 20)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 10)
    private ApprovalStatus approvalStatus;

    @Column(name = "current_department", nullable = false, length = 50)
    private String currentDepartment;

    @Column(name = "is_closable", nullable = false)
    @Builder.Default
    private boolean isClosable = true;

    @Column(length = 500)
    private String description;

    /** Original department that raised the ticket */
    @Column(length = 50)
    private String department;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Assigned technician's empId (from manager's assign-technician flow) */
    @Column(name = "assigned_technician", length = 50)
    private String assignedTechnician;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<TicketHistory> history = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Priority { High, Medium, Low }
    public enum TicketStatus { Open, Pending, Closed }
    public enum ApprovalStatus { Approved, Pending, Rejected }
}
