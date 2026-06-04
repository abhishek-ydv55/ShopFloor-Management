package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsResponse {
    private TicketStatsResponse ticketStats;
    private MachineStatsResponse machineStats;
    private long totalWorkers;
    private long totalInventoryItems;
    private long lowStockItems;
    private long pendingSpareRequests;
    private long pendingProcurementRequests;
    private long openIssues;
}
