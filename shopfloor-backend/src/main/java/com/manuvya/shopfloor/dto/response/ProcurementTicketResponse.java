package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcurementTicketResponse {
    private Long id;
    private String name;
    private String type;
    private String department;
    private String priority;
    private String status;
    private String createdAtDisplay;
    private String description;
    private String remark;
    private boolean sentToExternal;
}
