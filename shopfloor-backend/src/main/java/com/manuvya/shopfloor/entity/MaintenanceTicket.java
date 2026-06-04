package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 20)
    private String ticketCode;

    @Column(name = "machine_id", nullable = false, length = 20)
    private String machineId;

    @Column(name = "machine_name", nullable = false, length = 100)
    private String machineName;

    @Column(name = "hours_used", nullable = false)
    private int hoursUsed;

    @Column(name = "threshold_hours", nullable = false)
    private int thresholdHours;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String priority = "High";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.Open;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "task_id", length = 30)
    private String taskId;

    @Column(name = "raised_at", nullable = false, updatable = false)
    private LocalDateTime raisedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        raisedAt = LocalDateTime.now();
    }

    public enum TicketStatus { Open, Assigned, In_Progress, Completed }
}
