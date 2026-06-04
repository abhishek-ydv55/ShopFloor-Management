package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's TicketHistory interface. ManyToOne with Ticket. */
@Entity
@Table(name = "ticket_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 500)
    private String comment;

    @Column(name = "handled_by", nullable = false, length = 100)
    private String handledBy;

    /** ISO date string — matches Angular's string date field */
    @Column(nullable = false, length = 20)
    private String date;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
