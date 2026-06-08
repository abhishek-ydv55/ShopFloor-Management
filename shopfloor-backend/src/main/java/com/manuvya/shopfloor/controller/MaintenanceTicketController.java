package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.MaintenanceTicketResponse;
import com.manuvya.shopfloor.service.MaintenanceTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance-tickets")
@RequiredArgsConstructor
@Tag(name = "Maintenance Tickets")
public class MaintenanceTicketController {

    private final MaintenanceTicketService service;

    @GetMapping
    @Operation(summary = "Get all maintenance tickets ordered by date desc")
    public ResponseEntity<ApiResponse<List<MaintenanceTicketResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Maintenance tickets fetched", service.getAllTickets()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceTicketResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", service.getById(id)));
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign a technician to a maintenance ticket and create a task")
    public ResponseEntity<ApiResponse<MaintenanceTicketResponse>> assign(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Technician assigned",
                service.assignTechnician(id, body.get("technicianName"), body.get("taskId"))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MaintenanceTicketResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                service.updateStatus(id, body.get("status"))));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark maintenance ticket as completed and reset machine hours")
    public ResponseEntity<ApiResponse<MaintenanceTicketResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket completed", service.complete(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted"));
    }

    @DeleteMapping("/completed")
    @Operation(summary = "Delete all completed maintenance tickets")
    public ResponseEntity<ApiResponse<Void>> deleteCompleted() {
        service.deleteCompleted();
        return ResponseEntity.ok(ApiResponse.success("Completed tickets cleared"));
    }
}
