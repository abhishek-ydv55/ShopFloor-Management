package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.DashboardStatsResponse;
import com.manuvya.shopfloor.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get aggregate statistics for all dashboards")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", dashboardService.getDashboardStats()));
    }
}
