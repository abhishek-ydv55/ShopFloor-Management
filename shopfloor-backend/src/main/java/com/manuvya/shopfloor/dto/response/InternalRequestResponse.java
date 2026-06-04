package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternalRequestResponse {
    private Long id;
    private String requestCode;
    private String item;
    private int qty;
    private String dept;
    private String priority;
    private String status;
    private String requestedBy;
    private String createdAt;
}
