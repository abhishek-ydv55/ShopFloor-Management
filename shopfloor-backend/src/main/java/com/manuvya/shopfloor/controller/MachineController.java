package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.MachineRequest;
import com.manuvya.shopfloor.dto.request.MachineUseHourRequest;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.MachineResponse;
import com.manuvya.shopfloor.dto.response.MachineStatsResponse;
import com.manuvya.shopfloor.dto.response.MachineUseHourResponse;
import com.manuvya.shopfloor.service.MachineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
@Tag(name = "Machines")
public class MachineController {

    private final MachineService machineService;

    @PostMapping
    @Operation(summary = "Create a new machine")
    public ResponseEntity<ApiResponse<MachineResponse>> create(@Valid @RequestBody MachineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Machine created", machineService.createMachine(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Machines fetched", machineService.getAllMachines()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Machine fetched", machineService.getMachineById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineResponse>> update(
            @PathVariable String id, @Valid @RequestBody MachineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Machine updated", machineService.updateMachine(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        machineService.deleteMachine(id);
        return ResponseEntity.ok(ApiResponse.success("Machine deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<MachineStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Machine stats", machineService.getMachineStats()));
    }

    @PostMapping("/hours")
    @Operation(summary = "Log machine use hours")
    public ResponseEntity<ApiResponse<MachineUseHourResponse>> logHours(
            @Valid @RequestBody MachineUseHourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Hours logged", machineService.logMachineHours(request)));
    }

    @GetMapping("/hours")
    public ResponseEntity<ApiResponse<List<MachineUseHourResponse>>> getAllHours() {
        return ResponseEntity.ok(ApiResponse.success("Hour logs fetched", machineService.getAllHourLogs()));
    }

    @GetMapping("/{id}/hours")
    public ResponseEntity<ApiResponse<List<MachineUseHourResponse>>> getHoursByMachine(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Hours by machine", machineService.getHoursByMachine(id)));
    }

    @PostMapping("/{id}/reset-hours")
    @Operation(summary = "Reset machine hours to zero after maintenance completion")
    public ResponseEntity<ApiResponse<MachineResponse>> resetHours(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Machine hours reset", machineService.resetMachineHours(id)));
    }
}
