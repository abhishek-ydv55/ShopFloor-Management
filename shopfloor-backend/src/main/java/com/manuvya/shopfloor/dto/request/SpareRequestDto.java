package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/** Matches Angular's spare-requests.component.ts form */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SpareRequestDto {

    @NotBlank(message = "Item is required")
    private String item;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int qty;

    @NotBlank(message = "Machine is required")
    private String machine;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "^(Low|Medium|High)$", message = "Invalid priority")
    private String priority;

    private String notes;
    private String requestedBy;
}
