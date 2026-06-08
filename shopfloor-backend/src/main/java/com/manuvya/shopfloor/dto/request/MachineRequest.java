package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/** Matches Angular's Machine interface in manage-machines.component.ts */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MachineRequest {

    private String id;

    @NotBlank(message = "Machine name is required")
    private String name;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(Active|Maintenance|Inactive)$", message = "Status must be Active, Maintenance, or Inactive")
    private String status;

    @Min(value = 1, message = "Threshold hours must be at least 1")
    private int thresholdHours;

    @NotBlank(message = "Location is required")
    private String location;
}
