package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.SpareRequestDto;
import com.manuvya.shopfloor.dto.response.SpareRequestResponse;

import java.util.List;

public interface SpareRequestService {
    SpareRequestResponse createRequest(SpareRequestDto request);
    SpareRequestResponse getRequestById(Long id);
    List<SpareRequestResponse> getAllRequests();
    List<SpareRequestResponse> getRequestsByStatus(String status);
    List<SpareRequestResponse> getRequestsByUser(String empId);
    SpareRequestResponse updateStatus(Long id, String status);

    /** Procurement: confirm stock available – forwards request to inventory team */
    SpareRequestResponse procurementApprove(Long id);

    /** Procurement: stock unavailable – creates an external procurement request */
    SpareRequestResponse procurementSendToExternal(Long id);

    /** Inventory: stock unavailable – raise external procurement request */
    SpareRequestResponse inventorySendToExternal(Long id);

    /** Inventory: deduct matching stock item and close the request */
    SpareRequestResponse fulfillRequest(Long id);

    void deleteRequest(Long id);
    void deleteCompleted();
}
