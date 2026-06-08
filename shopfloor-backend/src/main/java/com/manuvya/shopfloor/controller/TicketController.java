package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.AssignTechnicianRequest;
import com.manuvya.shopfloor.dto.request.TicketHistoryRequest;
import com.manuvya.shopfloor.dto.request.TicketRequest;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.TicketResponse;
import com.manuvya.shopfloor.dto.response.TicketStatsResponse;
import com.manuvya.shopfloor.service.TicketService;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @Operation(summary = "Create a new ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> create(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Ticket created", ticketService.createTicket(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched", ticketService.getAllTickets()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", ticketService.getTicketById(id)));
    }

    @GetMapping("/department/{dept}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getByDept(@PathVariable String dept) {
        return ResponseEntity.ok(ApiResponse.success("Tickets by department", ticketService.getTicketsByDepartment(dept)));
    }

    @GetMapping("/technician/{empId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getByTechnician(@PathVariable String empId) {
        return ResponseEntity.ok(ApiResponse.success("Tickets by technician", ticketService.getTicketsByTechnician(empId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                ticketService.updateTicketStatus(id, body.get("status"), body.get("comment"), body.get("handledBy"))));
    }

    @PatchMapping("/{id}/approval")
    public ResponseEntity<ApiResponse<TicketResponse>> updateApproval(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Approval updated",
                ticketService.updateApprovalStatus(id, body.get("approvalStatus"))));
    }

    @PostMapping("/assign-technician")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTechnician(
            @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Technician assigned",
                ticketService.assignTechnician(request)));
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<ApiResponse<TicketResponse>> addHistory(
            @PathVariable String id, @Valid @RequestBody TicketHistoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("History added",
                ticketService.addHistory(id, request)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TicketStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Ticket stats", ticketService.getTicketStats()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted"));
    }
}
