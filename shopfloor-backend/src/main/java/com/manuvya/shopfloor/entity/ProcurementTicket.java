package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's ProcurementTicket interface in procurement.component.ts */
@Entity
@Table(name = "procurement_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcurementTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 20)
    private String priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private TicketStatus status = TicketStatus.Open;

    @Column(name = "created_at_display", length = 20)
    private String createdAtDisplay;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String remark;

    @Column(name = "sent_to_external", nullable = false)
    @Builder.Default
    private boolean sentToExternal = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TicketStatus { Open, Pending, Closed }
}
