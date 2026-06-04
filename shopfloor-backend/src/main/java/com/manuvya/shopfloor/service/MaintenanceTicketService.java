package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.response.MaintenanceTicketResponse;

import java.util.List;

public interface MaintenanceTicketService {
    MaintenanceTicketResponse createTicketIfNotExists(String machineId, String machineName,
                                                       int hoursUsed, int thresholdHours);
    List<MaintenanceTicketResponse> getAllTickets();
    MaintenanceTicketResponse getById(Long id);
    MaintenanceTicketResponse assignTechnician(Long id, String technicianName, String taskId);
    MaintenanceTicketResponse updateStatus(Long id, String status);
    MaintenanceTicketResponse complete(Long id);
    void deleteTicket(Long id);
    void deleteCompleted();
    long countByStatus(String status);
}
