package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.AssignTechnicianRequest;
import com.manuvya.shopfloor.dto.request.TicketHistoryRequest;
import com.manuvya.shopfloor.dto.request.TicketRequest;
import com.manuvya.shopfloor.dto.response.TicketResponse;
import com.manuvya.shopfloor.dto.response.TicketStatsResponse;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketRequest request);
    TicketResponse getTicketById(String id);
    List<TicketResponse> getAllTickets();
    List<TicketResponse> getTicketsByDepartment(String department);
    List<TicketResponse> getTicketsByTechnician(String technicianEmpId);
    TicketResponse updateTicketStatus(String id, String status, String comment, String handledBy);
    TicketResponse updateApprovalStatus(String id, String approvalStatus);
    TicketResponse assignTechnician(AssignTechnicianRequest request);
    TicketResponse addHistory(String ticketId, TicketHistoryRequest request);
    TicketStatsResponse getTicketStats();
    void deleteTicket(String id);
}
