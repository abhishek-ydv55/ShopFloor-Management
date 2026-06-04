package com.manuvya.shopfloor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Maps to Angular's ExternalEntry from procurement.component.ts */
@Entity
@Table(name = "external_procurement_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExternalProcurementRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_code", unique = true, length = 20)
    private String requestCode;

    /** References the ProcurementTicket that was sent to external */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procurement_ticket_id")
    private ProcurementTicket procurementTicket;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 20)
    private String priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RequestStatus status = RequestStatus.Pending;

    @Column(name = "requested_date", length = 20)
    private String requestedDate;

    @Column(length = 100)
    private String vendor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RequestStatus { Pending, Approved, Rejected }
}
