package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.SpareRequestDto;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.SpareRequestResponse;
import com.manuvya.shopfloor.service.SpareRequestService;
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
@RequestMapping("/api/spare-requests")
@RequiredArgsConstructor
@Tag(name = "Spare Requests")
public class SpareRequestController {

    private final SpareRequestService spareRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<SpareRequestResponse>> create(@Valid @RequestBody SpareRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Spare request created", spareRequestService.createRequest(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpareRequestResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Spare requests fetched", spareRequestService.getAllRequests()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SpareRequestResponse>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success("Spare requests fetched",
                spareRequestService.getRequestsByStatus(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Spare request fetched", spareRequestService.getRequestById(id)));
    }

    @GetMapping("/user/{empId}")
    public ResponseEntity<ApiResponse<List<SpareRequestResponse>>> getByUser(@PathVariable String empId) {
        return ResponseEntity.ok(ApiResponse.success("Requests by user", spareRequestService.getRequestsByUser(empId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                spareRequestService.updateStatus(id, body.get("status"))));
    }

    @PostMapping("/{id}/procurement-approve")
    @Operation(summary = "Procurement approves – item confirmed in inventory, forwarded to Inventory team")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> procurementApprove(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Approved by Procurement, forwarded to Inventory",
                spareRequestService.procurementApprove(id)));
    }

    @PostMapping("/{id}/procurement-external")
    @Operation(summary = "Procurement raises external request – item not available in inventory")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> procurementSendToExternal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sent to External Procurement",
                spareRequestService.procurementSendToExternal(id)));
    }

    @PostMapping("/{id}/inventory-external")
    @Operation(summary = "Inventory raises external procurement — item not available in stock")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> inventorySendToExternal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sent to External Procurement",
                spareRequestService.inventorySendToExternal(id)));
    }

    @PostMapping("/{id}/fulfill")
    @Operation(summary = "Inventory deducts stock and fulfils the request")
    public ResponseEntity<ApiResponse<SpareRequestResponse>> fulfill(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request fulfilled from inventory",
                spareRequestService.fulfillRequest(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        spareRequestService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Spare request deleted"));
    }

    @DeleteMapping("/completed")
    @Operation(summary = "Delete all terminal-state spare requests (Fulfilled / SentToExternal / Rejected)")
    public ResponseEntity<ApiResponse<Void>> deleteCompleted() {
        spareRequestService.deleteCompleted();
        return ResponseEntity.ok(ApiResponse.success("Completed spare requests cleared"));
    }
}
