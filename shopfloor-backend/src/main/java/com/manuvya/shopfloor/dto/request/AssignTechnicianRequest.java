package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** Matches Angular's assign-technician.component.ts */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AssignTechnicianRequest {

    @NotBlank(message = "Ticket ID is required")
    private String ticketId;

    @NotBlank(message = "Technician is required")
    private String technicianEmpId;
}
