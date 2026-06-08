package com.manuvya.shopfloor.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketResponse {
    private String id;
    private String priority;
    private String status;
    private String approvalStatus;
    private String currentDepartment;
    private boolean isClosable;
    private String description;
    private String department;
    private String assignedTechnician;
    private String createdAt;
    private String updatedAt;
    private List<TicketHistoryResponse> history;
}
