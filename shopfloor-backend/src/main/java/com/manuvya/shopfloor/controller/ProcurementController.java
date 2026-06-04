package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.InternalProcurementRequest;
import com.manuvya.shopfloor.dto.request.ProcurementTicketRequest;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.ExternalRequestResponse;
import com.manuvya.shopfloor.dto.response.InternalRequestResponse;
import com.manuvya.shopfloor.dto.response.ProcurementTicketResponse;
import com.manuvya.shopfloor.service.ProcurementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/procurement")
@RequiredArgsConstructor
@Tag(name = "Procurement")
public class ProcurementController {

    private final ProcurementService procurementService;

    // ── Department Tickets ────────────────────────────────────────────────

    @PostMapping("/tickets")
    @Operation(summary = "Create a new department procurement ticket")
    public ResponseEntity<ApiResponse<ProcurementTicketResponse>> createTicket(
            @Valid @RequestBody ProcurementTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Ticket created", procurementService.createTicket(request)));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<ProcurementTicketResponse>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success("Procurement tickets", procurementService.getAllTickets()));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<ProcurementTicketResponse>> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", procurementService.getTicketById(id)));
    }

    @PatchMapping("/tickets/{id}/remark")
    public ResponseEntity<ApiResponse<ProcurementTicketResponse>> addRemark(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Remark added",
                procurementService.addRemark(id, body.get("remark"))));
    }

    @PostMapping("/tickets/{id}/send-to-external")
    public ResponseEntity<ApiResponse<ProcurementTicketResponse>> sendToExternal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sent to external",
                procurementService.sendToExternal(id)));
    }

    @GetMapping("/tickets/external")
    public ResponseEntity<ApiResponse<List<ProcurementTicketResponse>>> getExternalTickets() {
        return ResponseEntity.ok(ApiResponse.success("External tickets",
                procurementService.getExternalTickets()));
    }

    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        procurementService.deleteProcurementTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted"));
    }

    // ── Internal Requests ────────────────────────────────────────────────

    @PostMapping("/internal-requests")
    public ResponseEntity<ApiResponse<InternalRequestResponse>> createInternalRequest(
            @Valid @RequestBody InternalProcurementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Request created",
                        procurementService.createInternalRequest(request)));
    }

    @GetMapping("/internal-requests")
    public ResponseEntity<ApiResponse<List<InternalRequestResponse>>> getAllInternalRequests() {
        return ResponseEntity.ok(ApiResponse.success("Internal requests",
                procurementService.getAllInternalRequests()));
    }

    @PostMapping("/internal-requests/{id}/approve")
    @Operation(summary = "Approve internal request; auto-routes to external if stock is insufficient")
    public ResponseEntity<ApiResponse<InternalRequestResponse>> approveInternalRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request approved",
                procurementService.approveInternalRequest(id)));
    }

    @PatchMapping("/internal-requests/{id}/status")
    public ResponseEntity<ApiResponse<InternalRequestResponse>> updateInternalStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                procurementService.updateInternalRequestStatus(id, body.get("status"))));
    }

    @DeleteMapping("/internal-requests/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInternalRequest(@PathVariable Long id) {
        procurementService.deleteInternalRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Internal request deleted"));
    }

    @DeleteMapping("/external-requests/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExternalRequest(@PathVariable Long id) {
        procurementService.deleteExternalRequest(id);
        return ResponseEntity.ok(ApiResponse.success("External request deleted"));
    }

    // ── External Requests ────────────────────────────────────────────────

    @GetMapping("/external-requests")
    public ResponseEntity<ApiResponse<List<ExternalRequestResponse>>> getAllExternalRequests() {
        return ResponseEntity.ok(ApiResponse.success("External requests",
                procurementService.getAllExternalRequests()));
    }

    @PatchMapping("/external-requests/{id}/status")
    public ResponseEntity<ApiResponse<ExternalRequestResponse>> updateExternalStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                procurementService.updateExternalRequestStatus(id, body.get("status"))));
    }

    // ── Bulk Delete (Cleanup) ───────────────────────────────────────────────

    @DeleteMapping("/tickets/completed")
    @Operation(summary = "Delete all Closed department tickets")
    public ResponseEntity<ApiResponse<Void>> deleteCompletedTickets() {
        procurementService.deleteCompletedTickets();
        return ResponseEntity.ok(ApiResponse.success("Closed tickets cleared"));
    }

    @DeleteMapping("/internal-requests/completed")
    @Operation(summary = "Delete all Approved/Rejected internal requests")
    public ResponseEntity<ApiResponse<Void>> deleteCompletedInternalRequests() {
        procurementService.deleteCompletedInternalRequests();
        return ResponseEntity.ok(ApiResponse.success("Completed internal requests cleared"));
    }

    @DeleteMapping("/external-requests/completed")
    @Operation(summary = "Delete all Approved/Rejected external requests")
    public ResponseEntity<ApiResponse<Void>> deleteCompletedExternalRequests() {
        procurementService.deleteCompletedExternalRequests();
        return ResponseEntity.ok(ApiResponse.success("Completed external requests cleared"));
    }
}
