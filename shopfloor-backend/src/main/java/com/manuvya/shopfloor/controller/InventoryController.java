package com.manuvya.shopfloor.controller;

import com.manuvya.shopfloor.dto.response.ApiResponse;
import com.manuvya.shopfloor.dto.response.InventoryItemResponse;
import com.manuvya.shopfloor.entity.InventoryItem;
import com.manuvya.shopfloor.service.InventoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemResponse>> create(@RequestBody InventoryItem item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Item created", inventoryService.addItem(item)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Inventory fetched", inventoryService.getAllItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Item fetched", inventoryService.getItemById(id)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success("Low stock items", inventoryService.getLowStockItems()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> update(
            @PathVariable Long id, @RequestBody InventoryItem item) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", inventoryService.updateItem(id, item)));
    }

    @PatchMapping("/{id}/qty")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> updateQty(
            @PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(ApiResponse.success("Quantity updated",
                inventoryService.updateQty(id, body.get("qty"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted"));
    }
}
