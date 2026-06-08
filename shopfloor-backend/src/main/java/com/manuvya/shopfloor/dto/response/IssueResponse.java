package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IssueResponse {
    private Long id;
    private String machine;
    private String type;
    private String description;
    private String severity;
    private String date;
    private String status;
    private String reportedBy;
    private String createdAt;
}
