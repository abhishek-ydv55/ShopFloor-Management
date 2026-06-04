package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceTicketResponse {
    private Long id;
    private String ticketCode;
    private String machineId;
    private String machineName;
    private int hoursUsed;
    private int thresholdHours;
    private String priority;
    private String status;
    private String assignedTo;
    private String taskId;
    private String raisedAt;
    private String completedAt;
}
