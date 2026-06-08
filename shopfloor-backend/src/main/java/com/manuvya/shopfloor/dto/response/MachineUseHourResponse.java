package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MachineUseHourResponse {
    private Long id;
    private String machine;
    private int hours;
    private String date;
    private String loggedBy;
}
