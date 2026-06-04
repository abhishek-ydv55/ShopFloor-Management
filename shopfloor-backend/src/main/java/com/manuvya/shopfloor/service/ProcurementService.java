package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.response.ExternalRequestResponse;
import com.manuvya.shopfloor.dto.response.InternalRequestResponse;
import com.manuvya.shopfloor.dto.response.ProcurementTicketResponse;

import java.util.List;

public interface ProcurementService {
    ProcurementTicketResponse createTicket(com.manuvya.shopfloor.dto.request.ProcurementTicketRequest request);
    List<ProcurementTicketResponse> getAllTickets();
    ProcurementTicketResponse getTicketById(Long id);
    ProcurementTicketResponse addRemark(Long ticketId, String remark);
    ProcurementTicketResponse sendToExternal(Long ticketId);
    List<ProcurementTicketResponse> getExternalTickets();

    InternalRequestResponse createInternalRequest(
            com.manuvya.shopfloor.dto.request.InternalProcurementRequest request);
    List<InternalRequestResponse> getAllInternalRequests();
    InternalRequestResponse approveInternalRequest(Long id);
    InternalRequestResponse updateInternalRequestStatus(Long id, String status);

    List<ExternalRequestResponse> getAllExternalRequests();
    ExternalRequestResponse updateExternalRequestStatus(Long id, String status);
    void deleteExternalRequest(Long id);

    void deleteProcurementTicket(Long id);
    void deleteCompletedTickets();
    void deleteCompletedInternalRequests();
    void deleteCompletedExternalRequests();
    void deleteInternalRequest(Long id);
}
