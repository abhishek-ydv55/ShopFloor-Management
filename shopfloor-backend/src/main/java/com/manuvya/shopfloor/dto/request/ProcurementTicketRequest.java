package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcurementTicketRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Department is required")
    private String department;

    @Builder.Default
    private String priority = "Medium";

    @NotBlank(message = "Description is required")
    private String description;
}
