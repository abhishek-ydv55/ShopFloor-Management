package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/** Matches Angular's CreateTicket form: priority, description, department, currentDepartment */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TicketRequest {

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Current department is required")
    private String currentDepartment;

    private String approvalStatus;
    private boolean isClosable = true;
}
