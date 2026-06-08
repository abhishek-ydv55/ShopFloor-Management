package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** Matches Angular's TicketHistory interface */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TicketHistoryRequest {

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Action is required")
    private String action;

    private String comment;

    @NotBlank(message = "HandledBy is required")
    private String handledBy;

    @NotBlank(message = "Date is required")
    private String date;
}
