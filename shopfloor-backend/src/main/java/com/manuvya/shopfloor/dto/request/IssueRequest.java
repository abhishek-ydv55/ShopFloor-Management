package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** Matches Angular's issue-report form: machine, type, description, severity, date */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class IssueRequest {

    @NotBlank(message = "Machine is required")
    private String machine;

    @NotBlank(message = "Issue type is required")
    private String type;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Severity is required")
    private String severity;

    @NotBlank(message = "Date is required")
    private String date;

    private String reportedBy;
}
