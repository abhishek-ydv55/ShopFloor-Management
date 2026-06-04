package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/** Matches Angular's Procurement Request form fields */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InternalProcurementRequest {

    @NotBlank(message = "Item is required")
    private String item;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int qty;

    @NotBlank(message = "Department is required")
    private String dept;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "^(Low|Medium|High)$", message = "Invalid priority")
    private String priority;

    private String requestedBy;
}
