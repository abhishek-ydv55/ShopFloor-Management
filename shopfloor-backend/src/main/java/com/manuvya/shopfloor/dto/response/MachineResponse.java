package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MachineResponse {
    private String id;
    private String name;
    private String status;
    private int hours;
    private int thresholdHours;
    private String location;
}
