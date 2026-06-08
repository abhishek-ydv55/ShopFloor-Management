package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.response.InventoryItemResponse;
import com.manuvya.shopfloor.entity.InventoryItem;

import java.util.List;

public interface InventoryService {
    InventoryItemResponse addItem(InventoryItem item);
    InventoryItemResponse getItemById(Long id);
    List<InventoryItemResponse> getAllItems();
    List<InventoryItemResponse> getLowStockItems();
    InventoryItemResponse updateItem(Long id, InventoryItem item);
    InventoryItemResponse updateQty(Long id, int qty);
    void deleteItem(Long id);
}
