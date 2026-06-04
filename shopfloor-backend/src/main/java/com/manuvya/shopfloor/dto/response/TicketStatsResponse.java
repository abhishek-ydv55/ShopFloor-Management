package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketStatsResponse {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long pendingApproval;
    private long approved;
    private long rejected;
}
