package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.WorkerRequest;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.WorkerResponse;
import com.manuvya.shopfloor.service.WorkerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
@Tag(name = "Workers / Users")
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    @Operation(summary = "Create a new worker")
    public ResponseEntity<ApiResponse<WorkerResponse>> create(@Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Worker created", workerService.createWorker(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('admin','manager')")
    public ResponseEntity<ApiResponse<List<WorkerResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Workers fetched", workerService.getAllWorkers()));
    }

    @GetMapping("/{empId}")
    public ResponseEntity<ApiResponse<WorkerResponse>> getByEmpId(@PathVariable String empId) {
        return ResponseEntity.ok(ApiResponse.success("Worker fetched", workerService.getWorkerByEmpId(empId)));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<WorkerResponse>>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(ApiResponse.success("Workers by role", workerService.getWorkersByRole(role)));
    }

    @PutMapping("/{empId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<WorkerResponse>> update(
            @PathVariable String empId, @Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Worker updated", workerService.updateWorker(empId, request)));
    }

    @DeleteMapping("/{empId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String empId) {
        workerService.deleteWorker(empId);
        return ResponseEntity.ok(ApiResponse.success("Worker deleted"));
    }

    @PatchMapping("/{empId}/toggle-status")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable String empId) {
        workerService.toggleWorkerStatus(empId);
        return ResponseEntity.ok(ApiResponse.success("Worker status toggled"));
    }
}
