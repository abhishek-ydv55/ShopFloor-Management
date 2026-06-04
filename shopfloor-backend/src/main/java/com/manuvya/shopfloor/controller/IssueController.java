package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.request.IssueRequest;
import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.IssueResponse;
import com.manuvya.shopfloor.service.IssueService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Maintenance Issues")
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<ApiResponse<IssueResponse>> create(@Valid @RequestBody IssueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Issue created", issueService.createIssue(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Issues fetched", issueService.getAllIssues()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Issue fetched", issueService.getIssueById(id)));
    }

    @GetMapping("/machine/{machine}")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getByMachine(@PathVariable String machine) {
        return ResponseEntity.ok(ApiResponse.success("Issues by machine", issueService.getIssuesByMachine(machine)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<IssueResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Issue status updated",
                issueService.updateIssueStatus(id, body.get("status"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.ok(ApiResponse.success("Issue deleted"));
    }
}
