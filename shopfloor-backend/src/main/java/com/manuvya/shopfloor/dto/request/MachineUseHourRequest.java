package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MachineUseHourRequest {

    @NotBlank(message = "Machine is required")
    private String machine;

    @Min(value = 1, message = "Hours must be at least 1")
    private int hours;

    @NotBlank(message = "Date is required")
    private String date;

    private String loggedBy;
}
