package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MachineStatsResponse {
    private long total;
    private long active;
    private long maintenance;
    private long inactive;
    private long totalHours;
}
