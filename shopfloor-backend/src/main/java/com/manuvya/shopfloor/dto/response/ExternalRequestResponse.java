package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExternalRequestResponse {
    private Long id;
    private String requestCode;
    private Long procurementTicketId;
    private String procurementTicketName;
    private String name;
    private String department;
    private String priority;
    private String status;
    private String requestedDate;
    private String vendor;
}
