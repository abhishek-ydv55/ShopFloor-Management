package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketHistoryResponse {
    private Long id;
    private String ticketId;
    private String department;
    private String action;
    private String comment;
    private String handledBy;
    private String date;
    private String createdAt;
}
